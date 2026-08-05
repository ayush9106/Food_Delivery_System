const { Wishlist, Food, Restaurant } = require("../models");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const sendSuccess = require("../utils/sendSuccess");

/**
 * GET /api/wishlist
 */
exports.getWishlist = catchAsync(async (req, res, next) => {
  const items = await Wishlist.findAll({
    where: { userId: req.user.id },
    include: [
      {
        model: Food,
        as: "food",
        include: [{ model: Restaurant, as: "restaurant", attributes: ["id", "name", "image", "city"] }],
      },
    ],
    order: [["id", "DESC"]],
  });
  sendSuccess(res, items);
});

/**
 * POST /api/wishlist — add food to wishlist.
 */
exports.addToWishlist = catchAsync(async (req, res, next) => {
  const { foodId } = req.body;
  const food = await Food.findByPk(foodId);
  if (!food) return next(new AppError("Food item not found", 404));

  const existing = await Wishlist.findOne({ where: { userId: req.user.id, foodId } });
  if (existing) return sendSuccess(res, existing, "Already in wishlist");

  const item = await Wishlist.create({ userId: req.user.id, foodId });
  sendSuccess(res, item, "Added to wishlist", 201);
});

/**
 * DELETE /api/wishlist/:foodId — remove from wishlist.
 */
exports.removeFromWishlist = catchAsync(async (req, res, next) => {
  const deleted = await Wishlist.destroy({
    where: { userId: req.user.id, foodId: req.params.foodId },
  });
  if (!deleted) return next(new AppError("Wishlist item not found", 404));
  sendSuccess(res, null, "Removed from wishlist");
});
