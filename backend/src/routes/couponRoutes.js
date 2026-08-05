const router = require("express").Router();
const { body } = require("express-validator");
const couponController = require("../controllers/couponController");
const { protect, restrictTo } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { Role } = require("../models");

// Validate coupon (customer)
router.post(
  "/validate",
  protect,
  restrictTo(Role.CUSTOMER),
  validate([body("code").trim().notEmpty().withMessage("Coupon code is required")]),
  couponController.validateCoupon
);

// Admin CRUD
router.get("/", protect, restrictTo(Role.ADMIN), couponController.listCoupons);
router.post(
  "/",
  protect,
  restrictTo(Role.ADMIN),
  validate([
    body("code").trim().notEmpty().withMessage("Coupon code is required"),
    body("type").isIn(["percent", "fixed"]).withMessage("Invalid coupon type"),
    body("value").isFloat({ min: 0 }).withMessage("Valid value is required"),
    body("validFrom").notEmpty().withMessage("Valid from date is required"),
    body("validTo").notEmpty().withMessage("Valid to date is required"),
  ]),
  couponController.createCoupon
);
router.put("/:id", protect, restrictTo(Role.ADMIN), couponController.updateCoupon);
router.delete("/:id", protect, restrictTo(Role.ADMIN), couponController.deleteCoupon);

module.exports = router;
