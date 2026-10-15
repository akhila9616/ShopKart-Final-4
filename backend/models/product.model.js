const mongoose = require("mongoose");

// Shape of one Product document in MongoDB
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: {
    type: Number,
    required: true,
    validate: (value) => value > 0 // price must be greater than 0
  },
  category: { type: String, required: true },
  image: { type: String, required: true },
  stock: { type: Number, required: true, min: 0 }, // stock cannot be negative
  createdAt: { type: Date, default: Date.now }     // set automatically
});

module.exports = mongoose.model("Product", productSchema);
