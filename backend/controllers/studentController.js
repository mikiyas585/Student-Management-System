const { pool } = require("../config/db");

// GET /api/students  (admin, teacher: all students | student: only self)
async function getStudents(req, res) {
  try {
    let query = `
      SELECT s.id, s.grade, s.status, s.parent_id, u.id AS user_id, u.name, u.email
      FROM students s
      JOIN users u ON u.id = s.user_id
    `;
    const params = [];

    if (req.user.role === "student") {
      query += " WHERE u.id = ?";
      params.push(req.user.id);
    } else if (req.user.role === "parent") {
      query += " WHERE s.parent_id = ?";
      params.push(req.user.id);
    }

    const [rows] = await pool.execute(query, params);
    res.json({ students: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load students.", error: error.message });
  }
}

// GET /api/students/:id
async function getStudentById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute(
      `SELECT s.id, s.grade, s.status, s.parent_id, u.id AS user_id, u.name, u.email
       FROM students s JOIN users u ON u.id = s.user_id
       WHERE s.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Student not found." });
    }

    res.json({ student: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load student.", error: error.message });
  }
}

// PUT /api/students/:id  (admin, teacher only)
async function updateStudent(req, res) {
  try {
    const { id } = req.params;
    const { grade, status, parent_id } = req.body;

    await pool.execute(
      "UPDATE students SET grade = COALESCE(?, grade), status = COALESCE(?, status), parent_id = ? WHERE id = ?",
      [grade || null, status || null, parent_id || null, id]
    );

    res.json({ message: "Student record updated." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not update student.", error: error.message });
  }
}

// DELETE /api/students/:id  (admin only)
async function deleteStudent(req, res) {
  try {
    const { id } = req.params;
    const [result] = await pool.execute("DELETE FROM students WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Student not found." });
    }

    res.json({ message: "Student removed." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not delete student.", error: error.message });
  }
}

module.exports = { getStudents, getStudentById, updateStudent, deleteStudent };
