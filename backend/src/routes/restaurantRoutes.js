const router = require("express").Router();
const { body } = require("express-validator");
const restaurantController = require("../controllers/restaurantController");
const { protect, restrictTo } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { uploadMiddleware } = require("../middleware/upload");
const { Role } = require("../models");

// ---- Public ----
router.get("/", restaurantController.listRestaurants);
router.get("/:id", restaurantController.getRestaurant);
router.get("/:id/menu", restaurantController.getMenu);

// ---- Owner ----
router.get("/owner/mine", protect, restrictTo(Role.RESTAURANT_OWNER), restaurantController.myRestaurants);

router.post(
  "/owner",
  protect,
  restrictTo(Role.RESTAURANT_OWNER),
  uploadMiddleware.fields([
    { name: "image", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  validate([
    body("name").trim().notEmpty().withMessage("Restaurant name is required"),
    body("cuisine").optional().trim().notEmpty().withMessage("Cuisine cannot be empty"),
  ]),
  restaurantController.createRestaurant
);

router.put(
  "/owner/:id",
  protect,
  restrictTo(Role.RESTAURANT_OWNER),
  uploadMiddleware.fields([
    { name: "image", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  restaurantController.updateRestaurant
);

router.delete("/owner/:id", protect, restrictTo(Role.RESTAURANT_OWNER), restaurantController.deleteRestaurant);

module.exports = router;
