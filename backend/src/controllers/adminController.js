const sequelize = require("../config/database");
const {
  User, Role, Restaurant, Food, FoodCategory, Order, OrderItem,
  Payment, Coupon, Offer, DeliveryPartner, Review,
} = require("../models");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const sendSuccess = require("../utils/sendSuccess");
const { notify } = require("../services/notificationService");

/**
 * GET /api/admin/stats — headline numbers for the admin dashboard.
 */
exports.stats = catchAsync(async (req, res, next) => {
  const [
    users, restaurants, foods, orders, revenue, pendingRestaurants,
    activeDeliveryPartners, deliveredOrders, blockedUsers,
  ] = await Promise.all([
    User.count(),
    Restaurant.count(),
    Food.count(),
    Order.count(),
    Order.sum("totalAmount", { where: { orderStatus: { [require("sequelize").Op.notIn]: ["cancelled", "rejected"] } } }),
    Restaurant.count({ where: { status: "pending" } }),
    DeliveryPartner.count({ where: { availability: { [require("sequelize").Op.in]: ["available", "busy"] } } }),
    Order.count({ where: { orderStatus: "delivered" } }),
    User.count({ where: { isBlocked: true } }),
  ]);

  const byRole = await User.findAll({
    attributes: ["roleId", [sequelize.fn("COUNT", sequelize.col("User.id")), "count"]],
    group: ["roleId"],
    include: [{ model: Role, as: "role", attributes: ["name"] }],
    raw: true,
  });

  sendSuccess(res, {
    users, restaurants, foods, orders,
    revenue: Number(revenue || 0),
    pendingRestaurants,
    activeDeliveryPartners,
    deliveredOrders,
    blockedUsers,
    byRole,
  });
});

/**
 * GET /api/admin/users — list users with role filtering.
 */
exports.listUsers = catchAsync(async (req, res, next) => {
  const { role, search, page = 1, limit = 10 } = req.query;
  const where = {};

  if (role && role !== "all") {
    const roleRecord = await Role.findOne({ where: { name: role } });
    if (roleRecord) where.roleId = roleRecord.id;
  }
  if (search) {
    where[require("sequelize").Op.or] = [
      { name: { [require("sequelize").Op.like]: `%${search}%` } },
      { email: { [require("sequelize").Op.like]: `%${search}%` } },
    ];
  }

  const { count, rows } = await User.findAndCountAll({
    where,
    include: [{ model: Role, as: "role", attributes: ["id", "name"] }],
    order: [["id", "DESC"]],
    limit: Number(limit),
    offset: (Number(page) - 1) * Number(limit),
    distinct: true,
  });

  sendSuccess(res, {
    results: rows,
    total: count,
    page: Number(page),
    totalPages: Math.ceil(count / Number(limit)),
  });
});

/**
 * PATCH /api/admin/users/:id/block — block or unblock a user.
 */
exports.toggleBlockUser = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return next(new AppError("User not found", 404));
  if (user.id === req.user.id) return next(new AppError("You cannot block yourself", 400));

  user.isBlocked = !user.isBlocked;
  await user.save();

  sendSuccess(res, user, user.isBlocked ? "User blocked" : "User unblocked");
});

/**
 * GET /api/admin/restaurants — list all restaurants.
 */
exports.listRestaurants = catchAsync(async (req, res, next) => {
  const { status, search, page = 1, limit = 10 } = req.query;
  const where = {};
  if (status && status !== "all") where.status = status;
  if (search) {
    where[require("sequelize").Op.or] = [
      { name: { [require("sequelize").Op.like]: `%${search}%` } },
      { cuisine: { [require("sequelize").Op.like]: `%${search}%` } },
    ];
  }

  const { count, rows } = await Restaurant.findAndCountAll({
    where,
    include: [{ model: User, as: "owner", attributes: ["id", "name", "email"] }],
    order: [["id", "DESC"]],
    limit: Number(limit),
    offset: (Number(page) - 1) * Number(limit),
    distinct: true,
  });

  sendSuccess(res, {
    results: rows,
    total: count,
    page: Number(page),
    totalPages: Math.ceil(count / Number(limit)),
  });
});

/**
 * PATCH /api/admin/restaurants/:id/approve — approve/reject restaurant.
 */
