require("dotenv").config();

/**
 * Centralised environment configuration.
 * Every process.env value is read from here so that secrets
 * are accessed in exactly one place.
 */
module.exports = {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,

  db: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    name: process.env.DB_NAME || "food_delivery",
    dialect: process.env.DB_DIALECT || "mysql",
  },

  jwt: {
    secret: process.env.JWT_SECRET || "dev_secret_change_me",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    resetSecret: process.env.JWT_RESET_SECRET || "reset_secret_change_me",
    resetExpiresIn: process.env.JWT_RESET_EXPIRES_IN || "15m",
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  mail: {
    host: process.env.MAIL_HOST || "smtp.gmail.com",
    port: process.env.MAIL_PORT || 587,
    user: process.env.MAIL_USER,
    password: process.env.MAIL_PASSWORD,
    from: process.env.MAIL_FROM || "Food Delivery <noreply@fooddelivery.com>",
  },

  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
};
