const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authenticateToken = async (req, res, next) => {
  try {
    const token = req.cookies.token; 
    if (!token) {
      return res.redirect("/login");
    }

    const payload = jwt.verify(token, process.env.JWT_SCRT); 
    const user = await User.findById(payload.id).select("-password"); 
    if (!user) {
      return res.redirect("/login");
    }

    req.user = user; 
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
    return res.redirect("/login");
  }
};

// const authenticateToken = async (req, res, next) => {
//   try {
//     const token = req.cookies.token; // Get token from cookies

//     if (!token) {
//       // If no token, send an error response without redirecting for SSE requests
//       if (!req.isSSE) {
//         return res.redirect("/login");  // Normal routes: redirect
//       } else {
//         return res.status(401).json({ success: false, message: "No token provided" });
//       }
//     }

//     const payload = jwt.verify(token, process.env.JWT_SCRT); // Verify token
//     const user = await User.findById(payload.id).select("-password"); // Fetch user from DB

//     if (!user) {
//       // If user not found, send an error response
//       if (!req.isSSE) {
//         return res.redirect("/login"); // Normal routes: redirect
//       } else {
//         return res.status(404).json({ success: false, message: "User not found" });
//       }
//     }

//     req.user = user; // Attach user to the request

//     // Set a flag on the request object to indicate that this is an SSE request
//     req.isSSE = true;

//     next();
//   } catch (error) {
//     console.error("Authentication error:", error.message);

//     if (!req.isSSE) {
//       return res.redirect("/login");  // Normal routes: redirect
//     } else {
//       res.status(500).json({ success: false, message: "Server error" });
//     }
//   }
// };

module.exports = authenticateToken;
