const { pool } = require("../config/db");

async function diagnose() {
  console.log("\n=== 🔍 SYSTEM DIAGNOSTICS ===\n");
  
  try {
    // Test database connection
    console.log("1️⃣ Testing Database Connection...");
    const connection = await pool.getConnection();
    console.log("   ✅ Database connected successfully");
    connection.release();
    
    // Check all tables exist
    console.log("\n2️⃣ Checking Tables...");
    const requiredTables = [
      'users', 'students', 'teachers', 'grades', 'subjects', 
      'sections', 'teacher_assignments', 'teacher_students',
      'notices', 'subscriptions', 'attendance', 'academic_grades'
    ];
    
    for (const table of requiredTables) {
      try {
        const [rows] = await pool.execute(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`   ✅ ${table}: ${rows[0].count} records`);
      } catch (err) {
        console.log(`   ❌ ${table}: TABLE NOT FOUND`);
      }
    }
    
    // Check admin user exists
    console.log("\n3️⃣ Checking Admin User...");
    const [adminRows] = await pool.execute(
      "SELECT id, name, email, role FROM users WHERE role = 'admin' LIMIT 1"
    );
    if (adminRows.length > 0) {
      console.log(`   ✅ Admin user found: ${adminRows[0].email}`);
    } else {
      console.log(`   ❌ No admin user found!`);
    }
    
    // Check teacher data
    console.log("\n4️⃣ Checking Teacher Data...");
    const [teacherRows] = await pool.execute(`
      SELECT t.id, u.name, u.email, t.specialization
      FROM teachers t
      JOIN users u ON u.id = t.user_id
      LIMIT 5
    `);
    
    if (teacherRows.length > 0) {
      console.log(`   ✅ Found ${teacherRows.length} teachers:`);
      teacherRows.forEach(t => {
        console.log(`      - ${t.name} (${t.email})`);
      });
    } else {
      console.log(`   ⚠️  No teachers found`);
    }
    
    // Check reference data
    console.log("\n5️⃣ Checking Reference Data...");
    const [gradeCount] = await pool.execute("SELECT COUNT(*) as count FROM grades");
    const [subjectCount] = await pool.execute("SELECT COUNT(*) as count FROM subjects");
    const [sectionCount] = await pool.execute("SELECT COUNT(*) as count FROM sections");
    
    console.log(`   Grades: ${gradeCount[0].count} (expected: 13)`);
    console.log(`   Subjects: ${subjectCount[0].count} (expected: 13)`);
    console.log(`   Sections: ${sectionCount[0].count} (expected: 39)`);
    
    if (gradeCount[0].count < 13) {
      console.log(`   ⚠️  Missing grades! Run setup_teacher_tables.js`);
    }
    if (subjectCount[0].count < 13) {
      console.log(`   ⚠️  Missing subjects! Run setup_teacher_tables.js`);
    }
    if (sectionCount[0].count < 39) {
      console.log(`   ⚠️  Missing sections! Run setup_teacher_tables.js`);
    }
    
    console.log("\n=== ✅ DIAGNOSTICS COMPLETE ===\n");
    
    // Summary
    const allGood = 
      gradeCount[0].count >= 13 && 
      subjectCount[0].count >= 13 && 
      sectionCount[0].count >= 39 &&
      adminRows.length > 0;
    
    if (allGood) {
      console.log("🎉 ALL SYSTEMS OPERATIONAL!");
      console.log("\nNext steps:");
      console.log("1. Make sure backend server is running (npm start)");
      console.log("2. Make sure frontend is running (npm run dev)");
      console.log("3. Login at http://localhost:5173");
      console.log("   Email: admin@school.com");
      console.log("   Password: password123");
    } else {
      console.log("⚠️  ISSUES DETECTED!");
      console.log("\nRun these commands to fix:");
      console.log("1. node scripts/setup_teacher_tables.js");
      console.log("2. npm run seed");
    }
    
    process.exit(0);
  } catch (err) {
    console.error("\n❌ ERROR:", err.message);
    console.error("\nPossible causes:");
    console.error("- MySQL service not running");
    console.error("- Wrong database credentials in .env");
    console.error("- Database 'student_management' doesn't exist");
    process.exit(1);
  }
}

diagnose();
