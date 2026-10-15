const mongoose = require("mongoose");
const Product = require("../models/product.model");
const Customer = require("../models/customer.model");

// POST /wishlist/:productId  ->  add product to wishlist
async function addToWishlist(req, res) {
  try {
    const { productId } = req.params;

    // Is it a valid MongoDB id?
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    // Does this product exist?
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Is it already in the user's wishlist?
    const user = req.user;
    if (user.wishlist.includes(productId)) {
      return res.status(409).json({ success: false, message: "Product already in wishlist" });
    }

    // Add the product ObjectId and save
    user.wishlist.push(productId);
    await user.save();

    res.status(200).json({ success: true, message: "Product added to wishlist" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// GET /wishlist  ->  get current user's wishlist with populated product data
async function getWishlist(req, res) {
  try {
    // populate() replaces the ObjectIds with actual Product documents
    const user = await Customer.findById(req.user._id).populate({
      path: "wishlist",
      select: "name price category image stock"
    });

    res.status(200).json({
      success: true,
      count: user.wishlist.length,
      wishlist: user.wishlist
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// DELETE /wishlist/:productId  ->  remove product from wishlist
async function removeFromWishlist(req, res) {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const user = req.user;

    // Check if product is in wishlist (compare as strings since wishlist holds ObjectIds)
    const index = user.wishlist.findIndex((id) => id.toString() === productId);
    if (index === -1) {
      return res.status(404).json({ success: false, message: "Product not in wishlist" });
    }

    // Remove it and save
    user.wishlist.splice(index, 1);
    await user.save();

    res.status(200).json({ success: true, message: "Product removed from wishlist" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// PATCH /wishlist/:productId/toggle  ->  toggle product in wishlist
async function toggleWishlist(req, res) {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const user = req.user;
    const index = user.wishlist.findIndex((id) => id.toString() === productId);
    
    let saved = false;

    if (index === -1) {
      // Add it
      user.wishlist.push(productId);
      saved = true;
    } else {
      // Remove it
      user.wishlist.splice(index, 1);
      saved = false;
    }

    await user.save();

    res.status(200).json({ success: true, saved });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = { addToWishlist, getWishlist, removeFromWishlist, toggleWishlist };
