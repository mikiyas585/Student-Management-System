const express = require("express");
const router = express.Router();
const { 
  getGrades, 
  addGrade, 
  getPeriodStatus, 
  updatePeriodStatus, 
  deleteGrade 
} = require("../controllers/gradeController");
const { authenticate, authorize } = require("../middleware/auth");

router.use(authenticate);

// Get period status (Admin, Teacher, Student, Parent)
router.get("/period-status", getPeriodStatus);

// Update period status (Admin only)
router.put("/period-status", authorize("admin"), updatePeriodStatus);

// Admin, Teacher, Student, and Parent can access GET /grades (Controller applies publication & ownership rules)
router.get("/", authorize("admin", "teacher", "student", "parent"), getGrades);

// Teachers and Admins can add marks (Teacher is subject to 'open_for_teachers' rule)
router.post("/", authorize("teacher", "admin"), addGrade);

// Teachers and Admins can delete marks
router.delete("/:id", authorize("teacher", "admin"), deleteGrade);

module.exports = router;
