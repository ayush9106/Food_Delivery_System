const sequelize = require("../config/database");

const Role = require("./Role");
const User = require("./User");
const Restaurant = require("./Restaurant");
const FoodCategory = require("./FoodCategory");
const Food = require("./Food");
const Order = require("./Order");
const OrderItem = require("./OrderItem");
const Payment = require("./Payment");
const Address = require("./Address");
const Wishlist = require("./Wishlist");
const Review = require("./Review");
const CartItem = require("./CartItem");
const Coupon = require("./Coupon");
const Offer = require("./Offer");
const DeliveryPartner = require("./DeliveryPartner");
const Notification = require("./Notification");
const ResetToken = require("./ResetToken");

/**
 * Associations -------------------------------------------------------------
 * Defines every relationship used across controllers.
 */

// Role <-> User (1:N)
Role.hasMany(User, { foreignKey: "roleId", as: "users" });
User.belongsTo(Role, { foreignKey: "roleId", as: "role" });

// User <-> Restaurant (1:N owner)
User.hasMany(Restaurant, { foreignKey: "ownerId", as: "restaurants" });
Restaurant.belongsTo(User, { foreignKey: "ownerId", as: "owner" });

// User <-> DeliveryPartner (1:1)
User.hasOne(DeliveryPartner, { foreignKey: "userId", as: "deliveryProfile" });
DeliveryPartner.belongsTo(User, { foreignKey: "userId", as: "user" });

// User <-> Address (1:N)
User.hasMany(Address, { foreignKey: "userId", as: "addresses" });
Address.belongsTo(User, { foreignKey: "userId", as: "user" });

// Restaurant <-> FoodCategory (1:N)
Restaurant.hasMany(FoodCategory, { foreignKey: "restaurantId", as: "categories" });
FoodCategory.belongsTo(Restaurant, { foreignKey: "restaurantId", as: "restaurant" });

// Restaurant <-> Food (1:N)
Restaurant.hasMany(Food, { foreignKey: "restaurantId", as: "foods" });
Food.belongsTo(Restaurant, { foreignKey: "restaurantId", as: "restaurant" });

// FoodCategory <-> Food (1:N)
FoodCategory.hasMany(Food, { foreignKey: "categoryId", as: "foods" });
Food.belongsTo(FoodCategory, { foreignKey: "categoryId", as: "category" });

// User <-> Order (1:N)
User.hasMany(Order, { foreignKey: "userId", as: "orders" });
Order.belongsTo(User, { foreignKey: "userId", as: "user" });

// Restaurant <-> Order (1:N)
Restaurant.hasMany(Order, { foreignKey: "restaurantId", as: "orders" });
Order.belongsTo(Restaurant, { foreignKey: "restaurantId", as: "restaurant" });

// Address <-> Order (1:N)
Address.hasMany(Order, { foreignKey: "addressId", as: "orders" });
Order.belongsTo(Address, { foreignKey: "addressId", as: "address" });

// Coupon <-> Order (1:N)
Coupon.hasMany(Order, { foreignKey: "couponId", as: "orders" });
Order.belongsTo(Coupon, { foreignKey: "couponId", as: "coupon" });

// Order <-> OrderItem (1:N)
Order.hasMany(OrderItem, { foreignKey: "orderId", as: "items", onDelete: "CASCADE" });
OrderItem.belongsTo(Order, { foreignKey: "orderId", as: "order" });

// Order <-> Payment (1:1)
Order.hasOne(Payment, { foreignKey: "orderId", as: "payment" });
Payment.belongsTo(Order, { foreignKey: "orderId", as: "order" });

// User <-> Wishlist (1:N)
User.hasMany(Wishlist, { foreignKey: "userId", as: "wishlist", onDelete: "CASCADE" });
Wishlist.belongsTo(User, { foreignKey: "userId", as: "user" });

// Food <-> Wishlist (1:N)
Food.hasMany(Wishlist, { foreignKey: "foodId", as: "wishlistEntries", onDelete: "CASCADE" });
Wishlist.belongsTo(Food, { foreignKey: "foodId", as: "food" });

// User <-> CartItem (1:N)
User.hasMany(CartItem, { foreignKey: "userId", as: "cartItems", onDelete: "CASCADE" });
CartItem.belongsTo(User, { foreignKey: "userId", as: "user" });

// Food <-> CartItem (1:N)
Food.hasMany(CartItem, { foreignKey: "foodId", as: "cartEntries", onDelete: "CASCADE" });
CartItem.belongsTo(Food, { foreignKey: "foodId", as: "food" });

// User <-> Review (1:N)
User.hasMany(Review, { foreignKey: "userId", as: "reviews" });
Review.belongsTo(User, { foreignKey: "userId", as: "user" });

// Restaurant <-> Review (1:N)
Restaurant.hasMany(Review, { foreignKey: "restaurantId", as: "reviews" });
Review.belongsTo(Restaurant, { foreignKey: "restaurantId", as: "restaurant" });

// Food <-> Review (1:N)
Food.hasMany(Review, { foreignKey: "foodId", as: "reviews" });
Review.belongsTo(Food, { foreignKey: "foodId", as: "food" });

// Order <-> Review (1:N)
Order.hasMany(Review, { foreignKey: "orderId", as: "reviews" });
Review.belongsTo(Order, { foreignKey: "orderId", as: "order" });

// DeliveryPartner <-> Order (1:N)
DeliveryPartner.hasMany(Order, { foreignKey: "deliveryPartnerId", as: "orders" });
Order.belongsTo(DeliveryPartner, { foreignKey: "deliveryPartnerId", as: "deliveryPartner" });

// User <-> Notification (1:N)
User.hasMany(Notification, { foreignKey: "userId", as: "notifications", onDelete: "CASCADE" });
Notification.belongsTo(User, { foreignKey: "userId", as: "user" });

// User <-> ResetToken (1:N)
User.hasMany(ResetToken, { foreignKey: "userId", as: "resetTokens", onDelete: "CASCADE" });
ResetToken.belongsTo(User, { foreignKey: "userId", as: "user" });

module.exports = {
  sequelize,
  Role,
  User,
  Restaurant,
  FoodCategory,
  Food,
  Order,
  OrderItem,
  Payment,
  Address,
  Wishlist,
  Review,
  CartItem,
  Coupon,
  Offer,
  DeliveryPartner,
  Notification,
  ResetToken,
};
