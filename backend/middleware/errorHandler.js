// Centralized error handling middleware

/**
 * Custom API Error class
 */
class ApiError extends Error {
  constructor(statusCode, message, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Creates a standardized error response
 */
function createErrorResponse(statusCode, message, errors = null, stack = null) {
  const response = {
    success: false,
    message,
    statusCode,
  };

  if (errors) {
    response.errors = errors;
  }

  // Include stack trace in development only
  if (process.env.NODE_ENV === "development" && stack) {
    response.stack = stack;
  }

  return response;
}

/**
 * Creates a standardized success response
 */
function createSuccessResponse(data, message = "Success") {
  return {
    success: true,
    message,
    data,
  };
}

/**
 * Global error handling middleware
 * Should be placed at the end of all routes
 */
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let errors = err.errors || null;

  // Log error for debugging
  if (statusCode === 500) {
    console.error("Unhandled Error:", {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      body: req.body,
      timestamp: new Date().toISOString(),
    });
  }

  // Handle specific error types
  if (err.code === "ER_DUP_ENTRY") {
    statusCode = 409;
    message = "Duplicate entry. This record already exists.";
  } else if (err.code === "ER_NO_REFERENCED_ROW_2") {
    statusCode = 400;
    message = "Invalid reference. Related record does not exist.";
  } else if (err.code === "ER_ROW_IS_REFERENCED_2") {
    statusCode = 409;
    message = "Cannot delete. This record is referenced by other records.";
  } else if (err.code === "ER_BAD_FIELD_ERROR") {
    statusCode = 400;
    message = "Invalid field in database query.";
  } else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token.";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired.";
  }

  res.status(statusCode).json(
    createErrorResponse(statusCode, message, errors, err.stack)
  );
}

/**
 * Async error wrapper to catch async errors
 */
function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 404 Not Found handler
 */
function notFoundHandler(req, res) {
  res.status(404).json(
    createErrorResponse(
      404,
      `Route ${req.method} ${req.originalUrl} not found`
    )
  );
}

module.exports = {
  ApiError,
  errorHandler,
  asyncHandler,
  notFoundHandler,
  createErrorResponse,
  createSuccessResponse,
};
