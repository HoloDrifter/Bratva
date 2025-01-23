const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authenticateToken = async (req, res, next) => {
  try {
    const token = req.cookies.token; // Get token from cookies
    if (!token) {
      // Redirect to login if no token is found
      return res.redirect("/login");
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    const payload = jwt.verify(token, process.env.JWT_SCRT); // Verify token
    const user = await User.findById(payload.id).select("-password"); // Fetch user from DB
    if (!user) {
      // Redirect to login if the user is not found
      return res.redirect("/login");
      return res
      .status(404)
      .json({ success: false, message: "User not found" });
    }

    req.user = user; // Attach user to the request
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
    // Redirect to login if the token is invalid or expired
    return res.redirect("/login");
  }
};

module.exports = authenticateToken;
