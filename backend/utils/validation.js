// Validation utilities for input sanitization and validation

/**
 * Validates email format
 */
function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 150;
}

/**
 * Validates that a string is not empty and within length limits
 */
function isValidString(str, minLength = 1, maxLength = 255) {
  if (!str || typeof str !== "string") return false;
  const trimmed = str.trim();
  return trimmed.length >= minLength && trimmed.length <= maxLength;
}

/**
 * Validates that a value is a positive number
 */
function isPositiveNumber(value) {
  const num = Number(value);
  return !isNaN(num) && num > 0 && isFinite(num);
}

/**
 * Validates that a value is a valid ID (positive integer)
 */
function isValidId(id) {
  const num = Number(id);
  return Number.isInteger(num) && num > 0;
}

/**
 * Sanitizes string input by trimming whitespace
 */
function sanitizeString(str) {
  if (!str || typeof str !== "string") return "";
  return str.trim();
}

/**
 * Validates password strength
 * At least 8 characters, contains letter and number
 */
function isValidPassword(password) {
  if (!password || typeof password !== "string") return false;
  if (password.length < 8) return false;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasLetter && hasNumber;
}

/**
 * Validates grade format (e.g., "Grade 1", "Kindergarten")
 */
function isValidGrade(grade) {
  if (!grade || typeof grade !== "string") return false;
  return grade.trim().length > 0 && grade.length <= 50;
}

/**
 * Validates status enum
 */
function isValidStatus(status, allowedValues) {
  if (!status || typeof status !== "string") return false;
  return allowedValues.includes(status.toLowerCase());
}

/**
 * Validates role enum
 */
function isValidRole(role) {
  const validRoles = ["admin", "teacher", "student", "parent"];
  if (!role || typeof role !== "string") return false;
  return validRoles.includes(role.toLowerCase());
}

/**
 * Validates date string
 */
function isValidDate(dateString) {
  if (!dateString) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

/**
 * Validates that a date is not in the future
 */
function isNotFutureDate(dateString) {
  if (!isValidDate(dateString)) return false;
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return date <= today;
}

/**
 * Creates a validation error response
 */
function validationError(field, message) {
  return {
    field,
    message: message || `Invalid ${field}`,
  };
}

/**
 * Validates required fields exist in request body
 */
function validateRequiredFields(body, requiredFields) {
  const errors = [];
  for (const field of requiredFields) {
    if (body[field] === undefined || body[field] === null || body[field] === "") {
      errors.push(validationError(field, `${field} is required`));
    }
  }
  return errors;
}

/**
 * Validates attendance status
 */
function isValidAttendanceStatus(status) {
  return isValidStatus(status, ["present", "absent", "late"]);
}

/**
 * Validates student status
 */
function isValidStudentStatus(status) {
  return isValidStatus(status, ["active", "pass", "fail"]);
}

/**
 * Validates subscription status
 */
function isValidSubscriptionStatus(status) {
  return isValidStatus(status, ["pending", "paid", "late"]);
}

/**
 * Validates marks/grade value (0-100)
 */
function isValidMarks(marks) {
  const num = Number(marks);
  return Number.isInteger(num) && num >= 0 && num <= 100;
}

/**
 * Validates semester value
 */
function isValidSemester(semester) {
  const validSemesters = ["Semester 1", "Semester 2"];
  if (!semester || typeof semester !== "string") return false;
  return validSemesters.includes(semester);
}

/**
 * Validates subject name
 */
function isValidSubject(subject) {
  if (!subject || typeof subject !== "string") return false;
  return subject.trim().length > 0 && subject.length <= 100;
}

module.exports = {
  isValidEmail,
  isValidString,
  isPositiveNumber,
  isValidId,
  sanitizeString,
  isValidPassword,
  isValidGrade,
  isValidStatus,
  isValidRole,
  isValidDate,
  isNotFutureDate,
  validationError,
  validateRequiredFields,
  isValidAttendanceStatus,
  isValidStudentStatus,
  isValidSubscriptionStatus,
  isValidMarks,
  isValidSemester,
  isValidSubject,
};
