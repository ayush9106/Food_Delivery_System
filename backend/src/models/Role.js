const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

/**
 * Role table — holds the four platform roles.
 * @name  customer | restaurant_owner | admin | delivery_partner
 */
const Role = sequelize.define(
  "Role",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

Role.CUSTOMER = "customer";
Role.RESTAURANT_OWNER = "restaurant_owner";
Role.ADMIN = "admin";
Role.DELIVERY_PARTNER = "delivery_partner";

module.exports = Role;
