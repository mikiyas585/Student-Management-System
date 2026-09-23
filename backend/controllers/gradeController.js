const { pool } = require("../config/db");

// GET /api/grades/period-status
// Returns the status of all grading periods (Semester 1, Semester 2)
async function getPeriodStatus(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT gp.*, u.name AS updated_by_name 
       FROM grade_periods gp
       LEFT JOIN users u ON gp.updated_by = u.id
       ORDER BY gp.semester ASC`
    );
    res.json({ periods: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not fetch grade period statuses.", error: error.message });
  }
}

// PUT /api/grades/period-status
// Admin only: updates status ('closed', 'open_for_teachers', 'published')
async function updatePeriodStatus(req, res) {
  try {
    const { semester, status } = req.body;
    if (!semester || !status) {
      return res.status(400).json({ message: "semester and status are required." });
    }

    const validStatuses = ["closed", "open_for_teachers", "published"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(", ")}` });
    }

    const publishedAt = status === "published" ? new Date() : null;

    await pool.execute(
      `INSERT INTO grade_periods (semester, status, published_at, updated_by)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         status = VALUES(status), 
         published_at = IF(VALUES(status) = 'published', COALESCE(grade_periods.published_at, NOW()), NULL),
         updated_by = VALUES(updated_by)`,
      [semester, status, publishedAt, req.user.id]
    );

    res.json({ message: `Grade period for ${semester} updated to '${status}'.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not update grade period status.", error: error.message });
  }
}

// GET /api/grades
// Admin, Teacher: can see all or teacher-specific grades
// Student, Parent: can only see if semester status is 'published'
async function getGrades(req, res) {
  try {
    const { semester } = req.query; // optional filter
    const activeSemester = semester || "Semester 1";

    // 1. Get current status of this semester
    const [periodRows] = await pool.execute(
      "SELECT * FROM grade_periods WHERE semester = ?",
      [activeSemester]
    );
    const period = periodRows[0] || { semester: activeSemester, status: "closed" };

    // 2. Access control check for Student & Parent
    if (req.user.role === "student" || req.user.role === "parent") {
      if (period.status !== "published") {
        return res.json({ 
          grades: [], 
          periodStatus: period.status,
          published: false,
          message: `The grade board for ${activeSemester} is not yet published.`
        });
      }
    }

    // 3. Query construction based on role
    let query = `
      SELECT ag.*, s.name AS student_name, s.email AS student_email,
             s_tbl.grade AS student_grade_level,
             u.name AS teacher_name 
      FROM academic_grades ag
      JOIN students s_tbl ON ag.student_id = s_tbl.id
      JOIN users s ON s_tbl.user_id = s.id
      JOIN users u ON ag.teacher_id = u.id
      WHERE ag.semester = ?
    `;
    const params = [activeSemester];

    if (req.user.role === "student") {
      query += " AND s.id = ?";
      params.push(req.user.id);
    } else if (req.user.role === "parent") {
      query += " AND s_tbl.parent_id = ?";
      params.push(req.user.id);
    }

    query += " ORDER BY s.name ASC, ag.subject ASC";

    const [rows] = await pool.execute(query, params);

    res.json({ 
      grades: rows, 
      periodStatus: period.status,
      published: period.status === "published"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load grades.", error: error.message });
  }
}

// POST /api/grades
// Teacher or Admin can add marks, but Teacher can only add when status is 'open_for_teachers'
async function addGrade(req, res) {
  try {
    const { student_id, subject, semester, marks } = req.body;
    if (!student_id || !subject || !semester || marks === undefined) {
      return res.status(400).json({ message: "student_id, subject, semester, and marks are required." });
    }

    // Check period status
    const [periodRows] = await pool.execute(
      "SELECT * FROM grade_periods WHERE semester = ?",
      [semester]
    );
    const period = periodRows[0] || { semester, status: "closed" };

    if (req.user.role === "teacher" && period.status !== "open_for_teachers") {
      return res.status(403).json({ 
        message: `Grade entry for ${semester} is currently locked (${period.status}). The admin must open the grade board before you can record marks.` 
      });
    }

    const teacher_id = req.user.id;

    const [result] = await pool.execute(
      `INSERT INTO academic_grades (student_id, teacher_id, subject, semester, marks)
       VALUES (?, ?, ?, ?, ?)`,
      [student_id, teacher_id, subject.trim(), semester, parseInt(marks, 10)]
    );

    res.status(201).json({ message: "Grade added successfully.", gradeId: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not add grade.", error: error.message });
  }
}

// DELETE /api/grades/:id
// Teacher (if their own and open) or Admin (anytime) can remove an erroneous mark entry
async function deleteGrade(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(
      "SELECT ag.*, gp.status AS period_status FROM academic_grades ag LEFT JOIN grade_periods gp ON ag.semester = gp.semester WHERE ag.id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Grade record not found." });
    }

    const grade = rows[0];

    if (req.user.role === "teacher") {
      if (grade.teacher_id !== req.user.id) {
        return res.status(403).json({ message: "You can only delete grades you entered." });
      }
      if (grade.period_status !== "open_for_teachers") {
        return res.status(403).json({ message: "Cannot modify grades once the grading period is closed or published." });
      }
    }

    await pool.execute("DELETE FROM academic_grades WHERE id = ?", [id]);
    res.json({ message: "Grade entry deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not delete grade.", error: error.message });
  }
}

module.exports = {
  getPeriodStatus,
  updatePeriodStatus,
  getGrades,
  addGrade,
  deleteGrade,
};
