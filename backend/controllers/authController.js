const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");
const { ApiError, asyncHandler } = require("../middleware/errorHandler");
const {
  isValidEmail,
  isValidString,
  isValidPassword,
  isValidRole,
  isValidGrade,
  sanitizeString,
  validateRequiredFields,
} = require("../utils/validation");
require("dotenv").config();

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

// POST /api/auth/register
// Public self-registration is allowed for "student" and "parent" only.
// Admin/teacher accounts should be created by an existing admin (see /api/users in a future version,
// or insert directly / use seed.js for the first admin).
const register = asyncHandler(async function (req, res) {
  const { name, email, password, role, grade } = req.body;

  // Validate required fields
  const requiredErrors = validateRequiredFields(req.body, ["name", "email", "password"]);
  if (requiredErrors.length > 0) {
    throw new ApiError(400, "Validation failed", requiredErrors);
  }

  // Sanitize inputs
  const sanitizedName = sanitizeString(name);
  const sanitizedEmail = sanitizeString(email).toLowerCase();

  // Validate input formats
  const errors = [];

  if (!isValidString(sanitizedName, 2, 150)) {
    errors.push({ field: "name", message: "Name must be between 2 and 150 characters" });
  }

  if (!isValidEmail(sanitizedEmail)) {
    errors.push({ field: "email", message: "Invalid email format" });
  }

  if (!isValidPassword(password)) {
    errors.push({
      field: "password",
      message: "Password must be at least 8 characters and contain both letters and numbers",
    });
  }

  // Validate role if provided
  const allowedSelfSignupRoles = ["student", "parent"];
  let finalRole = "student"; // default

  if (role) {
    if (!isValidRole(role)) {
      errors.push({ field: "role", message: "Invalid role" });
    } else if (!allowedSelfSignupRoles.includes(role.toLowerCase())) {
      finalRole = "student"; // Force to student if trying to register as admin/teacher
    } else {
      finalRole = role.toLowerCase();
    }
  }

  // Validate grade if provided and role is student
  if (finalRole === "student" && grade && !isValidGrade(grade)) {
    errors.push({ field: "grade", message: "Invalid grade format" });
  }

  if (errors.length > 0) {
    throw new ApiError(400, "Validation failed", errors);
  }

  // Check for existing email
  const [existing] = await pool.execute("SELECT id FROM users WHERE email = ?", [sanitizedEmail]);
  if (existing.length > 0) {
    throw new ApiError(409, "An account with this email already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert user
  const [result] = await pool.execute(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    [sanitizedName, sanitizedEmail, hashedPassword, finalRole]
  );

  const userId = result.insertId;

  // If registering as a student, also create their student profile row
  if (finalRole === "student") {
    const sanitizedGrade = grade ? sanitizeString(grade) : null;
    await pool.execute(
      "INSERT INTO students (user_id, grade, status) VALUES (?, ?, 'active')",
      [userId, sanitizedGrade]
    );
  }

  const user = { id: userId, name: sanitizedName, email: sanitizedEmail, role: finalRole };
  const token = signToken(user);

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: { token, user },
  });
});

// POST /api/auth/login
const login = asyncHandler(async function (req, res) {
  const { email, password } = req.body;

  // Validate required fields
  const requiredErrors = validateRequiredFields(req.body, ["email", "password"]);
  if (requiredErrors.length > 0) {
    throw new ApiError(400, "Validation failed", requiredErrors);
  }

  const sanitizedEmail = sanitizeString(email).toLowerCase();

  // Validate email format
  if (!isValidEmail(sanitizedEmail)) {
    throw new ApiError(400, "Invalid email format");
  }

  if (!password || typeof password !== "string") {
    throw new ApiError(400, "Invalid password");
  }

  // Find user
  const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [sanitizedEmail]);
  if (rows.length === 0) {
    throw new ApiError(401, "Invalid email or password");
  }

  const user = rows[0];

  // Verify password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = signToken(user);

  res.json({
    success: true,
    message: "Logged in successfully",
    data: {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    },
  });
});

// GET /api/auth/me
const me = asyncHandler(async function (req, res) {
  res.json({
    success: true,
    message: "User profile retrieved",
    data: { user: req.user },
  });
});

module.exports = { register, login, me };
