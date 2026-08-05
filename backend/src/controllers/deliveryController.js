const { Order, OrderItem, Restaurant, Address, User, DeliveryPartner, Food, Review } = require("../models");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const sendSuccess = require("../utils/sendSuccess");
const { notify } = require("../services/notificationService");

/**
 * Helper — get the delivery profile of the current user.
 */
const getProfile = async (userId) => {
  const profile = await DeliveryPartner.findOne({ where: { userId } });
  if (!profile) throw new AppError("Delivery profile not found", 404);
  return profile;
};

/**
 * GET /api/delivery/dashboard — summary for the partner.
 */
exports.dashboard = catchAsync(async (req, res, next) => {
  const profile = await getProfile(req.user.id);

  const [available, active, delivered, earnings] = await Promise.all([
    Order.count({ where: { orderStatus: "preparing", deliveryPartnerId: null } }),
    Order.count({
      where: { deliveryPartnerId: profile.id, orderStatus: { [require("sequelize").Op.in]: ["preparing", "out_for_delivery"] } },
    }),
    Order.count({ where: { deliveryPartnerId: profile.id, orderStatus: "delivered" } }),
    Order.sum("deliveryFee", { where: { deliveryPartnerId: profile.id, orderStatus: "delivered" } }),
  ]);

  sendSuccess(res, {
    profile,
    available,
    active,
    delivered,
    earnings: Number(earnings || 0),
  });
});

/**
 * GET /api/delivery/available-orders — orders ready to be picked up.
 */
exports.availableOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.findAll({
    where: { orderStatus: "preparing", deliveryPartnerId: null },
    include: [
      { model: Restaurant, as: "restaurant", attributes: ["id", "name", "image", "address", "city", "phone"] },
      { model: OrderItem, as: "items" },
    ],
    order: [["id", "ASC"]],
  });
  sendSuccess(res, orders);
});

/**
 * POST /api/delivery/:orderId/accept — accept a delivery.
 */
exports.acceptDelivery = catchAsync(async (req, res, next) => {
  const profile = await getProfile(req.user.id);

  const order = await Order.findOne({
    where: { id: req.params.orderId, orderStatus: "preparing", deliveryPartnerId: null },
  });
  if (!order) return next(new AppError("Order not available for delivery", 404));

  order.deliveryPartnerId = profile.id;
  order.orderStatus = "out_for_delivery";
  order.outForDeliveryAt = new Date();
  await order.save();

  profile.availability = "busy";
  await profile.save();

  await notify({
    userId: order.userId,
    title: "Order out for delivery 🛵",
    message: `Your order ${order.orderNumber} is on the way.`,
    type: "order",
  });

  sendSuccess(res, order, "Delivery accepted");
});

/**
 * PATCH /api/delivery/:orderId/status — mark delivered.
 */
exports.markDelivered = catchAsync(async (req, res, next) => {
  const profile = await getProfile(req.user.id);

  const order = await Order.findOne({
    where: { id: req.params.orderId, deliveryPartnerId: profile.id, orderStatus: "out_for_delivery" },
  });
  if (!order) return next(new AppError("Order not found or not assigned to you", 404));

  order.orderStatus = "delivered";
  order.deliveredAt = new Date();
  order.paymentStatus = "paid";
  await order.save();

  profile.availability = "available";
  profile.totalDeliveries += 1;
  profile.earnings = Number(profile.earnings || 0) + Number(order.deliveryFee || 0);
  await profile.save();

  await notify({
    userId: order.userId,
    title: "Order delivered ✅",
    message: `Your order ${order.orderNumber} has been delivered. Enjoy your meal!`,
    type: "order",
  });

  sendSuccess(res, order, "Order delivered");
});

/**
 * PATCH /api/delivery/availability — toggle partner availability.
 */
exports.setAvailability = catchAsync(async (req, res, next) => {
  const profile = await getProfile(req.user.id);
  const { availability } = req.body;
  if (!["available", "busy", "offline"].includes(availability)) {
    return next(new AppError("Invalid availability value", 400));
  }
  profile.availability = availability;
  await profile.save();
  sendSuccess(res, profile, "Availability updated");
});

/**
 * GET /api/delivery/history — completed deliveries.
 */
exports.deliveryHistory = catchAsync(async (req, res, next) => {
  const profile = await getProfile(req.user.id);
  const orders = await Order.findAll({
    where: { deliveryPartnerId: profile.id },
    include: [
      { model: Restaurant, as: "restaurant", attributes: ["id", "name", "image"] },
      { model: Address, as: "address" },
    ],
    order: [["id", "DESC"]],
  });
  sendSuccess(res, orders);
});

/**
 * GET /api/delivery/earnings — earnings summary.
 */
exports.earnings = catchAsync(async (req, res, next) => {
  const profile = await getProfile(req.user.id);
  const orders = await Order.findAll({
    where: { deliveryPartnerId: profile.id, orderStatus: "delivered" },
    attributes: ["id", "orderNumber", "deliveryFee", "deliveredAt"],
    order: [["deliveredAt", "DESC"]],
  });
  sendSuccess(res, { profile, orders });
});
