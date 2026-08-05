const multer = require("multer");
const path = require("path");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const AppError = require("../utils/AppError");

const ALLOWED = {
  image: ["image/jpeg", "image/png", "image/webp", "image/gif"],
};

/**
 * File filter — reject non image files.
 */
const fileFilter = (req, file, cb) => {
  if (!ALLOWED.image.includes(file.mimetype)) {
    return cb(new AppError("Only image files (jpeg, png, webp, gif) are allowed.", 400));
  }
  cb(null, true);
};

/**
 * Cloudinary storage — used when CLOUDINARY_* env vars are configured.
 * Falls back to local disk storage for development without Cloudinary.
 */
let uploadMiddleware;

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "food-delivery",
      allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
      transformation: [{ width: 800, height: 800, crop: "limit" }],
    },
  });
  uploadMiddleware = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
} else {
  // Local disk fallback — ideal for development / demo without credentials.
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, "../../public/uploads");
      const fs = require("fs");
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, unique);
    },
  });
  uploadMiddleware = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
  });
}

/**
 * getUploadedUrl — extracts a usable URL from a multer file object
 * (works for both Cloudinary and local disk storage).
 */
const getUploadedUrl = (file) => {
  if (!file) return null;
  if (file.path && file.path.includes("uploads")) {
    return `/uploads/${path.basename(file.path)}`;
  }
  return file.path || (file.secure_url || null);
};

module.exports = { uploadMiddleware, getUploadedUrl };
