const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { testConnection } = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const noticeRoutes = require("./routes/noticeRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

// Health check - useful to confirm the server + DB are both up
app.get("/api/health", function (req, res) {
  res.json({ status: "ok", message: "Student Management System API is running." });
});

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/attendance", attendanceRoutes);

// Fallback 404 handler
app.use(function (req, res) {
  res.status(404).json({ message: "Route not found." });
});

const PORT = process.env.PORT || 5000;

async function start() {
  await testConnection();
  app.listen(PORT, function () {
    console.log("Server running on http://localhost:" + PORT);
  });
}

start();
