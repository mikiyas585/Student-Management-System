const express = require("express");
const router = express.Router();
const {
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");
const { authenticate, authorize } = require("../middleware/auth");

router.use(authenticate);

router.get("/", getStudents);
router.get("/:id", getStudentById);
router.put("/:id", authorize("admin", "teacher"), updateStudent);
router.delete("/:id", authorize("admin"), deleteStudent);

module.exports = router;
