const { pool } = require("../config/db");

async function setupTeacherTables() {
  try {
    console.log("Creating teacher management tables...");

    // Create teachers table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS teachers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        qualifications VARCHAR(255),
        specialization VARCHAR(100),
        years_of_experience INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log("✓ Teachers table created");

    // Create grades table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS grades (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        description VARCHAR(255),
        order_index INT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✓ Grades table created");

    // Insert default grades
    await pool.execute(`
      INSERT IGNORE INTO grades (name, description, order_index) VALUES 
        ('Kindergarten', 'Pre-school education', 1),
        ('Grade 1', 'First grade elementary', 2),
        ('Grade 2', 'Second grade elementary', 3),
        ('Grade 3', 'Third grade elementary', 4),
        ('Grade 4', 'Fourth grade elementary', 5),
        ('Grade 5', 'Fifth grade elementary', 6),
        ('Grade 6', 'Sixth grade elementary', 7),
        ('Grade 7', 'Seventh grade middle school', 8),
        ('Grade 8', 'Eighth grade middle school', 9),
        ('Grade 9', 'Ninth grade high school', 10),
        ('Grade 10', 'Tenth grade high school', 11),
        ('Grade 11', 'Eleventh grade high school', 12),
        ('Grade 12', 'Twelfth grade high school', 13)
    `);
    console.log("✓ Default grades inserted");

    // Create subjects table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS subjects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description VARCHAR(255),
        code VARCHAR(20) UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✓ Subjects table created");

    // Insert default subjects
    await pool.execute(`
      INSERT IGNORE INTO subjects (name, description, code) VALUES 
        ('Mathematics', 'Core mathematics curriculum', 'MATH'),
        ('Science', 'General science education', 'SCI'),
        ('English', 'English language and literature', 'ENG'),
        ('Social Studies', 'History and social sciences', 'SOC'),
        ('Computer Science', 'Programming and technology', 'CS'),
        ('Physical Education', 'Sports and physical health', 'PE'),
        ('Art', 'Creative arts and design', 'ART'),
        ('Music', 'Music education', 'MUS'),
        ('Foreign Language', 'Second language learning', 'LANG'),
        ('Biology', 'Life sciences', 'BIO'),
        ('Chemistry', 'Chemical sciences', 'CHEM'),
        ('Physics', 'Physical sciences', 'PHY'),
        ('Geography', 'Earth and environmental sciences', 'GEO')
    `);
    console.log("✓ Default subjects inserted");

    // Create sections table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS sections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        grade_id INT NOT NULL,
        capacity INT DEFAULT 30,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_section_per_grade (name, grade_id),
        FOREIGN KEY (grade_id) REFERENCES grades(id) ON DELETE CASCADE
      )
    `);
    console.log("✓ Sections table created");

    // Insert sections A-Z for each grade
    const [grades] = await pool.execute('SELECT id FROM grades');
    const sectionLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    for (const grade of grades) {
      for (const letter of sectionLetters) {
        const [existingLetter] = await pool.execute(
          'SELECT id FROM sections WHERE name = ? AND grade_id = ?',
          [letter, grade.id]
        );
        if (existingLetter.length === 0) {
          await pool.execute(
            'UPDATE sections SET name = ? WHERE name = ? AND grade_id = ?',
            [letter, `Section ${letter}`, grade.id]
          );
        }
        await pool.execute(
          'INSERT IGNORE INTO sections (name, grade_id, capacity) VALUES (?, ?, 30)',
          [letter, grade.id]
        );
      }
    }
    console.log("✓ Sections A-Z inserted for every grade");

    // Create teacher_assignments table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS teacher_assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        teacher_id INT NOT NULL,
        grade_id INT NOT NULL,
        subject_id INT NOT NULL,
        section_id INT NOT NULL,
        academic_year YEAR NOT NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        assigned_by INT NOT NULL,
        assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
        FOREIGN KEY (grade_id) REFERENCES grades(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_teacher_assignment (teacher_id, grade_id, subject_id, section_id, academic_year)
      )
    `);
    console.log("✓ Teacher assignments table created");

    // Create teacher_students table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS teacher_students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        teacher_assignment_id INT NOT NULL,
        student_id INT NOT NULL,
        linked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        linked_by INT NOT NULL,
        FOREIGN KEY (teacher_assignment_id) REFERENCES teacher_assignments(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (linked_by) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_teacher_student_link (teacher_assignment_id, student_id)
      )
    `);
    console.log("✓ Teacher-students link table created");

    console.log("\n✅ All teacher management tables created successfully!");
    console.log("You can now create teachers and manage assignments.");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error setting up tables:", err);
    process.exit(1);
  }
}

setupTeacherTables();