exports.approveRestaurant = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  if (!["approved", "rejected", "pending"].includes(status)) {
    return next(new AppError("Invalid status", 400));
  }

  const restaurant = await Restaurant.findByPk(req.params.id);
  if (!restaurant) return next(new AppError("Restaurant not found", 404));

  restaurant.status = status;
  await restaurant.save();

  await notify({
    userId: restaurant.ownerId,
    title: status === "approved" ? "Restaurant approved ✅" : "Restaurant rejected",
    message: status === "approved"
      ? `Congratulations! "${restaurant.name}" is now live on the platform.`
      : `Your restaurant "${restaurant.name}" was not approved. Please review the details.`,
    type: "restaurant",
  });

  sendSuccess(res, restaurant, `Restaurant ${status}`);
});

/**
 * GET /api/admin/orders — all orders with filters.
 */
exports.listOrders = catchAsync(async (req, res, next) => {
  const { status, page = 1, limit = 10 } = req.query;
  const where = {};
  if (status && status !== "all") where.orderStatus = status;

  const { count, rows } = await Order.findAndCountAll({
    where,
    include: [
      { model: User, as: "user", attributes: ["id", "name", "email"] },
      { model: Restaurant, as: "restaurant", attributes: ["id", "name"] },
      { model: OrderItem, as: "items" },
    ],
    order: [["id", "DESC"]],
    limit: Number(limit),
    offset: (Number(page) - 1) * Number(limit),
    distinct: true,
  });

  sendSuccess(res, {
    results: rows,
    total: count,
    page: Number(page),
    totalPages: Math.ceil(count / Number(limit)),
  });
});

/**
 * GET /api/admin/coupons / offers — passthrough to coupon & offer list.
 */
exports.listCoupons = catchAsync(async (req, res, next) => {
  const coupons = await Coupon.findAll({ order: [["id", "DESC"]] });
  sendSuccess(res, coupons);
});

exports.listOffers = catchAsync(async (req, res, next) => {
  const offers = await Offer.findAll({ order: [["id", "DESC"]] });
  sendSuccess(res, offers);
});

/**
 * GET /api/admin/delivery-partners — list delivery partners.
 */
exports.listDeliveryPartners = catchAsync(async (req, res, next) => {
  const partners = await DeliveryPartner.findAll({
    include: [{ model: User, as: "user", attributes: ["id", "name", "email", "phone", "isBlocked"] }],
    order: [["id", "DESC"]],
  });
  sendSuccess(res, partners);
});

/**
 * GET /api/admin/reports — customer / restaurant / delivery report exports.
 */
exports.reports = catchAsync(async (req, res, next) => {
  const { type } = req.query;

  if (type === "customers") {
    const data = await User.findAll({
      attributes: [
        "id", "name", "email", "phone", "createdAt",
        [sequelize.fn("COUNT", sequelize.col("orders.id")), "orderCount"],
        [sequelize.fn("COALESCE", sequelize.fn("SUM", sequelize.col("orders.totalAmount")), 0), "totalSpend"],
      ],
      include: [
        { model: Role, as: "role", where: { name: "customer" }, attributes: [] },
        { model: Order, as: "orders", attributes: [] },
      ],
      group: ["User.id"],
      subQuery: false,
      raw: true,
    });
    return sendSuccess(res, data);
  }

  if (type === "restaurants") {
    const data = await Restaurant.findAll({
      attributes: [
        "id", "name", "cuisine", "city", "status", "rating", "createdAt",
        [sequelize.fn("COUNT", sequelize.col("orders.id")), "orderCount"],
        [sequelize.fn("COALESCE", sequelize.fn("SUM", sequelize.col("orders.totalAmount")), 0), "revenue"],
      ],
      include: [{ model: Order, as: "orders", attributes: [] }],
      group: ["Restaurant.id"],
      subQuery: false,
      raw: true,
    });
    return sendSuccess(res, data);
  }

  if (type === "delivery") {
    const data = await DeliveryPartner.findAll({
      attributes: [
        "id", "vehicleType", "vehicleNumber", "availability", "rating",
        "totalDeliveries", "earnings",
      ],
      include: [{ model: User, as: "user", attributes: ["name", "email", "phone"] }],
      raw: true,
    });
    return sendSuccess(res, data);
  }

  return next(new AppError("Invalid report type", 400));
});
