const router = require("express").Router();
const { body } = require("express-validator");
const userController = require("../controllers/userController");
const { protect, restrictTo } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { uploadMiddleware } = require("../middleware/upload");
const { Role } = require("../models");

router.use(protect);

// Profile
router.get("/profile", userController.getProfile);
router.patch(
  "/profile",
  validate([
    body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
    body("phone").optional().isLength({ max: 20 }).withMessage("Phone too long"),
  ]),
  userController.updateProfile
);
router.patch("/profile-image", uploadMiddleware.single("image"), userController.uploadProfileImage);

// Delivery partner profile
router.patch(
  "/delivery-profile",
  restrictTo(Role.DELIVERY_PARTNER),
  userController.updateDeliveryProfile
);

// Addresses
router.get("/addresses", userController.getAddresses);
router.post(
  "/addresses",
  validate([
    body("fullAddress").trim().notEmpty().withMessage("Full address is required"),
    body("city").trim().notEmpty().withMessage("City is required"),
    body("pincode").trim().notEmpty().withMessage("Pincode is required"),
  ]),
  userController.addAddress
);
router.put("/addresses/:id", userController.updateAddress);
router.delete("/addresses/:id", userController.deleteAddress);

module.exports = router;
