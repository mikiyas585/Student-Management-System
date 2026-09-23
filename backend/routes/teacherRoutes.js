const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const teacherController = require("../controllers/teacherController");

// Apply auth middleware to all routes
router.use(authenticate);

// Teacher CRUD operations (admin only)
router.get("/", authorize("admin"), teacherController.getTeachers);
router.get("/students/available", authorize("admin"), teacherController.getAvailableStudents);
router.get("/:id", authorize("admin", "teacher"), teacherController.getTeacherById);
router.post("/", authorize("admin"), teacherController.createTeacher);
router.put("/:id", authorize("admin"), teacherController.updateTeacher);
router.delete("/:id", authorize("admin"), teacherController.deleteTeacher);

// Assignment management (admin only)
router.get("/assignments/all", authorize("admin"), teacherController.getAssignments);
router.post("/assignments", authorize("admin"), teacherController.createAssignment);
router.put("/assignments/:id", authorize("admin"), teacherController.updateAssignment);
router.delete("/assignments/:id", authorize("admin"), teacherController.deleteAssignment);

// Student linking (admin only)
router.post("/link-student", authorize("admin"), teacherController.linkStudent);
router.delete("/link-student/:id", authorize("admin"), teacherController.unlinkStudent);
router.get("/students/available", authorize("admin"), teacherController.getAvailableStudents);

// Reference data (admin and teacher can view)
router.get("/grades/all", authorize("admin", "teacher"), teacherController.getGrades);
router.get("/subjects/all", authorize("admin", "teacher"), teacherController.getSubjects);
router.get("/sections/all", authorize("admin", "teacher"), teacherController.getSections);

module.exports = router;