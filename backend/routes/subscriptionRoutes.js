const express = require("express");
const router = express.Router();
const {
  getSubscriptions,
  createSubscription,
  closeSubscription,
  paySubscription,
  getMySubscriptions,
} = require("../controllers/subscriptionController");
const { authenticate, authorize } = require("../middleware/auth");

router.use(authenticate);

router.get("/", getSubscriptions);
router.get("/my", getMySubscriptions);
router.post("/", authorize("admin"), createSubscription);
router.put("/:id/close", authorize("admin"), closeSubscription);
router.post("/:id/pay", authorize("student"), paySubscription);

module.exports = router;
