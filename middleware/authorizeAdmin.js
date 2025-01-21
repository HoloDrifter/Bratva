const authorizeAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
      // Redirect to login if the user is not an admin
      return res.redirect("/login");
    }
    next();
  };
  
  module.exports = authorizeAdmin;
  