// MySQL connection pool. Every controller imports { pool } from here
// and runs queries with pool.query(...) or pool.execute(...).

const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function initSchema() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS grade_periods (
        id INT AUTO_INCREMENT PRIMARY KEY,
        semester ENUM('Semester 1', 'Semester 2') NOT NULL UNIQUE,
        status ENUM('closed', 'open_for_teachers', 'published') NOT NULL DEFAULT 'closed',
        published_at DATETIME NULL,
        updated_by INT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    await pool.query(`
      INSERT IGNORE INTO grade_periods (semester, status) VALUES 
        ('Semester 1', 'closed'),
        ('Semester 2', 'closed')
    `);
  } catch (err) {
    console.error("Warning: Could not auto-initialize grade_periods:", err.message);
  }
}

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("MySQL connected successfully.");
    connection.release();
    await initSchema();
  } catch (error) {
    console.error("MySQL connection failed:", error.message);
    process.exit(1);
  }
}

module.exports = { pool, testConnection };
