const express = require("express");
const router = express.Router();
const { handleLogin,handleSignup } = require("../controllers/authController");



router.post(`/login`, handleLogin);


router.post("/register", handleSignup);


module.exports = router;
