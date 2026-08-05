const { FoodCategory, Restaurant } = require("../models");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const sendSuccess = require("../utils/sendSuccess");
const { getUploadedUrl } = require("../middleware/upload");

/**
 * GET /api/categories — global categories (restaurantId null).
 */
exports.listGlobalCategories = catchAsync(async (req, res, next) => {
  const categories = await FoodCategory.findAll({
    where: { restaurantId: null, isActive: true },
    order: [["name", "ASC"]],
  });
  sendSuccess(res, categories);
});

/**
 * GET /api/categories/restaurant/:restaurantId — restaurant categories.
 */
exports.listRestaurantCategories = catchAsync(async (req, res, next) => {
  const categories = await FoodCategory.findAll({
    where: { restaurantId: req.params.restaurantId },
    order: [["name", "ASC"]],
  });
  sendSuccess(res, categories);
});

/**
 * POST /api/categories — create (owner for own restaurant, or global by admin).
 */
exports.createCategory = catchAsync(async (req, res, next) => {
  const { name, restaurantId, isGlobal } = req.body;

  if (isGlobal) {
    // Only admins may create global categories.
    if (req.user.roleName !== "admin") {
      return next(new AppError("Only admins can create global categories", 403));
    }
  } else {
    const restaurant = await Restaurant.findOne({
      where: { id: restaurantId, ownerId: req.user.id },
    });
    if (!restaurant) return next(new AppError("Restaurant not found or not yours", 404));
  }

  const category = await FoodCategory.create({
    name,
    restaurantId: isGlobal ? null : restaurantId || null,
    image: getUploadedUrl(req.file),
  });
  sendSuccess(res, category, "Category created", 201);
});

/**
 * PUT /api/categories/:id
 */
exports.updateCategory = catchAsync(async (req, res, next) => {
  const category = await FoodCategory.findByPk(req.params.id);
  if (!category) return next(new AppError("Category not found", 404));

  // Owners may only edit categories of their own restaurants.
  if (category.restaurantId) {
    const restaurant = await Restaurant.findOne({
      where: { id: category.restaurantId, ownerId: req.user.id },
    });
    if (!restaurant && req.user.roleName !== "admin") {
      return next(new AppError("Not allowed to edit this category", 403));
    }
  } else if (req.user.roleName !== "admin") {
    return next(new AppError("Not allowed to edit this category", 403));
  }

  if (req.body.name) category.name = req.body.name;
  if (req.body.isActive !== undefined) category.isActive = req.body.isActive === "true" || req.body.isActive === true;
  const image = getUploadedUrl(req.file);
  if (image) category.image = image;

  await category.save();
  sendSuccess(res, category, "Category updated");
});

/**
 * DELETE /api/categories/:id
 */
exports.deleteCategory = catchAsync(async (req, res, next) => {
  const category = await FoodCategory.findByPk(req.params.id);
  if (!category) return next(new AppError("Category not found", 404));

  if (category.restaurantId) {
    const restaurant = await Restaurant.findOne({
      where: { id: category.restaurantId, ownerId: req.user.id },
    });
    if (!restaurant && req.user.roleName !== "admin") {
      return next(new AppError("Not allowed to delete this category", 403));
    }
  } else if (req.user.roleName !== "admin") {
    return next(new AppError("Not allowed to delete this category", 403));
  }

  await category.destroy();
  sendSuccess(res, null, "Category deleted");
});
