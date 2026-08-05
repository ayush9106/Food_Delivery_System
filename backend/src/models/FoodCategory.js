const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

/**
 * FoodCategory — categories can be global (restaurantId null)
 * or scoped to a specific restaurant.
 */
const FoodCategory = sequelize.define(
  "FoodCategory",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    restaurantId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  { timestamps: true }
);

module.exports = FoodCategory;
