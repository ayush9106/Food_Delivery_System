const cloudinary = require("cloudinary").v2;
const config = require("./env");

/**
 * Cloudinary configuration for image storage.
 * All uploads (profile images, restaurant images, food images)
 * go through this instance.
 */
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true,
});

module.exports = cloudinary;
