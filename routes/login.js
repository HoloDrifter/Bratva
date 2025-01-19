const express = require("express");
const router = express.Router();
const { handleLogin } = require("../controllers/authController");

router.get("/", (req, res) => {
  res.render("login", { error: "", formData: "" });
});

router.post(`/`, handleLogin);

module.exports = router;
