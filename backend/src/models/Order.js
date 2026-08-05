const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

/**
 * Order — one order belongs to one user + one restaurant.
 * orderStatus lifecycle:
 * pending -> accepted -> preparing -> out_for_delivery -> delivered
 *                    \-> rejected -> cancelled
 */
const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderNumber: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    restaurantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    deliveryPartnerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    addressId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    couponId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    itemsTotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    deliveryFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    tax: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    paymentMethod: {
      type: DataTypes.ENUM("cash", "card", "upi", "wallet"),
      defaultValue: "cash",
    },
    paymentStatus: {
      type: DataTypes.ENUM("pending", "paid", "failed", "refunded"),
      defaultValue: "pending",
    },
    orderStatus: {
      type: DataTypes.ENUM(
        "pending",
        "accepted",
        "preparing",
        "out_for_delivery",
        "delivered",
        "rejected",
        "cancelled"
      ),
      defaultValue: "pending",
    },
    deliveryAddress: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    estimatedDelivery: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    placedAt: DataTypes.DATE,
    acceptedAt: DataTypes.DATE,
    preparingAt: DataTypes.DATE,
    outForDeliveryAt: DataTypes.DATE,
    deliveredAt: DataTypes.DATE,
    cancelledAt: DataTypes.DATE,
  },
  { timestamps: true }
);

module.exports = Order;
