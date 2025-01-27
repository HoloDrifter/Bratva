const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const authorizeAdmin = require("../middleware/authorizeAdmin");
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
  addAnnouncement
} = require("../controllers/adminController");
// const { render } = require("ejs");



// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     console.log(file)
//         const userId = req.user._id; // Assuming you have user information in the request
//         const userUploadsPath = `./uploads/${userId}`;
    
//         // Ensure the directory exists or create it
//         fs.mkdir(userUploadsPath, { recursive: true }, (err) => {
//           if (err) {
//             return cb(err, null);
//           }
//           cb(null, userUploadsPath);
//         });
//       },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + '-' + file.originalname);
//   }
// });
// const upload = multer({ storage: storage });



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
router.post("/api/addProduct", authenticateToken, authorizeAdmin, addProduct);

//   Render Users page

router.get("/users", authenticateToken, authorizeAdmin, renderUserPage);
//   Render customers page

router.get(
  "/customers",
  authenticateToken,
  authorizeAdmin,
  renderCustomerPage
);

// Render add announcement page
router.get("/announcement", authenticateToken, authorizeAdmin, renderAddAnnouncementPage);

// Add announcement
router.post(
  "/api/addAnnouncement",
  authenticateToken,
  authorizeAdmin,
  addAnnouncement
);

module.exports = router;
