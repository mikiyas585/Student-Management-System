const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { testConnection } = require("./config/db");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const noticeRoutes = require("./routes/noticeRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const gradeRoutes = require("./routes/gradeRoutes");
const teacherRoutes = require("./routes/teacherRoutes");

const app = express();

app.use(cors({ origin: [
  process.env.CORS_ORIGIN || "http://localhost:5173",
  "http://localhost:5174"
] }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check - useful to confirm the server + DB are both up
app.get("/api/health", function (req, res) {
  res.json({
    success: true,
    message: "Student Management System API is running",
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    },
  });
});

// Debug endpoint to check database counts (remove in production)
app.get("/api/debug/counts", async function (req, res) {
  try {
    const { pool } = require("./config/db");
    
    const [grades] = await pool.execute("SELECT COUNT(*) as count FROM grades");
    const [subjects] = await pool.execute("SELECT COUNT(*) as count FROM subjects");
    const [sections] = await pool.execute("SELECT COUNT(*) as count FROM sections");
    const [teachers] = await pool.execute("SELECT COUNT(*) as count FROM teachers");
    const [assignments] = await pool.execute("SELECT COUNT(*) as count FROM teacher_assignments");
    
    res.json({
      success: true,
      counts: {
        grades: grades[0].count,
        subjects: subjects[0].count,
        sections: sections[0].count,
        teachers: teachers[0].count,
        assignments: assignments[0].count
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/teachers", teacherRoutes);

// 404 Not Found handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await testConnection();
    app.listen(PORT, function () {
      console.log("✓ Server running on http://localhost:" + PORT);
      console.log("✓ Environment:", process.env.NODE_ENV || "development");
      console.log("✓ CORS Origin:", process.env.CORS_ORIGIN || "http://localhost:5173");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();
