// Creates one admin, one teacher, and one sample subscription plan
// so you have something to log in with and test against right away.
//
// Run once after setting up the database:  npm run seed

const bcrypt = require("bcryptjs");
const { pool } = require("./config/db");

async function seed() {
  const password = await bcrypt.hash("password123", 10);

  const [existingAdmin] = await pool.execute("SELECT id FROM users WHERE email = ?", [
    "admin@school.com",
  ]);

  if (existingAdmin.length === 0) {
    await pool.execute(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'admin')",
      ["Admin User", "admin@school.com", password]
    );
    console.log("Created admin -> admin@school.com / password123");
  } else {
    console.log("Admin already exists, skipping.");
  }

  const [existingTeacher] = await pool.execute("SELECT id FROM users WHERE email = ?", [
    "teacher@school.com",
  ]);

  if (existingTeacher.length === 0) {
    await pool.execute(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'teacher')",
      ["Teacher User", "teacher@school.com", password]
    );
    console.log("Created teacher -> teacher@school.com / password123");
  } else {
    console.log("Teacher already exists, skipping.");
  }

  const [existingSub] = await pool.execute("SELECT id FROM subscriptions LIMIT 1");
  if (existingSub.length === 0) {
    await pool.execute(
      "INSERT INTO subscriptions (name, description, amount, is_active) VALUES (?, ?, ?, 1)",
      ["Term 1 Subscription", "Standard subscription for Term 1", 500.0]
    );
    console.log("Created a sample subscription plan.");
  } else {
    console.log("A subscription already exists, skipping.");
  }

  console.log("Seeding complete. Register a student/parent from the frontend to test the full flow.");
  process.exit(0);
}

seed().catch(function (error) {
  console.error("Seeding failed:", error);
  process.exit(1);
});
