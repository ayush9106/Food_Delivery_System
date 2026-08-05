const sequelize = require("../config/database");
const {
  Order, OrderItem, CartItem, Food, Restaurant, Address, Coupon,
  User, Payment, DeliveryPartner, Notification,
} = require("../models");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const sendSuccess = require("../utils/sendSuccess");
const { generateOrderNumber, round2 } = require("../utils/helpers");
const { notify } = require("../services/notificationService");

const TAX_RATE = 0.05; // 5% GST — configurable

/**
 * Validate a coupon code and compute its discount.
 */
const computeCouponDiscount = async (code, itemsTotal) => {
  if (!code) return { coupon: null, discount: 0 };
  const coupon = await Coupon.findOne({ where: { code, isActive: true } });
  if (!coupon) return { coupon: null, discount: 0 };

  const now = new Date();
  if (now < coupon.validFrom || now > coupon.validTo) {
    return { coupon: null, discount: 0 };
  }
  if (itemsTotal < Number(coupon.minOrderAmount || 0)) {
    return { coupon: null, discount: 0 };
  }
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return { coupon: null, discount: 0 };
  }

  let discount =
    coupon.type === "percent"
      ? (itemsTotal * Number(coupon.value)) / 100
      : Number(coupon.value);

  if (coupon.maxDiscount) discount = Math.min(discount, Number(coupon.maxDiscount));
  discount = round2(discount);

  return { coupon, discount };
};

/* ------------------------------------------------------------------ *
 *  Customer endpoints
 * ------------------------------------------------------------------ */

/**
 * POST /api/orders — place an order from the DB cart.
 */
exports.placeOrder = catchAsync(async (req, res, next) => {
  const { addressId, paymentMethod = "cash", couponCode, deliveryPartnerId } = req.body;

  if (!["cash", "card", "upi", "wallet"].includes(paymentMethod)) {
    return next(new AppError("Invalid payment method", 400));
  }

  const address = await Address.findOne({
    where: { id: addressId, userId: req.user.id },
  });
  if (!address) return next(new AppError("Address not found", 404));

  const cartItems = await CartItem.findAll({
    where: { userId: req.user.id },
    include: [{ model: Food, as: "food" }],
  });
  if (!cartItems.length) return next(new AppError("Your cart is empty", 400));

  // All items must belong to the same restaurant for a single order.
  const restaurantId = cartItems[0].food.restaurantId;
  if (cartItems.some((i) => i.food.restaurantId !== restaurantId)) {
    return next(new AppError("Items from multiple restaurants must be ordered separately", 400));
  }

  const restaurant = await Restaurant.findOne({
    where: { id: restaurantId, status: "approved", isActive: true },
  });
  if (!restaurant) return next(new AppError("Restaurant is not available", 400));

  const itemsTotal = round2(
    cartItems.reduce((sum, i) => {
      const price = i.food.discountPrice ? Number(i.food.discountPrice) : Number(i.food.price);
      return sum + price * i.quantity;
    }, 0)
  );

  if (itemsTotal < Number(restaurant.minOrderAmount || 0)) {
    return next(new AppError(`Minimum order amount is ₹${restaurant.minOrderAmount}`, 400));
  }

  const { coupon, discount } = await computeCouponDiscount(couponCode, itemsTotal);
  const deliveryFee = Number(restaurant.deliveryFee || 0);
  const tax = round2((itemsTotal - discount) * TAX_RATE);
  const totalAmount = round2(itemsTotal + deliveryFee + tax - discount);

  // Optional: assign a specific delivery partner (used for testing).
  let partner = null;
  if (deliveryPartnerId) {
    partner = await DeliveryPartner.findOne({
      where: { id: deliveryPartnerId, availability: "available" },
    });
  }
  if (!partner) {
    partner = await DeliveryPartner.findOne({
      where: { availability: "available" },
      include: [{ model: User, as: "user", where: { isBlocked: false } }],
      order: [["totalDeliveries", "ASC"]],
    });
  }

  const result = await sequelize.transaction(async (t) => {
    const order = await Order.create(
      {
        orderNumber: generateOrderNumber(),
        userId: req.user.id,
        restaurantId,
        deliveryPartnerId: partner ? partner.id : null,
        addressId: address.id,
        couponId: coupon ? coupon.id : null,
        itemsTotal,
        deliveryFee,
        tax,
        discount,
        totalAmount,
        paymentMethod,
        paymentStatus: paymentMethod === "cash" ? "paid" : "pending",
        orderStatus: "pending",
        deliveryAddress: address.toJSON(),
        estimatedDelivery: new Date(Date.now() + (restaurant.deliveryTime || 30) * 60000),
        placedAt: new Date(),
      },
      { transaction: t }
    );

    await OrderItem.bulkCreate(
      cartItems.map((i) => ({
        orderId: order.id,
        foodId: i.foodId,
        name: i.food.name,
        price: i.food.discountPrice ? Number(i.food.discountPrice) : Number(i.food.price),
        quantity: i.quantity,
        image: i.food.image,
        isVeg: i.food.isVeg,
      })),
      { transaction: t }
    );

    if (coupon) {
      coupon.usedCount += 1;
      await coupon.save({ transaction: t });
    }

    if (partner) {
      partner.availability = "busy";
      await partner.save({ transaction: t });
    }

    await Payment.create(
      {
        orderId: order.id,
        userId: req.user.id,
        amount: totalAmount,
        method: paymentMethod,
        status: paymentMethod === "cash" ? "success" : "pending",
        gateway: "internal",
      },
      { transaction: t }
    );

    await CartItem.destroy({ where: { userId: req.user.id }, transaction: t });
    return order;
  });

  // Notifications (outside transaction so failures don't roll back the order).
  await notify({
    userId: restaurant.ownerId,
    title: "New order received",
    message: `Order ${result.orderNumber} for ₹${totalAmount} is waiting for your action.`,
    type: "order",
  });

  sendSuccess(res, { orderId: result.id, orderNumber: result.orderNumber, totalAmount }, "Order placed successfully", 201);
});

