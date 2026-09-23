const express = require("express");
const router = express.Router();
const { recordAttendance, getAttendance } = require("../controllers/attendanceController");
const { authenticate, authorize } = require("../middleware/auth");

router.use(authenticate);

router.post("/", authorize("teacher"), recordAttendance);
router.get("/:studentId", getAttendance);

module.exports = router;
