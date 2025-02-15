const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const authorizeAdmin = require("../middleware/authorizeAdmin");
const Product = require("../models/product");
const path = require("path");


const {
  getAllProducts,
  addProduct,
  deleteProduct,
} = require("../controllers/productController");
const {
  renderAdminDashboard,
  renderProductPage,
  renderAddProduct,
  renderUserPage,
  renderCustomerPage,
  renderAddAnnouncementPage,
  addAnnouncement,
} = require("../controllers/adminController");

const multer = require("multer");
// Set up file storage for multer (where to store the uploaded files)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // add timestamp to avoid file name collisions
  },
});

const upload = multer({ storage: storage });

// Admin dashboard
router.get(
  "/dashboard",
  authenticateToken,
  authorizeAdmin,
  renderAdminDashboard
);

//   Render Product page
router.get("/products", authenticateToken, authorizeAdmin, renderProductPage);


// Render add Product page
router.get("/addProduct", authenticateToken, authorizeAdmin, renderAddProduct);
// Create new product

router.post(
  "/api/addProduct",
  authenticateToken,
  authorizeAdmin,
  upload.array("bankFiles[]"),
 addProduct
);

//   Render Users page

router.get("/users", authenticateToken, authorizeAdmin, renderUserPage);
//   Render customers page

router.get("/customers", authenticateToken, authorizeAdmin, renderCustomerPage);

// Render add announcement page
router.get(
  "/announcement",
  authenticateToken,
  authorizeAdmin,
  renderAddAnnouncementPage
);

// Add announcement
router.post(
  "/api/addAnnouncement",
  authenticateToken,
  authorizeAdmin,
  addAnnouncement
);

module.exports = router;