/**
 * GET /api/orders/my — current customer's orders.
 */
exports.myOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.findAll({
    where: { userId: req.user.id },
    include: [
      { model: Restaurant, as: "restaurant", attributes: ["id", "name", "image"] },
      { model: OrderItem, as: "items" },
    ],
    order: [["id", "DESC"]],
  });
  sendSuccess(res, orders);
});

/**
 * GET /api/orders/:id — order details (owner of the order).
 */
exports.getOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findOne({
    where: { id: req.params.id },
    include: [
      { model: User, as: "user", attributes: ["id", "name", "phone", "email"] },
      { model: Restaurant, as: "restaurant" },
      { model: OrderItem, as: "items" },
      { model: Payment, as: "payment" },
      { model: DeliveryPartner, as: "deliveryPartner", include: [{ model: User, as: "user", attributes: ["id", "name", "phone"] }] },
    ],
  });
  if (!order) return next(new AppError("Order not found", 404));

  const isCustomer = order.userId === req.user.id;
  const isOwner = order.restaurant.ownerId === req.user.id;
  const isAdmin = req.user.roleName === "admin";
  const isPartner = order.deliveryPartnerId && order.deliveryPartnerId === (req.user.deliveryProfileId || null);

  if (!isCustomer && !isOwner && !isAdmin && !isPartner) {
    return next(new AppError("You cannot view this order", 403));
  }

  sendSuccess(res, order);
});

/**
 * PATCH /api/orders/:id/cancel — customer cancels a pending order.
 */
