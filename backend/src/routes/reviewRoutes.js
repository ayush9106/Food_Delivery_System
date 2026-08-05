const router = require("express").Router();
const { body } = require("express-validator");
const reviewController = require("../controllers/reviewController");
const { protect, restrictTo } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { Role } = require("../models");

// Public review listing
router.get("/restaurant/:id", reviewController.restaurantReviews);
router.get("/food/:id", reviewController.foodReviews);

// Authenticated review creation
router.post(
  "/",
  protect,
  restrictTo(Role.CUSTOMER),
  validate([
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
    body("comment").optional().trim().isLength({ max: 1000 }).withMessage("Comment too long"),
  ]),
  reviewController.addReview
);

router.delete("/:id", protect, restrictTo(Role.CUSTOMER), reviewController.deleteReview);

module.exports = router;
