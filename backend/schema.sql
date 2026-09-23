-- Student Management System - MySQL schema
-- Run this once against your MySQL server:
--   mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS student_management
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE student_management;

-- Every person who can log in (admin, teacher, student, parent)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'teacher', 'student', 'parent') NOT NULL DEFAULT 'student',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Extra profile info for users whose role is 'student'
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  grade VARCHAR(50),
  status ENUM('active', 'pass', 'fail') NOT NULL DEFAULT 'active',
  parent_id INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE SET NULL
);

-- School notices (FR-06)
CREATE TABLE IF NOT EXISTS notices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  created_by INT NOT NULL,
  published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Subscription plans an admin makes available (FR-02)
CREATE TABLE IF NOT EXISTS subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- A student's payment/subscription record
CREATE TABLE IF NOT EXISTS student_subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  subscription_id INT NOT NULL,
  amount_paid DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'paid', 'late') NOT NULL DEFAULT 'pending',
  paid_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
);

-- Daily attendance (FR-04)
CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  date DATE NOT NULL,
  status ENUM('present', 'absent', 'late') NOT NULL,
  recorded_by INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_attendance_per_day (student_id, date),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Academic Grades (FR-03 / Semester Grades)
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

-- Grade Periods Lifecycle (Admin Control: closed, open_for_teachers, published)
CREATE TABLE IF NOT EXISTS grade_periods (
  id INT AUTO_INCREMENT PRIMARY KEY,
  semester ENUM('Semester 1', 'Semester 2') NOT NULL UNIQUE,
  status ENUM('closed', 'open_for_teachers', 'published') NOT NULL DEFAULT 'closed',
  published_at DATETIME NULL,
  updated_by INT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

INSERT IGNORE INTO grade_periods (semester, status) VALUES 
  ('Semester 1', 'closed'),
  ('Semester 2', 'closed');


-- Teacher Management Tables
-- Extra profile info for users whose role is 'teacher'
CREATE TABLE IF NOT EXISTS teachers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  qualifications VARCHAR(255),
  specialization VARCHAR(100),
  years_of_experience INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Grade levels (e.g., Grade 1, Grade 2, etc.)
CREATE TABLE IF NOT EXISTS grades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255),
  order_index INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Subjects (e.g., Mathematics, Science, English, etc.)
CREATE TABLE IF NOT EXISTS subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255),
  code VARCHAR(20) UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sections within grades (e.g., Section A, Section B, etc.)
CREATE TABLE IF NOT EXISTS sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  grade_id INT NOT NULL,
  capacity INT DEFAULT 30,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_section_per_grade (name, grade_id),
  FOREIGN KEY (grade_id) REFERENCES grades(id) ON DELETE CASCADE
);

-- Teacher assignments to grades, subjects, and sections
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
);

-- Teacher-student linking for specific assignments
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
);

-- Insert default grades
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
  ('Grade 12', 'Twelfth grade high school', 13);

-- Insert default subjects
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
  ('Geography', 'Earth and environmental sciences', 'GEO');