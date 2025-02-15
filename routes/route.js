const express = require("express");
const router = express.Router();
const { handleSignup } = require("../controllers/authController");
const authenticateToken = require("../middleware/authMiddleware");
const authorizeAdmin = require("../middleware/authorizeAdmin");
const redirectIfLoggedIn = require("../middleware/redirectIfLoggedIn");
const { fetchAllAnnouncement } = require("../controllers/adminController");
const {
  getAllProducts,
  getProductById,
} = require("../controllers/productController");
const { getOrderDetails } = require("../controllers/orderController");
const { getAllUsers, logout } = require("../controllers/userController");
const successfulPurchase = require("../middleware/successfulPurchase");
const User = require("../models/user");
const bcrypt = require("bcrypt");

// landing page
router.get("/", redirectIfLoggedIn, (req, res) => {
  res.render("landing/home",{ activePage: 'home' });

});

// Register
router.get("/register", redirectIfLoggedIn, (req, res) => {
  res.render("register", {
    error: "",
    formData: "",
  });
});

// Login
router.get("/login", redirectIfLoggedIn, (req, res) => {
  res.render("login", { error: "", formData: "" });
});

// logout
router.get("/logout", authenticateToken, logout);

// Dashboard
router.get("/dashboard", authenticateToken, async (req, res) => {
  try {
    const users = await getAllUsers(req, res);
    const announcements = await fetchAllAnnouncement(req, res);
    res.render("dashboard", { user: req.user, announcements, users });
  } catch (error) {
    console.error("Error rendering Users Dashboard:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error. Could not render Users Dashboard.",
    });
  }
});

//  Profile routes
router.get("/profile", authenticateToken, (req, res) => {
  res.render("profile", { user: req.user });
});

router.get("/profile/pass", authenticateToken, (req, res) => {
  res.render("changePass", { user: req.user });
});

// change password
router.post(
  "/api/profile/change-password",
  authenticateToken,
  async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "New passwords do not match." });
    }

    try {
      const userId = req.user._id;

      const user = await User.findById(userId);

      if (!user)
        return res
          .status(400)
          .json({ success: false, message: "Account does not exists!" });

      // Verify the current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ success: false, message: "Current password is incorrect." });
      }

      if (newPassword === currentPassword)
        return res.status(400).json({
          success: false,
          message: "The new password cannot be the same as the old one.",
        });
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update the password in the database
      user.password = hashedPassword;
      await user.save();

      res
        .status(200)
        .json({ success: true, message: "Password updated successfully." });
    } catch (error) {
      console.error("Error updating password:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error." });
    }
  }
);

router.get(
  "/thank-you/:orderId",
  authenticateToken,
  successfulPurchase,
  async (req, res) => {
    try {
      const orderDetails = await getOrderDetails(
        req.user.id,
        req.params.orderId
      );

      if (!orderDetails) {
        return res
          .status(404)
          .json({ success: false, message: "Order details not found" });
      }

      res.render("thank-you", { user: req.user, order: orderDetails });
    } catch (err) {
      res.status(500).json({ message: "Page not found", error: err.message });
    }
  }
);

// Support page
router.get("/support", authenticateToken, (req, res) => {
  res.render("support", { user: req.user });
});



// ======== Home page Routes=========

// Home page
router.get("/home", async (req, res) => {
  res.render("landing/home",{ activePage: 'home' });
});
// About page
router.get("/about", async (req, res) => {
  res.render("landing/about",{ activePage: 'about' });
});
// Identity-policy
router.get("/politique-de-remboursement", async (req, res) => {
  res.render("landing/refund-policy",{ activePage: 'home' });
});

// Refund policy
router.get("/politique-de-confidentitalite", async (req, res) => {
  res.render("landing/identity-policy",{ activePage: 'home' });
});

// ==Product routes
// french company
router.get("/products/french-company", async (req, res) => {
  res.render("landing/products/french-company",{ activePage: 'products' });
});
// Paradis bancaire
router.get("/products/paradis-bancaire", async (req, res) => {
  res.render("landing/products/paradis-bancaire",{ activePage: 'products' });
});
// uk company
router.get("/products/uk-company", async (req, res) => {
  res.render("landing/products/uk-company",{ activePage: 'products' });
});

// ==Service routes
// blanchiment-d'argent
router.get("/services/blanchiment-d'argent", async (req, res) => {
  res.render("landing/services/blanchiment-d'argent",{ activePage: 'services' });
});
// Évasion-fiscale
router.get("/services/evasion-fiscale", async (req, res) => {
  res.render("landing/services/Évasion-fiscale",{ activePage: 'services' });
});
// Décaisse-et-Facturation-fournisseur
router.get("/services/decaisse-et-Facturation-fournisseur", async (req, res) => {
  res.render("landing/services/Décaisse-et-Facturation-fournisseur",{ activePage: 'services' });
});

module.exports = router;
