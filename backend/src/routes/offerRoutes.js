const router = require("express").Router();
const { body } = require("express-validator");
const offerController = require("../controllers/offerController");
const { protect, restrictTo } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { uploadMiddleware } = require("../middleware/upload");
const { Role } = require("../models");

// Public
router.get("/", offerController.listActiveOffers);

// Admin CRUD
router.get("/admin/all", protect, restrictTo(Role.ADMIN), offerController.listAllOffers);
router.post(
  "/admin",
  protect,
  restrictTo(Role.ADMIN),
  uploadMiddleware.single("image"),
  validate([
    body("title").trim().notEmpty().withMessage("Offer title is required"),
    body("validFrom").notEmpty().withMessage("Valid from date is required"),
    body("validTo").notEmpty().withMessage("Valid to date is required"),
  ]),
  offerController.createOffer
);
router.put(
  "/admin/:id",
  protect,
  restrictTo(Role.ADMIN),
  uploadMiddleware.single("image"),
  offerController.updateOffer
);
router.delete("/admin/:id", protect, restrictTo(Role.ADMIN), offerController.deleteOffer);

module.exports = router;
