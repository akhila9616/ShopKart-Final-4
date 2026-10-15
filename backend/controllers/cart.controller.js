const mongoose = require("mongoose");
const Product = require("../models/product.model");
const Customer = require("../models/customer.model");

// POST /cart/:productId  ->  add product to cart (or increase quantity if already there)
async function addToCart(req, res) {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const user = req.user;

    // Check if this product is already in the cart
    const cartItem = user.cart.find((item) => item.product.toString() === productId);

    if (cartItem) {
      // Already in cart -> increase quantity by 1
      const newQty = cartItem.quantity + 1;
      if (newQty > product.stock) {
        return res.status(400).json({ success: false, message: "Not enough stock available" });
      }
      cartItem.quantity = newQty;
    } else {
      // Not in cart -> add with quantity 1
      if (product.stock < 1) {
        return res.status(400).json({ success: false, message: "Product is out of stock" });
      }
      user.cart.push({ product: productId, quantity: 1 });
    }

    await user.save();

    res.status(200).json({ success: true, message: "Cart updated", cart: user.cart });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// GET /cart  ->  get current user's cart with populated product data
async function getCart(req, res) {
  try {
    const user = await Customer.findById(req.user._id).populate({
      path: "cart.product",
      select: "name price category image stock"
    });

    res.status(200).json({ success: true, cart: user.cart });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// PATCH /cart/:productId  ->  update quantity of a cart item
async function updateCartItem(req, res) {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (quantity > product.stock) {
      return res.status(400).json({ success: false, message: "Not enough stock available" });
    }

    const user = req.user;
    const cartItem = user.cart.find((item) => item.product.toString() === productId);

    if (!cartItem) {
      return res.status(404).json({ success: false, message: "Product not in cart" });
    }

    cartItem.quantity = quantity;
    await user.save();

    res.status(200).json({ success: true, message: "Quantity updated", cart: user.cart });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// DELETE /cart/:productId  ->  remove product from cart
async function removeFromCart(req, res) {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const user = req.user;
    const index = user.cart.findIndex((item) => item.product.toString() === productId);

    if (index === -1) {
      return res.status(404).json({ success: false, message: "Product not in cart" });
    }

    user.cart.splice(index, 1);
    await user.save();

    res.status(200).json({ success: true, message: "Product removed from cart", cart: user.cart });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = { addToCart, getCart, updateCartItem, removeFromCart };
