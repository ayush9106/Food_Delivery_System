/**
 * Standardised success response shape used by every controller:
 * { success: true, statusCode, message, data }
 */
const sendSuccess = (res, data = null, message = "Success", statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    data,
  });
};

module.exports = sendSuccess;
