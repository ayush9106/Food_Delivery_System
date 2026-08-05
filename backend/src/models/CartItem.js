const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

/**
 * CartItem — persisted cart per (user, food).
 * Keeps the cart synced across devices & sessions.
 */
const CartItem = sequelize.define(
  "CartItem",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    foodId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: { min: 1 },
    },
  },
  { timestamps: true }
);

module.exports = CartItem;
