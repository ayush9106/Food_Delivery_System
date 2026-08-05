const crypto = require("crypto");

/**
 * generateOrderNumber — human friendly unique order number
 * e.g. FD-8F3K2Z9Q
 */
const generateOrderNumber = () =>
  `FD-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

/**
 * generateToken — cryptographically strong random token.
 */
const generateToken = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");

/**
 * round2 — round a number to 2 decimal places.
 */
const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

module.exports = { generateOrderNumber, generateToken, round2 };
