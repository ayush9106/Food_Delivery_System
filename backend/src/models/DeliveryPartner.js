const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

/**
 * DeliveryPartner — profile data linked to a user with the
 * delivery_partner role.
 */
const DeliveryPartner = sequelize.define(
  "DeliveryPartner",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    vehicleType: {
      type: DataTypes.ENUM("bike", "scooter", "bicycle", "car"),
      defaultValue: "bike",
    },
    vehicleNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    availability: {
      type: DataTypes.ENUM("available", "busy", "offline"),
      defaultValue: "available",
    },
    currentLatitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    currentLongitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
    },
    totalDeliveries: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    earnings: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
  },
  { timestamps: true }
);

module.exports = DeliveryPartner;