exports.cancelOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findOne({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!order) return next(new AppError("Order not found", 404));
  if (!["pending", "accepted"].includes(order.orderStatus)) {
    return next(new AppError("Order can no longer be cancelled", 400));
  }

  order.orderStatus = "cancelled";
  order.cancelledAt = new Date();
  await order.save();

  if (order.deliveryPartnerId) {
    const partner = await DeliveryPartner.findByPk(order.deliveryPartnerId);
    if (partner) {
      partner.availability = "available";
      await partner.save();
    }
  }

  sendSuccess(res, order, "Order cancelled");
});

/* ------------------------------------------------------------------ *
 *  Restaurant owner endpoints
 * ------------------------------------------------------------------ */

/**
 * GET /api/orders/owner — orders for restaurants owned by the user.
 */
exports.ownerOrders = catchAsync(async (req, res, next) => {
  const restaurants = await Restaurant.findAll({ where: { ownerId: req.user.id } });
  const ids = restaurants.map((r) => r.id);

  const where = { restaurantId: ids };
  if (req.query.status) where.orderStatus = req.query.status;

  const orders = await Order.findAll({
    where,
    include: [
      { model: User, as: "user", attributes: ["id", "name", "phone"] },
      { model: OrderItem, as: "items" },
    ],
    order: [["id", "DESC"]],
  });
  sendSuccess(res, orders);
});

/**
 * PATCH /api/orders/:id/accept — owner accepts an order.
 */
exports.acceptOrder = catchAsync(async (req, res, next) => {
  const order = await this._findOwnerOrder(req.params.id, req.user.id);
  if (!order) return next(new AppError("Order not found or not yours", 404));
  if (order.orderStatus !== "pending") {
    return next(new AppError(`Order is already ${order.orderStatus}`, 400));
  }

  order.orderStatus = "accepted";
  order.acceptedAt = new Date();
  await order.save();

  await notify({
    userId: order.userId,
    title: "Order accepted",
    message: `Your order ${order.orderNumber} has been accepted by the restaurant.`,
    type: "order",
  });

  sendSuccess(res, order, "Order accepted");
});

/**
 * PATCH /api/orders/:id/reject — owner rejects an order.
 */
exports.rejectOrder = catchAsync(async (req, res, next) => {
  const order = await this._findOwnerOrder(req.params.id, req.user.id);
  if (!order) return next(new AppError("Order not found or not yours", 404));
  if (order.orderStatus !== "pending") {
    return next(new AppError(`Order is already ${order.orderStatus}`, 400));
  }

  order.orderStatus = "rejected";
  await order.save();

  if (order.deliveryPartnerId) {
    const partner = await DeliveryPartner.findByPk(order.deliveryPartnerId);
    if (partner) {
      partner.availability = "available";
      await partner.save();
    }
  }

  await notify({
    userId: order.userId,
    title: "Order rejected",
    message: `Sorry, your order ${order.orderNumber} was rejected by the restaurant.`,
    type: "order",
  });

  sendSuccess(res, order, "Order rejected");
});

/**
 * PATCH /api/orders/:id/preparing — owner starts preparing the food.
 */
exports.startPreparing = catchAsync(async (req, res, next) => {
  const order = await this._findOwnerOrder(req.params.id, req.user.id);
  if (!order) return next(new AppError("Order not found or not yours", 404));
  if (order.orderStatus !== "accepted") {
    return next(new AppError("Order must be accepted first", 400));
  }

  order.orderStatus = "preparing";
  order.preparingAt = new Date();
  await order.save();

  await notify({
    userId: order.userId,
    title: "Order is being prepared",
    message: `Your order ${order.orderNumber} is now being prepared.`,
    type: "order",
  });

  sendSuccess(res, order, "Order marked as preparing");
});

/**
 * Helper — find an order belonging to a restaurant owned by the user.
 */
exports._findOwnerOrder = async (orderId, userId) => {
  const order = await Order.findByPk(orderId, {
    include: [{ model: Restaurant, as: "restaurant" }],
  });
  if (!order || !order.restaurant || order.restaurant.ownerId !== userId) return null;
  return order;
};
