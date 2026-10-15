const jwt = require("jsonwebtoken");
const Customer = require("../models/customer.model");

// Runs BEFORE a protected controller.
// Reads the JWT from HttpOnly cookie (browser) OR Authorization Bearer header (Postman/API clients)
async function authMiddleware(req, res, next) {
  // Support both cookie-based auth (browser) and Bearer token (Postman)
  let token = req.cookies.token;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  // 1. Is there a token?
  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    // 2. Is the token valid (not fake, not expired)?
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Does this customer exist in the database?
    const customer = await Customer.findById(decoded.id);
    if (!customer) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // 4. Attach the customer to the request and continue
    req.user = customer;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
}

module.exports = authMiddleware;
