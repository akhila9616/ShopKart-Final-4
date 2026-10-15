const crypto = require("crypto");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const razorpay = require("../config/razorpay");

// POST /orders/create-payment-order
async function createPaymentOrder(req, res) {
  try {
    const { shippingAddress } = req.body;

    // Validate shipping address
    if (!shippingAddress) {
      return res.status(400).json({ success: false, message: "Shipping address is required" });
    }

    const { fullName, phone, addressLine1, city, state, pincode } = shippingAddress;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ success: false, message: "Full name is required" });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, message: "Phone number is required" });
    }
    if (!/^\d{10}$/.test(phone.trim())) {
      return res.status(400).json({ success: false, message: "Phone must be a valid 10-digit number" });
    }
    if (!addressLine1 || !addressLine1.trim()) {
      return res.status(400).json({ success: false, message: "Address is required" });
    }
    if (!city || !city.trim()) {
      return res.status(400).json({ success: false, message: "City is required" });
    }
    if (!state || !state.trim()) {
      return res.status(400).json({ success: false, message: "State is required" });
    }
    if (!pincode || !/^\d{6}$/.test(pincode.trim())) {
      return res.status(400).json({ success: false, message: "Pincode must be 6 digits" });
    }

    // Load user with cart
    const customer = await Customer.findById(req.user._id);
    if (!customer.cart || customer.cart.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // Load latest product data and validate stock
    const orderItems = [];
    let totalAmount = 0;

    for (const cartItem of customer.cart) {
      const product = await Product.findById(cartItem.product);

      if (!product) {
        return res.status(400).json({
          success: false,
          message: "Product no longer available",
        });
      }

      if (product.stock < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        });
      }

      // Snapshot product data
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.image,
      });

      totalAmount += product.price * cartItem.quantity;
    }

    // Create ShopKart order with PENDING_PAYMENT
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        addressLine1: addressLine1.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
      },
      totalAmount,
      paymentStatus: "PENDING",
      status: "PENDING_PAYMENT",
    });

    // Create Razorpay Order (amount in paise)
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: order._id.toString(),
    });

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.status(201).json({
      success: true,
      shopKartOrderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create payment order error:", error);
    const message = error?.error?.description || error?.message || "Failed to create order";
    res.status(500).json({ success: false, message });
  }
}

// POST /orders/verify-payment
async function verifyPayment(req, res) {
  try {
    const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const order = await Order.findById(shopKartOrderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Use stored razorpayOrderId (trusted) for signature verification
    const body = order.razorpayOrderId + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      order.paymentStatus = "FAILED";
      await order.save();
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    // Mark order as paid
    order.paymentStatus = "PAID";
    order.status = "PLACED";
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // Clear user's cart only after successful payment
    const customer = await Customer.findById(req.user._id);
    customer.cart = [];
    await customer.save();

    res.json({ success: true, message: "Payment verified successfully", order });
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({ success: false, message: "Payment verification failed" });
  }
}

// GET /orders
async function getOrders(req, res) {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
}

// GET /orders/:id
async function getOrderById(req, res) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch order" });
  }
}

// PUT /orders/:id/status (Bonus - status progression)
async function updateOrderStatus(req, res) {
  try {
    const { status } = req.body;
    const allowed = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    order.status = status;
    await order.save();
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update order status" });
  }
}

module.exports = { createPaymentOrder, verifyPayment, getOrders, getOrderById, updateOrderStatus };
