const router = require("express").Router();
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");

// Public auth routes
router.post(
  "/register",
  validate([
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role")
      .optional()
      .isIn(["customer", "restaurant_owner", "delivery_partner", "admin"])
      .withMessage("Invalid role"),
  ]),
  authController.register
);

router.post(
  "/login",
  validate([
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ]),
  authController.login
);

router.post(
  "/forgot-password",
  validate([body("email").isEmail().withMessage("Valid email is required")]),
  authController.forgotPassword
);

router.post(
  "/reset-password",
  validate([
    body("token").notEmpty().withMessage("Token is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ]),
  authController.resetPassword
);

// Protected routes
router.get("/me", protect, authController.me);

router.post(
  "/change-password",
  protect,
  validate([
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
  ]),
  authController.changePassword
);

module.exports = router;
