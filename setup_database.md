# Database Setup Guide for Student Management System

## Problem
The teacher management board shows "no data" because the database is not properly set up.

## Solution Steps

### 1. Check MySQL Installation
Make sure MySQL is installed and running:

```bash
# Check if MySQL service is running
Get-Service MySQL*
```

If MySQL is not installed, download and install it from:
https://dev.mysql.com/downloads/installer/

### 2. Create Database and Apply Schema

Open MySQL command line:
```bash
mysql -u root -p
```

Enter your password: `Miki@1324`

Then run these commands:

```sql
-- Create database
CREATE DATABASE IF NOT EXISTS student_management
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE student_management;

-- Run the full schema from schema.sql
-- Copy and paste the entire content from backend/schema.sql
```

Alternatively, run the schema file directly:
```bash
mysql -u root -pMiki@1324 < backend/schema.sql
```

### 3. Seed Initial Data

Run the seed script:
```bash
cd backend
npm run seed
```

This will create:
- Admin user: admin@school.com / password123
- Teacher user: teacher@school.com / password123
- Sample subscription plan
- Default grades (Kindergarten through Grade 12)
- Default subjects (Mathematics, Science, English, etc.)

### 4. Start Backend Server

```bash
cd backend
npm start
```

Or for development with auto-restart:
```bash
cd backend
npm run dev
```

### 5. Start Frontend Server

```bash
cd frontend
npm run dev
```

### 6. Test the Teacher Management Board

1. Open http://localhost:5173 in your browser
2. Login as admin: admin@school.com / password123
3. Go to Dashboard
4. Scroll down to the "Teacher Management Board" section

You should now see:
- Default grades and subjects populated
- Ability to create new teachers
- Ability to assign teachers to grades/subjects/sections
- Student linking functionality

## Additional Data to Add

If you want more sample data, you can add it via MySQL:

```sql
USE student_management;

-- Add more teachers
INSERT INTO users (name, email, password, role) VALUES 
  ('John Smith', 'john.smith@school.com', '$2a$10$...', 'teacher'),
  ('Sarah Johnson', 'sarah.j@school.com', '$2a$10$...', 'teacher');

-- Add corresponding teacher records
INSERT INTO teachers (user_id, qualifications, specialization, years_of_experience) VALUES
  (LAST_INSERT_ID()-1, 'M.Ed in Mathematics', 'Mathematics', 5),
  (LAST_INSERT_ID(), 'B.Sc in Science', 'Science', 3);

-- Add sample sections
INSERT INTO sections (name, grade_id, capacity) VALUES
  ('Section A', 1, 30),
  ('Section B', 1, 25),
  ('Section A', 2, 30);
```

## Troubleshooting

### Database Connection Error
If you see "MySQL connection failed" error:
1. Check that MySQL service is running
2. Verify the password in `backend/.env` matches your MySQL root password
3. Check if MySQL is running on port 3306

### No Data Showing
If the teacher management board still shows no data:
1. Check browser console for API errors (F12 → Console)
2. Verify backend server is running on port 5000
3. Check if CORS is configured correctly

### Permission Issues
If you get permission errors:
```sql
-- Grant privileges (run in MySQL as root)
GRANT ALL PRIVILEGES ON student_management.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

## Expected Results

After successful setup, the teacher management board should show:
- 13 default grades (Kindergarten to Grade 12)
- 13 default subjects
- Teacher creation form
- Assignment creation form
- Student linking functionality
- Filtering options

The board allows you to:
1. Create new teacher accounts
2. Assign teachers to specific grades, subjects, and sections
3. Link students to teacher assignments
4. Filter and manage existing assignments
5. Toggle assignment status (active/inactive)