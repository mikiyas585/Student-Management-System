const express = require("express");
const router = express.Router();
const {
  getStudents,
  getParents,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");
const { authenticate, authorize } = require("../middleware/auth");

router.use(authenticate);

router.get("/", getStudents);
router.get("/parents", authorize("admin", "teacher"), getParents);
router.get("/:id", getStudentById);
router.put("/:id", authorize("admin", "teacher"), updateStudent);
router.delete("/:id", authorize("admin"), deleteStudent);

module.exports = router;
