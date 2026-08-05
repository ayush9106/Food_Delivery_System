const jwt = require("jsonwebtoken");
const { User, Role } = require("../models");
const AppError = require("../utils/AppError");
const config = require("../config/env");
const catchAsync = require("../utils/catchAsync");

/**
 * protect — verifies the Bearer token, loads the user and
 * attaches req.user. Rejects blocked accounts.
 */
const protect = catchAsync(async (req, res, next) => {
  let token;
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) {
    token = header.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("You are not logged in. Please log in first.", 401));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, config.jwt.secret);
  } catch (err) {
    return next(new AppError("Invalid or expired token. Please log in again.", 401));
  }

  const user = await User.findByPk(decoded.id, {
    include: [{ model: Role, as: "role", attributes: ["id", "name"] }],
  });

  if (!user) {
    return next(new AppError("The user belonging to this token no longer exists.", 401));
  }

  if (user.isBlocked) {
    return next(new AppError("Your account has been blocked. Contact support.", 403));
  }

  req.user = user;
  req.user.roleName = user.role ? user.role.name : null;
  next();
});

/**
 * restrictTo — role based authorization.
 * Usage: restrictTo(Role.ADMIN, Role.RESTAURANT_OWNER)
 */
const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.roleName)) {
      return next(
        new AppError("You do not have permission to perform this action.", 403)
      );
    }
    next();
  };

module.exports = { protect, restrictTo };
