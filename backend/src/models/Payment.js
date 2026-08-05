const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

/**
 * Payment — payment history for every order.
 * gateway column keeps the architecture ready for Stripe / Razorpay /
 * PayPal etc. `meta` stores the gateway's raw response.
 */
const Payment = sequelize.define(
  "Payment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    method: {
      type: DataTypes.ENUM("cash", "card", "upi", "wallet"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "success", "failed", "refunded"),
      defaultValue: "pending",
    },
    gateway: {
      type: DataTypes.STRING(50),
      defaultValue: "internal",
    },
    transactionId: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    meta: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    paidAt: DataTypes.DATE,
  },
  { timestamps: true }
);

module.exports = Payment;
