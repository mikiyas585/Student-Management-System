// Test database connection script
const mysql = require('mysql2');

console.log('Testing database connection...');

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'Miki@1324',
  database: 'student_management'
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    console.log('\nTroubleshooting steps:');
    console.log('1. Check if MySQL service is running');
    console.log('2. Verify password is correct');
    console.log('3. Check if MySQL is installed');
    console.log('4. Try connecting with: mysql -u root -p');
    process.exit(1);
  }
  
  console.log('✅ Database connection successful!');
  
  // Check if tables exist
  connection.query('SHOW TABLES', (err, results) => {
    if (err) {
      console.error('Error checking tables:', err.message);
      connection.end();
      return;
    }
    
    console.log(`\n📊 Found ${results.length} tables in database:`);
    results.forEach((row, index) => {
      const tableName = Object.values(row)[0];
      console.log(`  ${index + 1}. ${tableName}`);
    });
    
    // Check for teacher-related tables
    const teacherTables = ['teachers', 'grades', 'subjects', 'sections', 'teacher_assignments', 'teacher_students'];
    console.log('\n🔍 Checking for teacher management tables:');
    
    teacherTables.forEach(table => {
      connection.query(`SHOW TABLES LIKE '${table}'`, (err, res) => {
        if (res.length > 0) {
          console.log(`  ✅ ${table} table exists`);
          
          // Count rows
          connection.query(`SELECT COUNT(*) as count FROM ${table}`, (err, countRes) => {
            if (!err) {
              console.log(`     - Has ${countRes[0].count} records`);
            }
          });
        } else {
          console.log(`  ❌ ${table} table is missing`);
        }
      });
    });
    
    setTimeout(() => {
      connection.end();
      console.log('\n💡 Next steps:');
      console.log('1. If tables are missing, run: mysql -u root -pMiki@1324 < backend/schema.sql');
      console.log('2. Seed data: cd backend && npm run seed');
      console.log('3. Start backend: cd backend && npm start');
      console.log('4. Start frontend: cd frontend && npm run dev');
    }, 1000);
  });
});