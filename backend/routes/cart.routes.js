const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");

const {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart
} = require("../controllers/cart.controller");

// All cart routes are protected (user must be logged in)
router.post("/:productId", authMiddleware, addToCart);
router.get("/", authMiddleware, getCart);
router.patch("/:productId", authMiddleware, updateCartItem);
router.delete("/:productId", authMiddleware, removeFromCart);

module.exports = router;
