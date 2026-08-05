const { CartItem, Food, Restaurant } = require("../models");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const sendSuccess = require("../utils/sendSuccess");

/**
 * Build a cart payload with computed totals.
 */
const buildCart = async (userId) => {
  const items = await CartItem.findAll({
    where: { userId },
    include: [
      {
        model: Food,
        as: "food",
        include: [{ model: Restaurant, as: "restaurant", attributes: ["id", "name", "deliveryFee", "deliveryTime"] }],
      },
    ],
    order: [["id", "DESC"]],
  });

  // Group by restaurant so checkout can split items per restaurant.
  const groups = {};
  let itemsTotal = 0;

  items.forEach(({ id, quantity, food }) => {
    const price = food && food.discountPrice ? Number(food.discountPrice) : food ? Number(food.price) : 0;
    const lineTotal = price * quantity;
    itemsTotal += lineTotal;

    const restId = food ? food.restaurantId : "unknown";
    if (!groups[restId]) {
      groups[restId] = {
        restaurant: food ? food.restaurant : null,
        items: [],
      };
    }
    groups[restId].items.push({ id, quantity, price, lineTotal, food });
  });

  return {
    items,
    grouped: Object.values(groups),
    itemsTotal,
    deliveryFee: 0, // computed at checkout based on the restaurant
    discount: 0,
    tax: 0,
    grandTotal: itemsTotal,
    count: items.reduce((acc, i) => acc + i.quantity, 0),
  };
};

/**
 * GET /api/cart
 */
exports.getCart = catchAsync(async (req, res, next) => {
  const cart = await buildCart(req.user.id);
  sendSuccess(res, cart);
});

/**
 * POST /api/cart — add an item (or increase quantity).
 */
exports.addToCart = catchAsync(async (req, res, next) => {
  const { foodId, quantity = 1 } = req.body;
  const food = await Food.findByPk(foodId);
  if (!food || !food.isAvailable) return next(new AppError("Food item unavailable", 400));

  const existing = await CartItem.findOne({ where: { userId: req.user.id, foodId } });
  if (existing) {
    existing.quantity = Math.min(existing.quantity + quantity, 20);
    await existing.save();
  } else {
    await CartItem.create({ userId: req.user.id, foodId, quantity });
  }

  const cart = await buildCart(req.user.id);
  sendSuccess(res, cart, "Added to cart");
});

/**
 * PUT /api/cart/:id — update quantity of a cart line.
 */
exports.updateQuantity = catchAsync(async (req, res, next) => {
  const { quantity } = req.body;
  if (!quantity || quantity < 1) {
    return next(new AppError("Quantity must be at least 1", 400));
  }

  const item = await CartItem.findOne({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!item) return next(new AppError("Cart item not found", 404));

  item.quantity = Math.min(quantity, 20);
  await item.save();

  const cart = await buildCart(req.user.id);
  sendSuccess(res, cart, "Cart updated");
});

/**
 * DELETE /api/cart/:id
 */
exports.removeFromCart = catchAsync(async (req, res, next) => {
  const deleted = await CartItem.destroy({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!deleted) return next(new AppError("Cart item not found", 404));

  const cart = await buildCart(req.user.id);
  sendSuccess(res, cart, "Removed from cart");
});

/**
 * DELETE /api/cart — clear entire cart.
 */
exports.clearCart = catchAsync(async (req, res, next) => {
  await CartItem.destroy({ where: { userId: req.user.id } });
  const cart = await buildCart(req.user.id);
  sendSuccess(res, cart, "Cart cleared");
});
