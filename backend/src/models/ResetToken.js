const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

/**
 * ResetToken — single-use tokens for password reset / account
 * verification. type: "reset" | "verify".
 */
const ResetToken = sequelize.define(
  "ResetToken",
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
    token: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("reset", "verify"),
      defaultValue: "reset",
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isUsed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  { timestamps: true }
);

module.exports = ResetToken;
