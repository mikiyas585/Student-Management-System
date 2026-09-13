const { pool } = require("../config/db");

// POST /api/attendance  (teacher, admin) - record one day's attendance for a student
async function recordAttendance(req, res) {
  try {
    const { student_id, date, status } = req.body;
    if (!student_id || !date || !status) {
      return res.status(400).json({ message: "student_id, date and status are required." });
    }

    // ON DUPLICATE KEY: if this student already has a row for that date, update it
    // instead of erroring, thanks to the UNIQUE(student_id, date) constraint.
    await pool.execute(
      `INSERT INTO attendance (student_id, date, status, recorded_by)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE status = VALUES(status), recorded_by = VALUES(recorded_by)`,
      [student_id, date, status, req.user.id]
    );

    res.status(201).json({ message: "Attendance recorded." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not record attendance.", error: error.message });
  }
}

// GET /api/attendance/:studentId  (teacher/admin: any student | student/parent: only their own)
async function getAttendance(req, res) {
  try {
    const { studentId } = req.params;

    if (req.user.role === "student" || req.user.role === "parent") {
      const [ownership] = await pool.execute(
        `SELECT s.id FROM students s
         WHERE s.id = ? AND (s.user_id = ? OR s.parent_id = ?)`,
        [studentId, req.user.id, req.user.id]
      );
      if (ownership.length === 0) {
        return res.status(403).json({ message: "You can only view your own attendance." });
      }
    }

    const [rows] = await pool.execute(
      "SELECT id, date, status FROM attendance WHERE student_id = ? ORDER BY date DESC",
      [studentId]
    );

    res.json({ attendance: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load attendance.", error: error.message });
  }
}

module.exports = { recordAttendance, getAttendance };
