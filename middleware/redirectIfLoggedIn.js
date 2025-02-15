const jwt = require("jsonwebtoken");

const redirectIfLoggedIn = (req, res, next) => {
  const token = req.cookies.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SCRT);

      if (decoded.role === "admin") {
        return res.redirect("/admin/dashboard"); // Redirect admin users
      } else {
        return res.redirect("/dashboard"); // Redirect regular users
      }
    } catch (error) {
      console.error("Invalid token:", error.message);
    }
  }

  // No valid token, proceed to the requested page
  next();
};

module.exports = redirectIfLoggedIn;
