const jwt = require("jsonwebtoken");

// Middleware to check if the user is already logged in and redirect based on role
const redirectIfLoggedIn = (req, res, next) => {
  const token = req.cookies.token; // Get token from cookies

  if (token) {
    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SCRT);

      // Redirect based on role
      if (decoded.role === "admin") {
        return res.redirect("/admin/dashboard"); // Redirect admin users
      } else {
        return res.redirect("/dashboard"); // Redirect regular users
      }
    } catch (error) {
      // If token is invalid or expired, proceed to the requested page
      console.error("Invalid token:", error.message);
    }
  }

  // No valid token, proceed to the requested page
  next();
};

module.exports = redirectIfLoggedIn;
