/**
 * AppError — operational error with a status code and optional
 * validation field map. Handled centrally by the error middleware.
 */
class AppError extends Error {
  constructor(message, statusCode = 400, fields = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    this.fields = fields;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
