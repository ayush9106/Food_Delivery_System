const router = require("express").Router();
const analyticsController = require("../controllers/analyticsController");
const { protect, restrictTo } = require("../middleware/auth");
const { Role } = require("../models");

router.get("/admin", protect, restrictTo(Role.ADMIN), analyticsController.adminAnalytics);
router.get("/owner", protect, restrictTo(Role.RESTAURANT_OWNER), analyticsController.ownerAnalytics);

module.exports = router;
