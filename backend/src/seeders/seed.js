require("dotenv").config();
const { sequelize, Role, User, Restaurant, FoodCategory, Food, Offer, Coupon, DeliveryPartner } = require("../models");
const bcrypt = require("bcryptjs");

/**
 * Seed script — creates roles, demo users, restaurants, foods,
 * offers and coupons. Run with `npm run seed`.
 */
const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to database.");

    // ---------- Roles ----------
    const roles = await Role.bulkCreate(
      [
        { name: "customer", description: "Places food orders" },
        { name: "restaurant_owner", description: "Owns and manages restaurants" },
        { name: "admin", description: "Platform administrator" },
        { name: "delivery_partner", description: "Delivers orders" },
      ],
      { ignoreDuplicates: true }
    );
    console.log("Roles seeded:", roles.length);

    const [adminRole, customerRole, ownerRole, partnerRole] = await Promise.all([
      Role.findOne({ where: { name: "admin" } }),
      Role.findOne({ where: { name: "customer" } }),
      Role.findOne({ where: { name: "restaurant_owner" } }),
      Role.findOne({ where: { name: "delivery_partner" } }),
    ]);

    const password = await bcrypt.hash("password123", 10);

    // ---------- Users ----------
    const createUser = (name, email, roleId, extra = {}) =>
      User.findOrCreate({
        where: { email },
        defaults: {
          name,
          email,
          password,
          phone: extra.phone || "9876543210",
          roleId,
          isVerified: true,
          profileImage: extra.profileImage || null,
        },
      }).then(([u]) => u);

    const admin = await createUser("Admin User", "admin@foodie.com", adminRole.id, { phone: "9000000001" });
    const customer = await createUser("Demo Customer", "customer@foodie.com", customerRole.id, { phone: "9000000002" });
    const owner = await createUser("Demo Owner", "owner@foodie.com", ownerRole.id, { phone: "9000000003" });
    const partner = await createUser("Demo Partner", "partner@foodie.com", partnerRole.id, { phone: "9000000004" });
    const customer2 = await createUser("Priya Sharma", "priya@foodie.com", customerRole.id, { phone: "9000000005" });
    const owner2 = await createUser("Rahul Verma", "rahul@foodie.com", ownerRole.id, { phone: "9000000006" });

    await DeliveryPartner.findOrCreate({
      where: { userId: partner.id },
      defaults: { vehicleType: "bike", vehicleNumber: "KA-01-AB-1234", availability: "available" },
    });

    console.log("Users seeded.");

    // ---------- Restaurants ----------
    const restaurantData = [
      {
        ownerId: owner.id, name: "Spice Symphony", cuisine: "North Indian",
        address: "MG Road, Bengaluru", city: "Bengaluru", state: "Karnataka",
        pincode: "560001", deliveryFee: 25, deliveryTime: 30, minOrderAmount: 149,
        status: "approved", rating: 4.5, totalRatings: 120,
        image: "https://res.cloudinary.com/demo/image/upload/v1/food-delivery/restaurant-1",
      },
      {
        ownerId: owner2.id, name: "Bella Italia", cuisine: "Italian",
        address: "Banjara Hills, Hyderabad", city: "Hyderabad", state: "Telangana",
        pincode: "500034", deliveryFee: 30, deliveryTime: 40, minOrderAmount: 199,
        status: "approved", rating: 4.3, totalRatings: 85,
        image: "https://res.cloudinary.com/demo/image/upload/v1/food-delivery/restaurant-2",
      },
      {
        ownerId: owner.id, name: "Sushi Haven", cuisine: "Japanese",
        address: "Indiranagar, Bengaluru", city: "Bengaluru", state: "Karnataka",
        pincode: "560038", deliveryFee: 35, deliveryTime: 35, minOrderAmount: 249,
        status: "approved", rating: 4.7, totalRatings: 200,
        image: "https://res.cloudinary.com/demo/image/upload/v1/food-delivery/restaurant-3",
      },
      {
        ownerId: owner2.id, name: "Biryani Junction", cuisine: "Hyderabadi",
        address: "Kukatpally, Hyderabad", city: "Hyderabad", state: "Telangana",
        pincode: "500072", deliveryFee: 20, deliveryTime: 25, minOrderAmount: 129,
        status: "approved", rating: 4.6, totalRatings: 310,
        image: "https://res.cloudinary.com/demo/image/upload/v1/food-delivery/restaurant-4",
      },
      {
        ownerId: owner.id, name: "Green Bowl", cuisine: "Healthy",
        address: "Koramangala, Bengaluru", city: "Bengaluru", state: "Karnataka",
        pincode: "560095", deliveryFee: 22, deliveryTime: 28, minOrderAmount: 159,
        status: "approved", rating: 4.4, totalRatings: 150,
        image: "https://res.cloudinary.com/demo/image/upload/v1/food-delivery/restaurant-5",
      },
    ];

    const restaurants = {};
    for (const r of restaurantData) {
      const [restaurant] = await Restaurant.findOrCreate({
        where: { name: r.name },
        defaults: r,
      });
      restaurants[r.name] = restaurant;
    }
    console.log("Restaurants seeded:", Object.keys(restaurants).length);

    // ---------- Categories ----------
    const globalCategories = ["Biryani", "Pizza", "Burger", "Desserts", "Beverages", "Noodles", "Sushi", "Healthy"];
    const categories = {};
    for (const name of globalCategories) {
      const [cat] = await FoodCategory.findOrCreate({
        where: { name, restaurantId: null },
        defaults: { name, restaurantId: null, isActive: true },
      });
      categories[name] = cat;
    }
    console.log("Categories seeded:", globalCategories.length);

    // ---------- Foods ----------
    const foodsData = [
      { restaurant: "Spice Symphony", category: "Biryani", name: "Chicken Dum Biryani", price: 249, isVeg: false, rating: 4.6 },
      { restaurant: "Spice Symphony", category: "Biryani", name: "Veg Biryani", price: 199, isVeg: true, rating: 4.4 },
      { restaurant: "Spice Symphony", category: "Desserts", name: "Gulab Jamun", price: 99, isVeg: true, rating: 4.3 },
      { restaurant: "Bella Italia", category: "Pizza", name: "Margherita Pizza", price: 299, isVeg: true, rating: 4.5 },
      { restaurant: "Bella Italia", category: "Pizza", name: "Pepperoni Pizza", price: 399, isVeg: false, rating: 4.6 },
      { restaurant: "Bella Italia", category: "Beverages", name: "Italian Lemonade", price: 120, isVeg: true, rating: 4.1 },
      { restaurant: "Sushi Haven", category: "Sushi", name: "Salmon Nigiri (8pc)", price: 450, isVeg: false, rating: 4.8 },
      { restaurant: "Sushi Haven", category: "Sushi", name: "Veg California Roll", price: 320, isVeg: true, rating: 4.4 },
      { restaurant: "Sushi Haven", category: "Beverages", name: "Green Tea", price: 80, isVeg: true, rating: 4.0 },
      { restaurant: "Biryani Junction", category: "Biryani", name: "Hyderabadi Chicken Biryani", price: 279, isVeg: false, rating: 4.7 },
      { restaurant: "Biryani Junction", category: "Biryani", name: "Paneer Biryani", price: 229, isVeg: true, rating: 4.5 },
      { restaurant: "Biryani Junction", category: "Beverages", name: "Falooda", price: 110, isVeg: true, rating: 4.2 },
      { restaurant: "Green Bowl", category: "Healthy", name: "Quinoa Buddha Bowl", price: 269, isVeg: true, rating: 4.5 },
      { restaurant: "Green Bowl", category: "Healthy", name: "Grilled Paneer Salad", price: 229, isVeg: true, rating: 4.4 },
      { restaurant: "Green Bowl", category: "Beverages", name: "Cold Pressed Juice", price: 140, isVeg: true, rating: 4.3 },
      { restaurant: "Spice Symphony", category: "Beverages", name: "Masala Chai", price: 60, isVeg: true, rating: 4.2 },
    ];

    for (const f of foodsData) {
      const restaurant = restaurants[f.restaurant];
      const category = categories[f.category];
      const [food] = await Food.findOrCreate({
        where: { name: f.name, restaurantId: restaurant.id },
        defaults: {
          restaurantId: restaurant.id,
          categoryId: category.id,
          name: f.name,
          description: `${f.name} prepared with the freshest ingredients and authentic recipes.`,
          price: f.price,
          discountPrice: f.isVeg ? Math.round(f.price * 0.9) : null,
          isVeg: f.isVeg,
          isAvailable: true,
          rating: f.rating,
          totalRatings: Math.floor(Math.random() * 300) + 20,
        },
      });
    }
    console.log("Foods seeded:", foodsData.length);

    // ---------- Offers ----------
    const today = new Date();
    const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    await Offer.findOrCreate({
      where: { title: "Flat 20% OFF on your first order" },
      defaults: {
        title: "Flat 20% OFF on your first order",
        description: "Enjoy 20% off up to ₹100 on your very first order with code FIRST20.",
        discountPercent: 20,
        minOrderAmount: 149,
        maxDiscount: 100,
        code: "FIRST20",
        validFrom: today,
        validTo: nextMonth,
        isActive: true,
      },
    });

    await Offer.findOrCreate({
      where: { title: "Biryani lovers, rejoice!" },
      defaults: {
        title: "Biryani lovers, rejoice!",
        description: "Get 15% off on all biryanis. Maximum discount ₹80. Use code BIRYANI15.",
        discountPercent: 15,
        minOrderAmount: 199,
        maxDiscount: 80,
        code: "BIRYANI15",
        validFrom: today,
        validTo: nextMonth,
        isActive: true,
      },
    });

    await Offer.findOrCreate({
      where: { title: "Free delivery on orders above ₹399" },
      defaults: {
        title: "Free delivery on orders above ₹399",
        description: "No delivery charges on orders above ₹399. Automatically applied at checkout.",
        discountPercent: 100,
        minOrderAmount: 399,
        maxDiscount: 40,
        code: "FREEDELIVERY",
        validFrom: today,
        validTo: nextMonth,
        isActive: true,
      },
    });

    // ---------- Coupons ----------
    await Coupon.findOrCreate({
      where: { code: "WELCOME10" },
      defaults: {
        code: "WELCOME10",
        description: "10% off up to ₹75 for new users",
        type: "percent",
        value: 10,
        minOrderAmount: 149,
        maxDiscount: 75,
        validFrom: today,
        validTo: nextMonth,
        usageLimit: 1000,
        isActive: true,
      },
    });

    await Coupon.findOrCreate({
      where: { code: "FLAT50" },
      defaults: {
        code: "FLAT50",
        description: "Flat ₹50 off on orders above ₹249",
        type: "fixed",
        value: 50,
        minOrderAmount: 249,
        maxDiscount: 50,
        validFrom: today,
        validTo: nextMonth,
        usageLimit: 500,
        isActive: true,
      },
    });

    console.log("Offers & coupons seeded.");

    console.log("\n✅ Seed complete!");
    console.log("------------------------------------------------");
    console.log("Admin  login  -> admin@foodie.com   / password123");
    console.log("Customer login -> customer@foodie.com / password123");
    console.log("Owner  login  -> owner@foodie.com   / password123");
    console.log("Partner login -> partner@foodie.com / password123");
    console.log("------------------------------------------------");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

seed();
