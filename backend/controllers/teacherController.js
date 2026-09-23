const { pool } = require("../config/db");
const bcrypt = require("bcryptjs");

// GET /api/teachers - Get all teachers with their details
async function getTeachers(req, res) {
  try {
    const query = `
      SELECT 
        t.id AS teacher_id,
        t.qualifications,
        t.specialization,
        t.years_of_experience,
        t.created_at AS teacher_created_at,
        u.id AS user_id,
        u.name,
        u.email,
        u.role,
        u.created_at AS user_created_at
      FROM teachers t
      JOIN users u ON u.id = t.user_id
      WHERE u.role = 'teacher'
      ORDER BY u.name ASC
    `;
    
    const [rows] = await pool.execute(query);
    res.json({ teachers: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load teachers.", error: error.message });
  }
}

// GET /api/teachers/:id - Get specific teacher with assignments
async function getTeacherById(req, res) {
  try {
    const { id } = req.params;
    
    // Get teacher basic info
    const [teacherRows] = await pool.execute(
      `SELECT 
        t.id AS teacher_id,
        t.qualifications,
        t.specialization,
        t.years_of_experience,
        t.created_at AS teacher_created_at,
        u.id AS user_id,
        u.name,
        u.email,
        u.role,
        u.created_at AS user_created_at
       FROM teachers t
       JOIN users u ON u.id = t.user_id
       WHERE t.id = ? AND u.role = 'teacher'`,
      [id]
    );

    if (teacherRows.length === 0) {
      return res.status(404).json({ message: "Teacher not found." });
    }

    // Get teacher assignments
    const [assignmentRows] = await pool.execute(
      `SELECT 
        ta.id AS assignment_id,
        ta.academic_year,
        ta.is_active,
        ta.assigned_at,
        g.id AS grade_id,
        g.name AS grade_name,
        g.description AS grade_description,
        sj.id AS subject_id,
        sj.name AS subject_name,
        sj.code AS subject_code,
        sc.id AS section_id,
        sc.name AS section_name,
        sc.capacity AS section_capacity,
        ua.name AS assigned_by_name
       FROM teacher_assignments ta
       JOIN grades g ON g.id = ta.grade_id
       JOIN subjects sj ON sj.id = ta.subject_id
       JOIN sections sc ON sc.id = ta.section_id
       JOIN users ua ON ua.id = ta.assigned_by
       WHERE ta.teacher_id = ?
       ORDER BY ta.academic_year DESC, ta.is_active DESC`,
      [id]
    );

    // Get students linked to this teacher through assignments
    const [studentRows] = await pool.execute(
      `SELECT DISTINCT
        ts.id AS link_id,
        ts.linked_at,
        s.id AS student_id,
        stu.grade AS student_grade,
        stu.status AS student_status,
        u.id AS student_user_id,
        u.name AS student_name,
        u.email AS student_email,
        ta.academic_year,
        g.name AS grade_name,
        sj.name AS subject_name,
        sc.name AS section_name
       FROM teacher_students ts
       JOIN teacher_assignments ta ON ta.id = ts.teacher_assignment_id
       JOIN students s ON s.id = ts.student_id
       JOIN users u ON u.id = s.user_id
       JOIN grades g ON g.id = ta.grade_id
       JOIN subjects sj ON sj.id = ta.subject_id
       JOIN sections sc ON sc.id = ta.section_id
       WHERE ta.teacher_id = ?
       ORDER BY ta.academic_year DESC, u.name ASC`,
      [id]
    );

    res.json({ 
      teacher: teacherRows[0],
      assignments: assignmentRows,
      students: studentRows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load teacher details.", error: error.message });
  }
}

// POST /api/teachers - Create a new teacher
async function createTeacher(req, res) {
  const connection = await pool.getConnection();
  
  try {
    const { name, email, password, qualifications, specialization, years_of_experience } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Start transaction
    await connection.beginTransaction();

    try {
      // Create user first
      const [userResult] = await connection.execute(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'teacher')",
        [name, email, hashedPassword]
      );

      const userId = userResult.insertId;

      // Create teacher record
      const [teacherResult] = await connection.execute(
        "INSERT INTO teachers (user_id, qualifications, specialization, years_of_experience) VALUES (?, ?, ?, ?)",
        [userId, qualifications || null, specialization || null, years_of_experience || 0]
      );

      await connection.commit();
      
      res.status(201).json({ 
        message: "Teacher created successfully.",
        teacher_id: teacherResult.insertId
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: "Email already exists." });
    }
    res.status(500).json({ message: "Could not create teacher.", error: error.message });
  } finally {
    connection.release();
  }
}

// PUT /api/teachers/:id - Update teacher information
async function updateTeacher(req, res) {
  const connection = await pool.getConnection();
  
  try {
    const { id } = req.params;
    const { name, email, qualifications, specialization, years_of_experience } = req.body;

    // Start transaction
    await connection.beginTransaction();

    try {
      // Get user_id from teacher table
      const [teacherRows] = await connection.execute(
        "SELECT user_id FROM teachers WHERE id = ?",
        [id]
      );

      if (teacherRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: "Teacher not found." });
      }

      const userId = teacherRows[0].user_id;

      // Update user info
      if (name || email) {
        await connection.execute(
          "UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email) WHERE id = ?",
          [name, email, userId]
        );
      }

      // Update teacher info
      await connection.execute(
        `UPDATE teachers 
         SET qualifications = COALESCE(?, qualifications),
             specialization = COALESCE(?, specialization),
             years_of_experience = COALESCE(?, years_of_experience)
         WHERE id = ?`,
        [qualifications, specialization, years_of_experience, id]
      );

      await connection.commit();
      res.json({ message: "Teacher updated successfully." });
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: "Email already exists." });
    }
    res.status(500).json({ message: "Could not update teacher.", error: error.message });
  } finally {
    connection.release();
  }
}

