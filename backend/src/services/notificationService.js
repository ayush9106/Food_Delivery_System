const { Notification } = require("../models");

/**
 * Notification service — creates a notification for a user and is
 * the single place future push / websocket delivery can be added.
 */
const notify = async ({ userId, title, message, type = "info" }) => {
  try {
    return await Notification.create({ userId, title, message, type });
  } catch (err) {
    console.error("[notify] failed:", err.message);
    return null;
  }
};

module.exports = { notify };
