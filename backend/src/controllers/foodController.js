const { Food, Restaurant, FoodCategory, Review, User } = require("../models");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const sendSuccess = require("../utils/sendSuccess");
const ApiFeatures = require("../utils/ApiFeatures");
const { getUploadedUrl } = require("../middleware/upload");

/* ------------------------------------------------------------------ *
 *  Public endpoints
 * ------------------------------------------------------------------ */

/**
 * GET /api/foods — searchable/filterable food catalogue.
 * Supports: search, restaurantId, categoryId, isVeg, maxPrice, sort, page
 */
exports.listFoods = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(Food, req.query)
    .filter(["restaurantId", "categoryId", "isVeg"])
    .search(["name", "description"])
    .sort("rating", "DESC")
    .paginate(1, 12);

  features.where.isAvailable = true;
  if (req.query.maxPrice) features.where.price = { [require("sequelize").Op.lte]: req.query.maxPrice };
  if (req.query.isVeg !== undefined) features.where.isVeg = req.query.isVeg === "true";

  const data = await features.execute();
  // Attach restaurant summary + review stats per food.
  const foods = await Food.findAll({
    where: { id: { [require("sequelize").Op.in]: data.results.map((f) => f.id) } },
    include: [
      { model: Restaurant, as: "restaurant", attributes: ["id", "name", "image", "city"] },
      { model: FoodCategory, as: "category", attributes: ["id", "name"] },
    ],
  });
  data.results = foods;

  sendSuccess(res, data);
});

/**
 * GET /api/foods/:id — food details with restaurant + reviews.
 */
exports.getFood = catchAsync(async (req, res, next) => {
  const food = await Food.findOne({
    where: { id: req.params.id },
    include: [
      { model: Restaurant, as: "restaurant", attributes: ["id", "name", "image", "city"] },
      { model: FoodCategory, as: "category", attributes: ["id", "name"] },
    ],
  });
  if (!food) return next(new AppError("Food item not found", 404));

  const reviews = await Review.findAll({
    where: { foodId: food.id },
    include: [{ model: User, as: "user", attributes: ["id", "name", "profileImage"] }],
    order: [["createdAt", "DESC"]],
    limit: 10,
  });

  sendSuccess(res, { ...food.toJSON(), reviews });
});

/* ------------------------------------------------------------------ *
 *  Owner endpoints
 * ------------------------------------------------------------------ */

/**
 * Helper — verify the food belongs to a restaurant owned by the user.
 */
const ownsFood = async (foodId, userId) => {
  const food = await Food.findByPk(foodId, {
    include: [{ model: Restaurant, as: "restaurant" }],
  });
  if (!food || !food.restaurant || food.restaurant.ownerId !== userId) return null;
  return food;
};

/**
 * POST /api/foods/owner — add food to a restaurant the owner manages.
 */
exports.createFood = catchAsync(async (req, res, next) => {
  const restaurant = await Restaurant.findOne({
    where: { id: req.body.restaurantId, ownerId: req.user.id },
  });
  if (!restaurant) return next(new AppError("Restaurant not found or not yours", 404));

  const { name, description, price, discountPrice, categoryId, isVeg, isAvailable } = req.body;

  const food = await Food.create({
    restaurantId: restaurant.id,
    categoryId: categoryId || null,
    name,
    description,
    price,
    discountPrice: discountPrice || null,
    image: getUploadedUrl(req.file),
    isVeg: isVeg === undefined ? true : isVeg === "true" || isVeg === true,
    isAvailable: isAvailable === undefined ? true : isAvailable === "true" || isAvailable === true,
  });
  sendSuccess(res, food, "Food item added", 201);
});

/**
 * PUT /api/foods/owner/:id — update food.
 */
exports.updateFood = catchAsync(async (req, res, next) => {
  const food = await ownsFood(req.params.id, req.user.id);
  if (!food) return next(new AppError("Food not found or not yours", 404));

  const fields = [
    "name", "description", "price", "discountPrice", "categoryId",
    "isVeg", "isAvailable",
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) {
      if (f === "isVeg" || f === "isAvailable") {
        food[f] = req.body[f] === "true" || req.body[f] === true;
      } else {
        food[f] = req.body[f];
      }
    }
  });

  const image = getUploadedUrl(req.file);
  if (image) food.image = image;

  await food.save();
  sendSuccess(res, food, "Food item updated");
});

/**
 * DELETE /api/foods/owner/:id
 */
exports.deleteFood = catchAsync(async (req, res, next) => {
  const food = await ownsFood(req.params.id, req.user.id);
  if (!food) return next(new AppError("Food not found or not yours", 404));
  await food.destroy();
  sendSuccess(res, null, "Food item deleted");
});

/**
 * PATCH /api/foods/owner/:id/availability
 */
exports.toggleAvailability = catchAsync(async (req, res, next) => {
  const food = await ownsFood(req.params.id, req.user.id);
  if (!food) return next(new AppError("Food not found or not yours", 404));
  food.isAvailable = req.body.isAvailable === undefined ? !food.isAvailable : req.body.isAvailable === "true" || req.body.isAvailable === true;
  await food.save();
  sendSuccess(res, food, "Availability updated");
});
