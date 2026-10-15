const jwt = require("jsonwebtoken");

// Creates a JWT that only contains the customer's id
function generateToken(customerId) {
  return jwt.sign({ id: customerId }, process.env.JWT_SECRET, { expiresIn: "1d" });
}

module.exports = generateToken;
