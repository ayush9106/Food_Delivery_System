const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

/**
 * Review — users can rate a restaurant and/or a specific food item.
 * rating 1-5. restaurantId and foodId are nullable depending on the
 * review target.
 */
const Review = sequelize.define(
  "Review",
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
    restaurantId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    foodId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  { timestamps: true }
);

module.exports = Review;
