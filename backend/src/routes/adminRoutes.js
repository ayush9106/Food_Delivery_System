const router = require("express").Router();
const { body } = require("express-validator");
const adminController = require("../controllers/adminController");
const { protect, restrictTo } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { Role } = require("../models");

router.use(protect, restrictTo(Role.ADMIN));

// Dashboard
router.get("/stats", adminController.stats);

// Users
router.get("/users", adminController.listUsers);
router.patch("/users/:id/block", adminController.toggleBlockUser);

// Restaurants
router.get("/restaurants", adminController.listRestaurants);
router.patch(
  "/restaurants/:id/approve",
  validate([body("status").isIn(["approved", "rejected", "pending"]).withMessage("Invalid status")]),
  adminController.approveRestaurant
);

// Orders
router.get("/orders", adminController.listOrders);

// Coupons & Offers
router.get("/coupons", adminController.listCoupons);
router.get("/offers", adminController.listOffers);

// Delivery partners
router.get("/delivery-partners", adminController.listDeliveryPartners);

// Reports
router.get("/reports", adminController.reports);

module.exports = router;
