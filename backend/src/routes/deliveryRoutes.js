const router = require("express").Router();
const deliveryController = require("../controllers/deliveryController");
const { protect, restrictTo } = require("../middleware/auth");
const { Role } = require("../models");

router.use(protect, restrictTo(Role.DELIVERY_PARTNER));

router.get("/dashboard", deliveryController.dashboard);
router.get("/available-orders", deliveryController.availableOrders);
router.post("/:orderId/accept", deliveryController.acceptDelivery);
router.patch("/:orderId/status", deliveryController.markDelivered);
router.patch("/availability", deliveryController.setAvailability);
router.get("/history", deliveryController.deliveryHistory);
router.get("/earnings", deliveryController.earnings);

module.exports = router;
