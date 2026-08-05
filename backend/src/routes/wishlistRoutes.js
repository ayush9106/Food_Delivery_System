const router = require("express").Router();
const wishlistController = require("../controllers/wishlistController");
const { protect, restrictTo } = require("../middleware/auth");
const { Role } = require("../models");

router.use(protect, restrictTo(Role.CUSTOMER));

router.get("/", wishlistController.getWishlist);
router.post("/", wishlistController.addToWishlist);
router.delete("/:foodId", wishlistController.removeFromWishlist);

module.exports = router;
