const mongoose = require("mongoose");
const Product = require("../models/product.model");

// POST /products  -> create a product
async function createProduct(req, res) {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (error) {
    // Mongoose validation failed (missing field, bad price, bad stock)
    res.status(400).json({ success: false, message: error.message });
  }
}

// GET /products?search=&category=&sort=  -> list products
async function getProducts(req, res) {
  try {
    const { search, category, sort } = req.query;

    // Build the filter only from the query params that were sent
    const filter = {};
    if (search) filter.name = { $regex: search, $options: "i" }; // contains, case-insensitive
    if (category) filter.category = category;

    // Default: newest first. Bonus: sorting by price
    let sortBy = { createdAt: -1 };
    if (sort === "price_asc") sortBy = { price: 1 };
    if (sort === "price_desc") sortBy = { price: -1 };

    const products = await Product.find(filter)
      .select("name price category image stock") // only what the UI needs (_id comes by default)
      .sort(sortBy);

    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// GET /products/:id  -> one product
async function getProductById(req, res) {
  try {
    const { id } = req.params;

    // Is it a valid MongoDB id?
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(id);

    // Valid id, but no such product
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = { createProduct, getProducts, getProductById };
