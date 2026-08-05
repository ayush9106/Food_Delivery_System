const router = require("express").Router();
const { body } = require("express-validator");
const categoryController = require("../controllers/categoryController");
const { protect, restrictTo } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { uploadMiddleware } = require("../middleware/upload");
const { Role } = require("../models");

// ---- Public ----
router.get("/", categoryController.listGlobalCategories);
router.get("/restaurant/:restaurantId", categoryController.listRestaurantCategories);

// ---- Protected (owner/admin) ----
router.post(
  "/",
  protect,
  restrictTo(Role.RESTAURANT_OWNER, Role.ADMIN),
  uploadMiddleware.single("image"),
  validate([body("name").trim().notEmpty().withMessage("Category name is required")]),
  categoryController.createCategory
);

router.put(
  "/:id",
  protect,
  restrictTo(Role.RESTAURANT_OWNER, Role.ADMIN),
  uploadMiddleware.single("image"),
  categoryController.updateCategory
);

router.delete("/:id", protect, restrictTo(Role.RESTAURANT_OWNER, Role.ADMIN), categoryController.deleteCategory);

module.exports = router;
