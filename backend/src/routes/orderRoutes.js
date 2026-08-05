const router = require("express").Router();
const orderController = require("../controllers/orderController");
const { protect, restrictTo } = require("../middleware/auth");
const { Role } = require("../models");

router.use(protect);

// Customer routes
router.post("/", restrictTo(Role.CUSTOMER), orderController.placeOrder);
router.get("/my", restrictTo(Role.CUSTOMER), orderController.myOrders);
router.get("/:id", orderController.getOrder);
router.patch("/:id/cancel", restrictTo(Role.CUSTOMER), orderController.cancelOrder);

// Restaurant owner routes
router.get("/owner/list", restrictTo(Role.RESTAURANT_OWNER), orderController.ownerOrders);
router.patch("/:id/accept", restrictTo(Role.RESTAURANT_OWNER), orderController.acceptOrder);
router.patch("/:id/reject", restrictTo(Role.RESTAURANT_OWNER), orderController.rejectOrder);
router.patch("/:id/preparing", restrictTo(Role.RESTAURANT_OWNER), orderController.startPreparing);

module.exports = router;