// DELETE /api/teachers/:id - Delete teacher (admin only)
async function deleteTeacher(req, res) {
  try {
    const { id } = req.params;

    // Get user_id first to delete from users table (cascade will handle teachers table)
    const [teacherRows] = await pool.execute(
      "SELECT user_id FROM teachers WHERE id = ?",
      [id]
    );

    if (teacherRows.length === 0) {
      return res.status(404).json({ message: "Teacher not found." });
    }

    const userId = teacherRows[0].user_id;

    // Delete from users table (cascade will delete from teachers table)
    const [result] = await pool.execute("DELETE FROM users WHERE id = ?", [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Teacher not found." });
    }

    res.json({ message: "Teacher removed successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not delete teacher.", error: error.message });
  }
}

// GET /api/teachers/assignments - Get all assignments
async function getAssignments(req, res) {
  try {
    const query = `
      SELECT 
        ta.id AS assignment_id,
        ta.academic_year,
        ta.is_active,
        ta.assigned_at,
        t.id AS teacher_id,
        u.name AS teacher_name,
        g.id AS grade_id,
        g.name AS grade_name,
        sj.id AS subject_id,
        sj.name AS subject_name,
        sc.id AS section_id,
        sc.name AS section_name,
        ua.name AS assigned_by_name
      FROM teacher_assignments ta
      JOIN teachers t ON t.id = ta.teacher_id
      JOIN users u ON u.id = t.user_id
      JOIN grades g ON g.id = ta.grade_id
      JOIN subjects sj ON sj.id = ta.subject_id
      JOIN sections sc ON sc.id = ta.section_id
      JOIN users ua ON ua.id = ta.assigned_by
      ORDER BY ta.academic_year DESC, ta.is_active DESC, u.name ASC
    `;
    
    const [rows] = await pool.execute(query);
    res.json({ assignments: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load assignments.", error: error.message });
  }
}

// POST /api/teachers/assignments - Create new assignment
async function createAssignment(req, res) {
  try {
    const { teacher_id, grade_id, subject_id, section_id, academic_year } = req.body;
    const assigned_by = req.user.id; // Current user

    const [result] = await pool.execute(
      `INSERT INTO teacher_assignments 
       (teacher_id, grade_id, subject_id, section_id, academic_year, assigned_by) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [teacher_id, grade_id, subject_id, section_id, academic_year, assigned_by]
    );

    res.status(201).json({ 
      message: "Assignment created successfully.",
      assignment_id: result.insertId 
    });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: "This assignment already exists for this academic year." });
    }
    res.status(500).json({ message: "Could not create assignment.", error: error.message });
  }
}

// PUT /api/teachers/assignments/:id - Update assignment
async function updateAssignment(req, res) {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const [result] = await pool.execute(
      "UPDATE teacher_assignments SET is_active = ? WHERE id = ?",
      [is_active, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Assignment not found." });
    }

    res.json({ message: "Assignment updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not update assignment.", error: error.message });
  }
}

// DELETE /api/teachers/assignments/:id - Delete assignment
async function deleteAssignment(req, res) {
  try {
    const { id } = req.params;

    const [result] = await pool.execute("DELETE FROM teacher_assignments WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Assignment not found." });
    }

    res.json({ message: "Assignment removed successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not delete assignment.", error: error.message });
  }
}

// POST /api/teachers/link-student - Link student to teacher assignment
async function linkStudent(req, res) {
  try {
    const { teacher_assignment_id, student_id } = req.body;
    const linked_by = req.user.id; // Current user

    const [result] = await pool.execute(
      `INSERT INTO teacher_students (teacher_assignment_id, student_id, linked_by) 
       VALUES (?, ?, ?)`,
      [teacher_assignment_id, student_id, linked_by]
    );

    res.status(201).json({ 
      message: "Student linked successfully.",
      link_id: result.insertId 
    });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: "This student is already linked to this teacher assignment." });
    }
    res.status(500).json({ message: "Could not link student.", error: error.message });
  }
}

// DELETE /api/teachers/link-student/:id - Remove student link
async function unlinkStudent(req, res) {
  try {
    const { id } = req.params;

    const [result] = await pool.execute("DELETE FROM teacher_students WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Link not found." });
    }

    res.json({ message: "Student unlinked successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not unlink student.", error: error.message });
  }
}

// GET /api/teachers/grades - Get all grades
async function getGrades(req, res) {
  try {
    const [rows] = await pool.execute(
      "SELECT id, name, description, order_index FROM grades ORDER BY order_index ASC"
    );
    res.json({ grades: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load grades.", error: error.message });
  }
}

// GET /api/teachers/subjects - Get all subjects
async function getSubjects(req, res) {
  try {
    const [rows] = await pool.execute(
      "SELECT id, name, description, code FROM subjects ORDER BY name ASC"
    );
    res.json({ subjects: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load subjects.", error: error.message });
  }
}

// GET /api/teachers/sections - Get all sections (with grade info)
async function getSections(req, res) {
  try {
    const query = `
      SELECT s.id, s.name, s.capacity, s.grade_id, g.name AS grade_name
      FROM sections s
      JOIN grades g ON g.id = s.grade_id
      ORDER BY g.order_index ASC, s.name ASC
    `;
    
    const [rows] = await pool.execute(query);
    res.json({ sections: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load sections.", error: error.message });
  }
}

// GET /api/teachers/available-students - Get students available for linking
async function getAvailableStudents(req, res) {
  try {
    const { grade_id, section_id } = req.query;
    
    let query = `
      SELECT s.id AS student_id, u.name, u.email, s.grade, s.status
      FROM students s
      JOIN users u ON u.id = s.user_id
      WHERE u.role = 'student'
    `;
    
    const params = [];
    
    if (grade_id) {
      query += " AND s.grade = (SELECT name FROM grades WHERE id = ?)";
      params.push(grade_id);
    }
    
    query += " ORDER BY u.name ASC";
    
    const [rows] = await pool.execute(query, params);
    res.json({ students: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load students.", error: error.message });
  }
}

module.exports = {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  linkStudent,
  unlinkStudent,
  getGrades,
  getSubjects,
  getSections,
  getAvailableStudents
};