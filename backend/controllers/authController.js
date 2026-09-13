const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");
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
async function register(req, res) {
  try {
    const { name, email, password, role, grade } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required." });
    }

    const allowedSelfSignupRoles = ["student", "parent"];
    const finalRole = allowedSelfSignupRoles.includes(role) ? role : "student";

    const [existing] = await pool.execute("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, finalRole]
    );

    const userId = result.insertId;

    // If registering as a student, also create their student profile row.
    if (finalRole === "student") {
      await pool.execute(
        "INSERT INTO students (user_id, grade, status) VALUES (?, ?, 'active')",
        [userId, grade || null]
      );
    }

    const user = { id: userId, name, email, role: finalRole };
    const token = signToken(user);

    res.status(201).json({ message: "Account created.", token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Registration failed.", error: error.message });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required." });
    }

    const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = signToken(user);

    res.json({
      message: "Logged in.",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed.", error: error.message });
  }
}

// GET /api/auth/me
async function me(req, res) {
  res.json({ user: req.user });
}

module.exports = { register, login, me };
