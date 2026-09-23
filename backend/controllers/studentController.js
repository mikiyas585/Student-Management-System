const { pool } = require("../config/db");
const { ApiError, asyncHandler } = require("../middleware/errorHandler");
const {
  isValidId,
  isValidGrade,
  isValidStudentStatus,
  sanitizeString,
} = require("../utils/validation");

// GET /api/students  (admin, teacher: all students | student: only self | parent: only linked children)
const getStudents = asyncHandler(async function (req, res) {
  let query = `
    SELECT s.id, s.grade, s.status, s.parent_id,
           u.id AS user_id, u.name, u.email,
           pu.name AS parent_name, pu.email AS parent_email
    FROM students s
    JOIN users u ON u.id = s.user_id
    LEFT JOIN users pu ON pu.id = s.parent_id
  `;
  const params = [];

  if (req.user.role === "student") {
    query += " WHERE u.id = ?";
    params.push(req.user.id);
  } else if (req.user.role === "parent") {
    query += " WHERE s.parent_id = ?";
    params.push(req.user.id);
  } else if (req.user.role === "teacher") {
    query += `
      WHERE s.id IN (
        SELECT DISTINCT ts.student_id
        FROM teacher_students ts
        JOIN teacher_assignments ta ON ta.id = ts.teacher_assignment_id
        JOIN teachers t ON t.id = ta.teacher_id
        WHERE t.user_id = ? AND ta.is_active = 1
      )`;
    params.push(req.user.id);
  }

  query += " ORDER BY u.name ASC";

  const [rows] = await pool.execute(query, params);
  res.json({
    success: true,
    message: "Students retrieved successfully",
    data: { students: rows },
  });
});

// GET /api/students/parents (admin, teacher only)
const getParents = asyncHandler(async function (req, res) {
  const [rows] = await pool.execute(
    "SELECT id, name, email FROM users WHERE role = 'parent' ORDER BY name ASC"
  );
  res.json({
    success: true,
    message: "Parents retrieved successfully",
    data: { parents: rows },
  });
});

// GET /api/students/:id
const getStudentById = asyncHandler(async function (req, res) {
  const { id } = req.params;

  // Validate ID
  if (!isValidId(id)) {
    throw new ApiError(400, "Invalid student ID");
  }

  const [rows] = await pool.execute(
    `SELECT s.id, s.grade, s.status, s.parent_id,
            u.id AS user_id, u.name, u.email,
            pu.name AS parent_name, pu.email AS parent_email
     FROM students s
     JOIN users u ON u.id = s.user_id
     LEFT JOIN users pu ON pu.id = s.parent_id
     WHERE s.id = ?`,
    [id]
  );

  if (rows.length === 0) {
    throw new ApiError(404, "Student not found");
  }

  res.json({
    success: true,
    message: "Student retrieved successfully",
    data: { student: rows[0] },
  });
});

// PUT /api/students/:id  (admin, teacher only)
const updateStudent = asyncHandler(async function (req, res) {
  const { id } = req.params;
  const { grade, status, parent_id } = req.body;

  // Validate ID
  if (!isValidId(id)) {
    throw new ApiError(400, "Invalid student ID");
  }

  // Validate at least one field is provided
  if (!grade && !status && parent_id === undefined) {
    throw new ApiError(400, "At least one field (grade, status, or parent_id) must be provided");
  }

  const errors = [];

  // Validate grade if provided
  if (grade && !isValidGrade(grade)) {
    errors.push({ field: "grade", message: "Invalid grade format" });
  }

  // Validate status if provided
  if (status && !isValidStudentStatus(status)) {
    errors.push({ field: "status", message: "Status must be 'active', 'pass', or 'fail'" });
  }

  // Validate parent_id if provided
  let parsedParentId = null;
  if (parent_id !== undefined && parent_id !== "" && parent_id !== "none" && parent_id !== null) {
    if (!isValidId(parent_id)) {
      errors.push({ field: "parent_id", message: "Invalid parent ID" });
    } else {
      parsedParentId = Number(parent_id);
      // Verify parent exists
      const [parentRows] = await pool.execute(
        "SELECT id FROM users WHERE id = ? AND role = 'parent'",
        [parsedParentId]
      );
      if (parentRows.length === 0) {
        errors.push({ field: "parent_id", message: "Parent account not found" });
      }
    }
  }

  if (errors.length > 0) {
    throw new ApiError(400, "Validation failed", errors);
  }

  // Check if student exists
  const [studentExists] = await pool.execute("SELECT id FROM students WHERE id = ?", [id]);
  if (studentExists.length === 0) {
    throw new ApiError(404, "Student not found");
  }

  // Sanitize grade if provided
  const sanitizedGrade = grade ? sanitizeString(grade) : null;
  const sanitizedStatus = status ? status.toLowerCase() : null;

  await pool.execute(
    "UPDATE students SET grade = COALESCE(?, grade), status = COALESCE(?, status), parent_id = ? WHERE id = ?",
    [sanitizedGrade, sanitizedStatus, parsedParentId, id]
  );

  res.json({
    success: true,
    message: "Student record updated successfully",
  });
});

// DELETE /api/students/:id  (admin only)
const deleteStudent = asyncHandler(async function (req, res) {
  const { id } = req.params;

  // Validate ID
  if (!isValidId(id)) {
    throw new ApiError(400, "Invalid student ID");
  }

  const [result] = await pool.execute("DELETE FROM students WHERE id = ?", [id]);

  if (result.affectedRows === 0) {
    throw new ApiError(404, "Student not found");
  }

  res.json({
    success: true,
    message: "Student removed successfully",
  });
});

module.exports = { getStudents, getParents, getStudentById, updateStudent, deleteStudent };
