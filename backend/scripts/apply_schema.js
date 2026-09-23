const { pool } = require("../config/db");

async function apply() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS academic_grades (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        teacher_id INT NOT NULL,
        subject VARCHAR(100) NOT NULL,
        semester ENUM('Semester 1', 'Semester 2') NOT NULL,
        marks INT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log("Table created");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

apply();
