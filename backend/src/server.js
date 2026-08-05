require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const config = require("./config/env");
const { sequelize } = require("./models");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const app = express();

// Enable trust proxy so rate limiting works behind proxies
app.set("trust proxy", 1);

/* ------------------------------------------------------------------ *
 *  Global middleware
 * ------------------------------------------------------------------ */

// CORS — allow the Vite dev server
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// Static files (local uploads fallback)
app.use("/uploads", express.static(path.join(__dirname, "..", "public", "uploads")));

// Health check
app.get("/", (req, res) =>
  res.json({ success: true, message: "Food Delivery API is running 🍔" })
);
app.get("/api/health", (req, res) =>
  res.json({ success: true, status: "ok", uptime: process.uptime() })
);

// API rate limiting — 300 requests / 15 min per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});
app.use("/api", apiLimiter);

// Auth limiter — stricter on login/register
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many auth attempts, please try again later." },
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

/* ------------------------------------------------------------------ *
 *  Routes
 * ------------------------------------------------------------------ */

app.use("/api", require("./routes"));

// 404 + central error handler
app.use(notFound);
app.use(errorHandler);

/* ------------------------------------------------------------------ *
 *  Start
 * ------------------------------------------------------------------ */

const start = async () => {
  try {
    // Import models so associations register, then authenticate.
    require("./models");
    await sequelize.authenticate();
    console.log("✅ Database connection established.");

    // Auto sync tables (non-destructive) on first boot in development.
    if (config.env === "development") {
      await sequelize.sync({ alter: false });
      console.log("✅ Tables are up to date.");
    }

    app.listen(config.port, () => {
      console.log(`🚀 API running on http://localhost:${config.port}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
};

start();

module.exports = app;
