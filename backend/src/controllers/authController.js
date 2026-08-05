const { User, Role, ResetToken, DeliveryPartner } = require("../models");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const sendSuccess = require("../utils/sendSuccess");
const { signToken, signResetToken, verifyResetToken } = require("../services/tokenService");
const { sendMail } = require("../services/emailService");
const config = require("../config/env");

/**
 * Build the auth response: user + role + token.
 */
const buildAuthResponse = async (user) => {
  const role = await Role.findByPk(user.roleId);
  const token = signToken({ id: user.id });
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profileImage: user.profileImage,
      roleId: role ? role.id : null,
      role: role ? role.name : null,
    },
  };
};

/**
 * POST /api/auth/register — create a new account.
 * First customer/owner/delivery registration uses the matching role.
 */
exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password, phone, role = Role.CUSTOMER } = req.body;

  const roleRecord = await Role.findOne({ where: { name: role } });
  if (!roleRecord) return next(new AppError("Invalid role", 400));

  const exists = await User.findOne({ where: { email } });
  if (exists) return next(new AppError("Email already registered", 409));

  const user = await User.create({
    name,
    email,
    password,
    phone,
    roleId: roleRecord.id,
  });

  // Auto create a delivery profile when registering as a partner.
  if (role === Role.DELIVERY_PARTNER) {
    await DeliveryPartner.create({ userId: user.id, vehicleType: "bike" });
  }

  const data = await buildAuthResponse(user);
  sendSuccess(res, data, "Registration successful", 201);
});

/**
 * POST /api/auth/login — email + password login.
 */
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Email and password are required", 400));
  }

  const user = await User.scope("withPassword").findOne({ where: { email } });
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  if (user.isBlocked) {
    return next(new AppError("Your account has been blocked. Contact support.", 403));
  }

  const data = await buildAuthResponse(user);
  sendSuccess(res, data, "Login successful");
});

/**
 * GET /api/auth/me — current logged in user.
 */
exports.me = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.user.id, {
    include: [{ model: Role, as: "role", attributes: ["id", "name"] }],
  });
  sendSuccess(res, user);
});

/**
 * POST /api/auth/forgot-password — sends a reset link.
 */
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) {
    return sendSuccess(res, null, "If that email exists, a reset link has been sent.");
  }

  const resetToken = signResetToken({ id: user.id });
  await ResetToken.create({
    userId: user.id,
    token: resetToken,
    type: "reset",
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  });

  const resetUrl = `${config.clientUrl}/reset-password?token=${resetToken}`;
  await sendMail({
    to: user.email,
    subject: "Password reset link",
    html: `<p>Hi ${user.name},</p><p>Click the link below to reset your password:</p>
           <a href="${resetUrl}">${resetUrl}</a>
           <p>This link expires in 15 minutes.</p>`,
    text: `Reset your password: ${resetUrl}`,
  });

  sendSuccess(res, null, "If that email exists, a reset link has been sent.");
});

/**
 * POST /api/auth/reset-password — validates token & sets new password.
 */
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token, password } = req.body;
  const payload = verifyResetToken(token);
  if (!payload) return next(new AppError("Invalid or expired reset token", 400));

  const tokenRecord = await ResetToken.findOne({
    where: { token, isUsed: false, userId: payload.id },
  });
  if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
    return next(new AppError("Invalid or expired reset token", 400));
  }

  const user = await User.scope("withPassword").findByPk(payload.id);
  if (!user) return next(new AppError("User not found", 404));

  user.password = password;
  await user.save();
  tokenRecord.isUsed = true;
  await tokenRecord.save();

  sendSuccess(res, null, "Password reset successful. Please log in.");
});

/**
 * POST /api/auth/change-password — for logged in users.
 */
exports.changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.scope("withPassword").findByPk(req.user.id);

  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError("Current password is incorrect", 400));
  }

  user.password = newPassword;
  await user.save();
  sendSuccess(res, null, "Password changed successfully");
});
