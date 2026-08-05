const { Notification } = require("../models");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const sendSuccess = require("../utils/sendSuccess");

/**
 * GET /api/notifications
 */
exports.getNotifications = catchAsync(async (req, res, next) => {
  const notifications = await Notification.findAll({
    where: { userId: req.user.id },
    order: [["id", "DESC"]],
    limit: 50,
  });
  const unread = notifications.filter((n) => !n.isRead).length;
  sendSuccess(res, { notifications, unread });
});

/**
 * PATCH /api/notifications/:id/read
 */
exports.markAsRead = catchAsync(async (req, res, next) => {
  const notification = await Notification.findOne({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!notification) return next(new AppError("Notification not found", 404));

  notification.isRead = true;
  await notification.save();
  sendSuccess(res, notification, "Notification marked as read");
});

/**
 * PATCH /api/notifications/read-all
 */
exports.markAllRead = catchAsync(async (req, res, next) => {
  await Notification.update(
    { isRead: true },
    { where: { userId: req.user.id, isRead: false } }
  );
  sendSuccess(res, null, "All notifications marked as read");
});
