const sequelize = require("../config/database");
const { Review, Food, Restaurant, Order, OrderItem, User } = require("../models");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const sendSuccess = require("../utils/sendSuccess");

/**
 * Helper — recompute average rating on a food or restaurant.
 */
const recalcRating = async (Model, id) => {
  const result = await Review.findAll({
    where: { [Model.name === "Food" ? "foodId" : "restaurantId"]: id },
    attributes: [
      [sequelize.fn("AVG", sequelize.col("rating")), "avg"],
      [sequelize.fn("COUNT", sequelize.col("id")), "count"],
    ],
    raw: true,
  });
  const { avg, count } = result[0];
  await Model.update(
    { rating: Number(avg || 0).toFixed(2), totalRatings: Number(count || 0) },
    { where: { id } }
  );
};

/**
 * GET /api/reviews/restaurant/:id — reviews for a restaurant.
 */
exports.restaurantReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.findAll({
    where: { restaurantId: req.params.id },
    include: [{ model: User, as: "user", attributes: ["id", "name", "profileImage"] }],
    order: [["createdAt", "DESC"]],
  });
  sendSuccess(res, reviews);
});

/**
 * GET /api/reviews/food/:id — reviews for a food item.
 */
exports.foodReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.findAll({
    where: { foodId: req.params.id },
    include: [{ model: User, as: "user", attributes: ["id", "name", "profileImage"] }],
    order: [["createdAt", "DESC"]],
  });
  sendSuccess(res, reviews);
});

/**
 * POST /api/reviews — create a review.
 * A user can only review food they've ordered and received.
 * Either foodId or restaurantId (or both) must be supplied.
 */
exports.addReview = catchAsync(async (req, res, next) => {
  const { foodId, restaurantId, rating, comment, orderId } = req.body;

  if (!foodId && !restaurantId) {
    return next(new AppError("Provide foodId or restaurantId to review", 400));
  }
  if (!rating || rating < 1 || rating > 5) {
    return next(new AppError("Rating must be between 1 and 5", 400));
  }

  // Verify the user actually ordered this item (if a food review).
  if (foodId) {
    const delivered = await Order.findOne({
      where: { userId: req.user.id, orderStatus: "delivered" },
      include: [{ model: OrderItem, as: "items", where: { foodId } }],
    });
    if (!delivered) {
      return next(new AppError("You can only review food you've ordered and received", 400));
    }
  }

  const existing = await Review.findOne({
    where: {
      userId: req.user.id,
      ...(foodId ? { foodId } : {}),
      ...(restaurantId ? { restaurantId } : {}),
    },
  });

  let review;
  if (existing) {
    existing.rating = rating;
    existing.comment = comment || existing.comment;
    await existing.save();
    review = existing;
  } else {
    review = await Review.create({ userId: req.user.id, foodId, restaurantId, orderId, rating, comment });
  }

  // Recalculate averages.
  if (foodId) await recalcRating(Food, foodId);
  if (restaurantId) await recalcRating(Restaurant, restaurantId);

  sendSuccess(res, review, existing ? "Review updated" : "Review submitted", 201);
});

/**
 * DELETE /api/reviews/:id — user deletes their own review.
 */
exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findOne({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!review) return next(new AppError("Review not found", 404));

  const { foodId, restaurantId } = review;
  await review.destroy();

  if (foodId) await recalcRating(Food, foodId);
  if (restaurantId) await recalcRating(Restaurant, restaurantId);

  sendSuccess(res, null, "Review deleted");
});
