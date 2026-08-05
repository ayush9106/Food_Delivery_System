const router = require("express").Router();
const cartController = require("../controllers/cartController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/", cartController.getCart);
router.post("/", cartController.addToCart);
router.put("/:id", cartController.updateQuantity);
router.delete("/:id", cartController.removeFromCart);
router.delete("/", cartController.clearCart);

module.exports = router;
