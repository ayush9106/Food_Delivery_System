const AppError = require("../utils/AppError");

/**
 * Central error handler. Always logs and returns a consistent
 * JSON shape. In development extra detail is included.
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Sequelize validation / unique constraint errors
  if (err.name === "SequelizeUniqueConstraintError") {
    const field = err.errors && err.errors[0] ? err.errors[0].path : "field";
    error = new AppError(`${field} already exists`, 409);
  }
  if (err.name === "SequelizeValidationError") {
    error = new AppError(
      err.errors[0] ? err.errors[0].message : "Validation error",
      422
    );
  }
  if (err.name === "SequelizeForeignKeyConstraintError") {
    error = new AppError("Related record not found", 400);
  }

  // Multer file too large
  if (err.code === "LIMIT_FILE_SIZE") {
    error = new AppError("File too large. Maximum size is 5MB.", 400);
  }

  // Invalid JSON body
  if (err.type === "entity.parse.failed") {
    error = new AppError("Invalid JSON payload", 400);
  }

  // JSON web token errors
  if (err.name === "JsonWebTokenError") {
    error = new AppError("Invalid token. Please log in again.", 401);
  }
  if (err.name === "TokenExpiredError") {
    error = new AppError("Your token has expired. Please log in again.", 401);
  }

  const payload = {
    success: false,
    statusCode: error.statusCode,
    message: error.message || "Something went wrong",
  };

  if (error.fields) payload.fields = error.fields;
  if (process.env.NODE_ENV === "development") payload.stack = err.stack;

  if (error.statusCode >= 500) {
    console.error("💥 ERROR:", err);
  }

  res.status(error.statusCode || 500).json(payload);
};

/**
 * 404 handler for unknown routes.
 */
const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

module.exports = { errorHandler, notFound };
