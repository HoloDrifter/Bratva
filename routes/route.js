const express = require("express");
const router = express.Router();
const { handleSignup } = require("../controllers/authController");
const authenticateToken=require('../middleware/authMiddleware')
const authorizeAdmin=require('../middleware/authorizeAdmin')
// Register
router.get("/register", (req, res) => {
  res.render("register", {
    error: "",
    formData: "",
  });
});

// Login
router.get("/login", (req, res) => {
  res.render("login", { error: "", formData: "" });
});


// Dashboard
router.get("/dashboard", authenticateToken, (req, res) => {
  res.render("dashboard");
});

// Admin dashboard
router.get('/admin/dashboard',authenticateToken, authorizeAdmin,(req,res)=>{
  res.render('adminDashboard',{ user: req.user })
})
module.exports = router;
