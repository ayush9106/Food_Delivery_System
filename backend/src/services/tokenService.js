const jwt = require("jsonwebtoken");
const config = require("../config/env");

/**
 * signToken — JWT used for authenticated sessions.
 */
const signToken = (payload) =>
  jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

/**
 * signResetToken — short lived token for password reset.
 */
const signResetToken = (payload) =>
  jwt.sign(payload, config.jwt.resetSecret, {
    expiresIn: config.jwt.resetExpiresIn,
  });

/**
 * verifyResetToken — verifies a reset token, returns payload or null.
 */
const verifyResetToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.resetSecret);
  } catch (err) {
    return null;
  }
};

module.exports = { signToken, signResetToken, verifyResetToken };
