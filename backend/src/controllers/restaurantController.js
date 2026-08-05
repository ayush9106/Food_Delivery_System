const { Restaurant, User, Food, FoodCategory } = require("../models");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const sendSuccess = require("../utils/sendSuccess");
const ApiFeatures = require("../utils/ApiFeatures");
const { getUploadedUrl } = require("../middleware/upload");

const APPROVED = "approved";

/* ------------------------------------------------------------------ *
 *  Public endpoints (customers)
 * ------------------------------------------------------------------ */

/**
 * GET /api/restaurants — list approved restaurants.
 * Supports: search, cuisine, city, sort, page, limit
 */
exports.listRestaurants = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(Restaurant, req.query)
    .filter(["city", "cuisine", "status"])
    .search(["name", "cuisine", "city"])
    .sort("rating", "DESC")
    .paginate(1, 12);

  features.where.status = APPROVED;
  features.where.isActive = true;

  const data = await features.execute();
  sendSuccess(res, data);
});

/**
 * GET /api/restaurants/:id — public restaurant details with foods.
 */
exports.getRestaurant = catchAsync(async (req, res, next) => {
  const restaurant = await Restaurant.findOne({
    where: { id: req.params.id, status: APPROVED, isActive: true },
    include: [{ model: User, as: "owner", attributes: ["id", "name"] }],
  });
  if (!restaurant) return next(new AppError("Restaurant not found", 404));

  const foods = await Food.findAll({
    where: { restaurantId: restaurant.id, isAvailable: true },
    include: [{ model: FoodCategory, as: "category", attributes: ["id", "name"] }],
  });

  sendSuccess(res, { ...restaurant.toJSON(), foods });
});

/**
 * GET /api/restaurants/:id/menu — grouped menu by category.
 */
exports.getMenu = catchAsync(async (req, res, next) => {
  const restaurant = await Restaurant.findByPk(req.params.id);
  if (!restaurant) return next(new AppError("Restaurant not found", 404));

  const categories = await FoodCategory.findAll({
    where: { restaurantId: restaurant.id },
    include: [{ model: Food, as: "foods", where: { isAvailable: true }, required: false }],
  });

  sendSuccess(res, categories);
});

/* ------------------------------------------------------------------ *
 *  Owner endpoints
 * ------------------------------------------------------------------ */

/**
 * GET /api/restaurants/owner/mine — the logged-in owner's restaurants.
 */
exports.myRestaurants = catchAsync(async (req, res, next) => {
  const restaurants = await Restaurant.findAll({
    where: { ownerId: req.user.id },
    order: [["id", "DESC"]],
  });
  sendSuccess(res, restaurants);
});

/**
 * POST /api/restaurants/owner — create a restaurant.
 */
exports.createRestaurant = catchAsync(async (req, res, next) => {
  const { name, description, cuisine, address, city, state, pincode, phone } = req.body;

  const restaurant = await Restaurant.create({
    ownerId: req.user.id,
    name,
    description,
    cuisine,
    address,
    city,
    state,
    pincode,
    phone,
    image: getUploadedUrl(req.files && req.files.image && req.files.image[0]),
    coverImage: getUploadedUrl(req.files && req.files.coverImage && req.files.coverImage[0]),
    status: "pending",
  });
  sendSuccess(res, restaurant, "Restaurant created. Awaiting admin approval.", 201);
});

/**
 * PUT /api/restaurants/owner/:id — update own restaurant.
 */
exports.updateRestaurant = catchAsync(async (req, res, next) => {
  const restaurant = await Restaurant.findOne({
    where: { id: req.params.id, ownerId: req.user.id },
  });
  if (!restaurant) return next(new AppError("Restaurant not found", 404));

  const fields = [
    "name", "description", "cuisine", "address", "city", "state",
    "pincode", "phone", "deliveryFee", "deliveryTime", "minOrderAmount", "isActive",
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) restaurant[f] = req.body[f];
  });

  const image = getUploadedUrl(req.files && req.files.image && req.files.image[0]);
  const coverImage = getUploadedUrl(req.files && req.files.coverImage && req.files.coverImage[0]);
  if (image) restaurant.image = image;
  if (coverImage) restaurant.coverImage = coverImage;

  await restaurant.save();
  sendSuccess(res, restaurant, "Restaurant updated");
});

/**
 * DELETE /api/restaurants/owner/:id — delete own restaurant.
 */
exports.deleteRestaurant = catchAsync(async (req, res, next) => {
  const deleted = await Restaurant.destroy({
    where: { id: req.params.id, ownerId: req.user.id },
  });
  if (!deleted) return next(new AppError("Restaurant not found", 404));
  sendSuccess(res, null, "Restaurant deleted");
});
