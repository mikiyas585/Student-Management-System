const express = require("express");
const router = express.Router();
const {
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice,
} = require("../controllers/noticeController");
const { authenticate, authorize } = require("../middleware/auth");

router.use(authenticate);

router.get("/", getNotices);
router.post("/", authorize("admin", "teacher"), createNotice);
router.put("/:id", authorize("admin", "teacher"), updateNotice);
router.delete("/:id", authorize("admin", "teacher"), deleteNotice);

module.exports = router;
