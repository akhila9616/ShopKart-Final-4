// Optional: fills MongoDB with sample products.  Run:  npm run seed
require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/product.model");

const products = [
  {
    name: "Noise Cancelling Headphones",
    description: "Wireless over-ear headphones with active noise cancellation.",
    price: 4999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop",
    stock: 25
  },
  {
    name: "Mechanical Keyboard",
    description: "RGB mechanical keyboard with blue switches.",
    price: 2999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&h=400&fit=crop",
    stock: 10
  },
  {
    name: "Smartphone X",
    description: "6.5-inch AMOLED display, 128GB storage, 50MP camera.",
    price: 18999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=400&fit=crop",
    stock: 0
  },
  {
    name: "Cotton T-Shirt",
    description: "Soft, breathable 100% cotton round-neck t-shirt.",
    price: 599,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=400&fit=crop",
    stock: 60
  },
  {
    name: "Denim Jacket",
    description: "Classic fit denim jacket for all seasons.",
    price: 2499,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=400&fit=crop",
    stock: 15
  },
  {
    name: "Clean Code",
    description: "A handbook of agile software craftsmanship.",
    price: 799,
    category: "Books",
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&h=400&fit=crop",
    stock: 40
  },
  {
    name: "The Pragmatic Programmer",
    description: "Your journey to mastery, 20th anniversary edition.",
    price: 899,
    category: "Books",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=400&fit=crop",
    stock: 5
  },
  {
    name: "Ceramic Coffee Mug",
    description: "350ml microwave-safe ceramic mug.",
    price: 349,
    category: "Home",
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&h=400&fit=crop",
    stock: 100
  },
  {
    name: "LED Desk Lamp",
    description: "Adjustable LED lamp with 3 brightness modes.",
    price: 1299,
    category: "Home",
    image: "https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=600&h=400&fit=crop",
    stock: 22
  }
];

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log(`Seeded ${products.length} products`);
    process.exit(0);
  })
  .catch((err) => {
    console.log("Seed error:", err.message);
    process.exit(1);
  });
