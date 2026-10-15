const express = require("express");
const router = express.Router();

const {
  createProduct,
  getProducts,
  getProductById
} = require("../controllers/product.controller");

// Open APIs for this lab (admin auth comes in a later lab)
router.post("/", createProduct);
router.get("/", getProducts);
router.get("/:id", getProductById);

module.exports = router;
