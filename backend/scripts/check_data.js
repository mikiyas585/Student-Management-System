const { pool } = require("../config/db");

async function checkData() {
  try {
    console.log("\n=== Checking Database Data ===\n");
    
    // Check grades
    const [grades] = await pool.execute("SELECT COUNT(*) as count FROM grades");
    console.log(`✓ Grades: ${grades[0].count} records`);
    
    // Check subjects
    const [subjects] = await pool.execute("SELECT COUNT(*) as count FROM subjects");
    console.log(`✓ Subjects: ${subjects[0].count} records`);
    
    // Check sections
    const [sections] = await pool.execute("SELECT COUNT(*) as count FROM sections");
    console.log(`✓ Sections: ${sections[0].count} records`);
    
    // Check teachers
    const [teachers] = await pool.execute("SELECT COUNT(*) as count FROM teachers");
    console.log(`✓ Teachers: ${teachers[0].count} records`);
    
    // Check teacher assignments
    const [assignments] = await pool.execute("SELECT COUNT(*) as count FROM teacher_assignments");
    console.log(`✓ Teacher Assignments: ${assignments[0].count} records`);
    
    // List all teachers
    const [teacherList] = await pool.execute(`
      SELECT t.id, u.name, u.email, t.qualifications, t.specialization 
      FROM teachers t 
      JOIN users u ON u.id = t.user_id
    `);
    
    if (teacherList.length > 0) {
      console.log("\n=== Teachers List ===");
      teacherList.forEach(teacher => {
        console.log(`- ${teacher.name} (${teacher.email}) - ${teacher.specialization || 'N/A'}`);
      });
    }
    
    console.log("\n=== Check Complete ===\n");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

checkData();
