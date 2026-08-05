const router = require("express").Router();

router.use("/auth", require("./authRoutes"));
router.use("/users", require("./userRoutes"));
router.use("/restaurants", require("./restaurantRoutes"));
router.use("/foods", require("./foodRoutes"));
router.use("/categories", require("./categoryRoutes"));
router.use("/cart", require("./cartRoutes"));
router.use("/orders", require("./orderRoutes"));
router.use("/payments", require("./paymentRoutes"));
router.use("/reviews", require("./reviewRoutes"));
router.use("/coupons", require("./couponRoutes"));
router.use("/offers", require("./offerRoutes"));
router.use("/wishlist", require("./wishlistRoutes"));
router.use("/delivery", require("./deliveryRoutes"));
router.use("/admin", require("./adminRoutes"));
router.use("/analytics", require("./analyticsRoutes"));
router.use("/notifications", require("./notificationRoutes"));

module.exports = router;
