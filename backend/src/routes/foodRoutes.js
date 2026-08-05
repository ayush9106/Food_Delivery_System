const router = require("express").Router();
const { body } = require("express-validator");
const foodController = require("../controllers/foodController");
const { protect, restrictTo } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { uploadMiddleware } = require("../middleware/upload");
const { Role } = require("../models");

// ---- Public ----
router.get("/", foodController.listFoods);
router.get("/:id", foodController.getFood);

// ---- Owner ----
router.post(
  "/owner",
  protect,
  restrictTo(Role.RESTAURANT_OWNER),
  uploadMiddleware.single("image"),
  validate([
    body("restaurantId").notEmpty().withMessage("Restaurant is required"),
    body("name").trim().notEmpty().withMessage("Food name is required"),
    body("price").isFloat({ min: 0 }).withMessage("Valid price is required"),
  ]),
  foodController.createFood
);

router.put(
  "/owner/:id",
  protect,
  restrictTo(Role.RESTAURANT_OWNER),
  uploadMiddleware.single("image"),
  foodController.updateFood
);

router.patch(
  "/owner/:id/availability",
  protect,
  restrictTo(Role.RESTAURANT_OWNER),
  foodController.toggleAvailability
);

router.delete("/owner/:id", protect, restrictTo(Role.RESTAURANT_OWNER), foodController.deleteFood);

module.exports = router;
