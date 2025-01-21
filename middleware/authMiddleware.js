const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authenticateToken = async (req, res, next) => {
  try {
    const token = req.cookies.token; // Get token from cookies
    if (!token) {
      // Redirect to login if no token is found
      return res.redirect("/login");
    }

    const payload = jwt.verify(token, process.env.JWT_SCRT); // Verify token
    const user = await User.findById(payload.id).select("-password"); // Fetch user from DB
    if (!user) {
      // Redirect to login if the user is not found
      return res.redirect("/login");
    }

    req.user = user; // Attach user to the request
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);

    // Redirect to login if the token is invalid or expired
    return res.redirect("/login");
  }
};

module.exports = authenticateToken;
