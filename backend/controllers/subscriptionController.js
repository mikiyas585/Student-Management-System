const { pool } = require("../config/db");

// GET /api/subscriptions  (any logged-in user: see what's available)
async function getSubscriptions(req, res) {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM subscriptions WHERE is_active = 1 ORDER BY created_at DESC"
    );
    res.json({ subscriptions: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load subscriptions.", error: error.message });
  }
}

// POST /api/subscriptions  (admin only) - open a new subscription plan
async function createSubscription(req, res) {
  try {
    const { name, description, amount } = req.body;
    if (!name || !amount) {
      return res.status(400).json({ message: "name and amount are required." });
    }

    const [result] = await pool.execute(
      "INSERT INTO subscriptions (name, description, amount, is_active) VALUES (?, ?, ?, 1)",
      [name, description || null, amount]
    );

    res.status(201).json({ message: "Subscription created.", subscriptionId: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not create subscription.", error: error.message });
  }
}

// PUT /api/subscriptions/:id/close  (admin only) - stop offering it
async function closeSubscription(req, res) {
  try {
    const { id } = req.params;
    await pool.execute("UPDATE subscriptions SET is_active = 0 WHERE id = ?", [id]);
    res.json({ message: "Subscription closed." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not close subscription.", error: error.message });
  }
}

// POST /api/subscriptions/:id/pay  (student only)
// This simulates a successful payment. Wiring this to a real bank/payment
// gateway later only means replacing the "simulate success" block below
// with a call to that gateway's API and waiting for its confirmation webhook.
async function paySubscription(req, res) {
  try {
    const { id } = req.params; // subscription id

    const [subRows] = await pool.execute(
      "SELECT * FROM subscriptions WHERE id = ? AND is_active = 1",
      [id]
    );
    if (subRows.length === 0) {
      return res.status(404).json({ message: "Subscription not available." });
    }
    const subscription = subRows[0];

    const [studentRows] = await pool.execute(
      "SELECT id FROM students WHERE user_id = ?",
      [req.user.id]
    );
    if (studentRows.length === 0) {
      return res.status(403).json({ message: "Only students can subscribe." });
    }
    const studentId = studentRows[0].id;

    // --- payment gateway would be called here in a real deployment ---
    const paymentSucceeded = true;
    // -------------------------------------------------------------

    if (!paymentSucceeded) {
      return res.status(402).json({ message: "Payment failed. Please try again." });
    }

    const [result] = await pool.execute(
      `INSERT INTO student_subscriptions (student_id, subscription_id, amount_paid, status, paid_at)
       VALUES (?, ?, ?, 'paid', NOW())`,
      [studentId, id, subscription.amount]
    );

    res.status(201).json({
      message: "Subscription successful.",
      recordId: result.insertId,
      amountPaid: subscription.amount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not process payment.", error: error.message });
  }
}

// GET /api/subscriptions/my  (student: own history | admin/teacher: everyone's)
async function getMySubscriptions(req, res) {
  try {
    let query = `
      SELECT ss.id, ss.amount_paid, ss.status, ss.paid_at, ss.created_at,
             sub.name AS subscription_name, u.name AS student_name
      FROM student_subscriptions ss
      JOIN subscriptions sub ON sub.id = ss.subscription_id
      JOIN students s ON s.id = ss.student_id
      JOIN users u ON u.id = s.user_id
    `;
    const params = [];

    if (req.user.role === "student") {
      query += " WHERE u.id = ?";
      params.push(req.user.id);
    }

    query += " ORDER BY ss.created_at DESC";

    const [rows] = await pool.execute(query, params);
    res.json({ records: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load subscription history.", error: error.message });
  }
}

// DELETE /api/subscriptions/:id (admin only)
async function deleteSubscription(req, res) {
  try {
    const { id } = req.params;
    await pool.execute("DELETE FROM subscriptions WHERE id = ?", [id]);
    res.json({ message: "Subscription deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not delete subscription.", error: error.message });
  }
}

module.exports = {
  getSubscriptions,
  createSubscription,
  closeSubscription,
  paySubscription,
  getMySubscriptions,
  deleteSubscription,
};
