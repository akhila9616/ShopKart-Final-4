const bcrypt = require("bcrypt");
const Customer = require("../models/customer.model");
const generateToken = require("../utils/generateToken");

// Returns customer data WITHOUT the password
function customerData(customer) {
  return {
    _id: customer._id,
    fullName: customer.fullName,
    email: customer.email,
    phone: customer.phone
  };
}

// ---------- 1. REGISTER ----------
async function registerCustomer(req, res) {
  try {
    const { fullName, email, password, phone } = req.body;

    // All fields are mandatory
    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Password must have at least 6 characters
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must contain at least 6 characters" });
    }

    // Email must be unique
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(409).json({ success: false, message: "Email already exists" });
    }

    // Store only the bcrypt hash
    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await Customer.create({
      fullName,
      email,
      password: hashedPassword,
      phone
    });

    res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      customer: customerData(customer)
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// ---------- 2. LOGIN ----------
async function loginCustomer(req, res) {
  try {
    const { email, password } = req.body;

    // Same message for every failure, so we never reveal what was wrong
    if (!email || !password) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Compare the typed password with the stored hash
    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = generateToken(customer._id);

    // Save the JWT in an HttpOnly cookie (JavaScript in the browser cannot read it)
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      customer: customerData(customer)
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// ---------- 3. MY PROFILE (protected) ----------
// authMiddleware has already put the customer in req.user
async function getMyProfile(req, res) {
  res.status(200).json(customerData(req.user));
}

// ---------- 4. LOGOUT (protected) ----------
async function logoutCustomer(req, res) {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
}

// ---------- BONUS: CHANGE PASSWORD (protected) ----------
async function changePassword(req, res) {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Old and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password must contain at least 6 characters" });
    }

    // Verify the old password first
    const isMatch = await bcrypt.compare(oldPassword, req.user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Old password is incorrect" });
    }

    // Hash the new password before saving
    req.user.password = await bcrypt.hash(newPassword, 10);
    await req.user.save();

    res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = {
  registerCustomer,
  loginCustomer,
  getMyProfile,
  logoutCustomer,
  changePassword
};
