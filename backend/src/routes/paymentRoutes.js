const router = require("express").Router();
const paymentController = require("../controllers/paymentController");
const { protect, restrictTo } = require("../middleware/auth");
const { Role } = require("../models");

router.use(protect, restrictTo(Role.CUSTOMER));

router.post("/initiate", paymentController.initiatePayment);
router.post("/confirm", paymentController.confirmPayment);
router.get("/history", paymentController.paymentHistory);

module.exports = router;
