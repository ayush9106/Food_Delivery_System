const sequelize = require("../config/database");
const { Order, OrderItem, Food, Restaurant, User, Payment, DeliveryPartner, Review } = require("../models");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const sendSuccess = require("../utils/sendSuccess");

const Op = require("sequelize").Op;

/**
 * Revenue by day (last N days) — powers the line chart.
 */
const revenueByDay = async (days = 30) => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const orders = await Order.findAll({
    attributes: [
      [sequelize.fn("DATE", sequelize.col("createdAt")), "date"],
      [sequelize.fn("SUM", sequelize.col("totalAmount")), "revenue"],
      [sequelize.fn("COUNT", sequelize.col("id")), "orders"],
    ],
    where: {
      createdAt: { [Op.gte]: since },
      orderStatus: { [Op.notIn]: ["cancelled", "rejected"] },
    },
    group: [sequelize.fn("DATE", sequelize.col("createdAt"))],
    order: [[sequelize.fn("DATE", sequelize.col("createdAt")), "ASC"]],
    raw: true,
  });
  return orders.map((o) => ({
    date: o.date,
    revenue: Number(o.revenue || 0),
    orders: Number(o.orders || 0),
  }));
};

/**
 * GET /api/analytics/admin — full admin analytics bundle.
 */
exports.adminAnalytics = catchAsync(async (req, res, next) => {
  const days = Number(req.query.days) || 30;

  const [revenueSeries, topFoods, topRestaurants, statusBreakdown, recentOrders, paymentBreakdown] =
    await Promise.all([
      revenueByDay(days),

      // Top selling foods
      OrderItem.findAll({
        attributes: [
          "name", "foodId",
          [sequelize.fn("SUM", sequelize.col("quantity")), "totalSold"],
          [sequelize.fn("SUM", sequelize.fn("IF", sequelize.col("OrderItem.price") === 0, 0, sequelize.literal("OrderItem.price * OrderItem.quantity"))), "revenue"],
        ],
        include: [
          {
            model: Order,
            as: "order",
            attributes: [],
            where: { orderStatus: { [Op.notIn]: ["cancelled", "rejected"] } },
          },
        ],
        group: ["OrderItem.foodId", "OrderItem.name"],
        order: [[sequelize.literal("totalSold"), "DESC"]],
        limit: 8,
        subQuery: false,
        raw: true,
      }),

      // Top restaurants by revenue
      Restaurant.findAll({
        attributes: [
          "id", "name", "image",
          [sequelize.fn("COUNT", sequelize.col("orders.id")), "orderCount"],
          [sequelize.fn("COALESCE", sequelize.fn("SUM", sequelize.col("orders.totalAmount")), 0), "revenue"],
        ],
        include: [
          {
            model: Order,
            as: "orders",
            attributes: [],
            where: { orderStatus: { [Op.notIn]: ["cancelled", "rejected"] } },
            required: true,
          },
        ],
        group: ["Restaurant.id"],
        order: [[sequelize.literal("revenue"), "DESC"]],
        limit: 8,
        subQuery: false,
        raw: true,
      }),

      // Order status distribution
      Order.findAll({
        attributes: ["orderStatus", [sequelize.fn("COUNT", sequelize.col("id")), "count"]],
        group: ["orderStatus"],
        raw: true,
      }),

      // Recent orders
      Order.findAll({
        include: [
          { model: User, as: "user", attributes: ["id", "name"] },
          { model: Restaurant, as: "restaurant", attributes: ["id", "name", "image"] },
          { model: OrderItem, as: "items" },
        ],
        order: [["id", "DESC"]],
        limit: 10,
      }),

      // Payment method breakdown
      Payment.findAll({
        attributes: ["method", [sequelize.fn("SUM", sequelize.col("amount")), "total"]],
        where: { status: "success" },
        group: ["method"],
        raw: true,
      }),
    ]);

  sendSuccess(res, {
    revenueSeries,
    topFoods,
    topRestaurants,
    statusBreakdown,
    recentOrders,
    paymentBreakdown,
  });
});

/**
 * GET /api/analytics/owner — analytics for the owner's restaurants.
 */
exports.ownerAnalytics = catchAsync(async (req, res, next) => {
  const restaurants = await Restaurant.findAll({ where: { ownerId: req.user.id } });
  const ids = restaurants.map((r) => r.id);
  if (!ids.length) return sendSuccess(res, { restaurants: [], revenueSeries: [], topFoods: [], recentOrders: [], totals: {} });

  const days = Number(req.query.days) || 30;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const orderWhere = { restaurantId: ids, createdAt: { [Op.gte]: since } };

  const [revenueSeries, topFoods, recentOrders, totals] = await Promise.all([
    Order.findAll({
      attributes: [
        [sequelize.fn("DATE", sequelize.col("createdAt")), "date"],
        [sequelize.fn("SUM", sequelize.col("totalAmount")), "revenue"],
        [sequelize.fn("COUNT", sequelize.col("id")), "orders"],
      ],
      where: orderWhere,
      group: [sequelize.fn("DATE", sequelize.col("createdAt"))],
      order: [[sequelize.fn("DATE", sequelize.col("createdAt")), "ASC"]],
      raw: true,
    }),
    OrderItem.findAll({
      attributes: [
        "name",
        [sequelize.fn("SUM", sequelize.col("quantity")), "totalSold"],
      ],
      include: [
        {
          model: Order,
          as: "order",
          attributes: [],
          where: orderWhere,
        },
      ],
      group: ["OrderItem.name"],
      order: [[sequelize.literal("totalSold"), "DESC"]],
      limit: 8,
      subQuery: false,
      raw: true,
    }),
    Order.findAll({
      where: { restaurantId: ids },
      include: [{ model: OrderItem, as: "items" }],
      order: [["id", "DESC"]],
      limit: 10,
    }),
    Order.findAll({
      attributes: [
        [sequelize.fn("COUNT", sequelize.col("id")), "orderCount"],
        [sequelize.fn("SUM", sequelize.col("totalAmount")), "revenue"],
        [sequelize.fn("AVG", sequelize.col("totalAmount")), "avgOrder"],
      ],
      where: orderWhere,
      raw: true,
    }),
  ]);

  sendSuccess(res, {
    restaurants,
    revenueSeries: revenueSeries.map((o) => ({
      date: o.date,
      revenue: Number(o.revenue || 0),
      orders: Number(o.orders || 0),
    })),
    topFoods,
    recentOrders,
    totals: {
      orderCount: Number(totals[0]?.orderCount || 0),
      revenue: Number(totals[0]?.revenue || 0),
      avgOrder: Number(totals[0]?.avgOrder || 0),
    },
  });
});
