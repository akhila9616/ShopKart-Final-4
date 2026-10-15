const mongoose = require("mongoose");

// Shape of one Customer document in MongoDB
const customerSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // stores the bcrypt HASH, never the real password
    phone: { type: String, required: true },

    // Lab-04: Wishlist — stores Product ObjectIds (references, not copies)
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      }
    ],

    // Lab-05: Cart — stores Product reference + quantity
    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        quantity: {
          type: Number,
          default: 1,
          min: 1
        }
      }
    ]
  },
  { timestamps: true } // automatically adds createdAt and updatedAt
);

module.exports = mongoose.model("Customer", customerSchema);
