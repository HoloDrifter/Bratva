const express = require("express");
const router = express.Router();
const { handleSignup } = require("../controllers/authController");

router.get("/", (req, res) => {
  res.render("register", {
    error: "",
    formData: "",
  });
});

router.post("/", handleSignup);

module.exports = router;
