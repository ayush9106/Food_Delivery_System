const { Sequelize } = require("sequelize");
const config = require("./env");

/**
 * Sequelize instance used by every model.
 * Connection pool tuning keeps the app fast under load.
 */
const sequelize = new Sequelize(config.db.name, config.db.user, config.db.password, {
  host: config.db.host,
  port: config.db.port,
  dialect: config.db.dialect,
  logging: config.env === "development" ? console.log : false,
  define: {
    underscored: false,
    freezeTableName: false,
    charset: "utf8mb4",
    collate: "utf8mb4_unicode_ci",
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 60000,
    idle: 10000,
  },
  timezone: "+00:00",
});

module.exports = sequelize;
