const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const authorizeAdmin = require("../middleware/authorizeAdmin");
const {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  getAvailableProducts
} = require("../controllers/productController");
const successfulPurchase = require("../middleware/successfulPurchase");




const router = express.Router();

// Public routes

// Get all products
router.get("/", authenticateToken, async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Default to page 1 and 10 items per page
  try {
    // Use getAllProducts with pagination
    const { products, totalPages } = await getAvailableProducts(page, limit);

    if (!products) {
      return res.status(404).send("No products found");
    }

    // Render the products view with pagination data
    res.render("products", {
      user: req.user,
      products,
      page: parseInt(page),
      totalPages,
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error("Error in /products route:", error.message);
    res.status(500).send("Server error");
  }
});





// Get a single product by ID
router.post("/productById",authenticateToken, getProductById); 
// router.post("/productById",authenticateToken, getProductById); 

// Admin routes
router.put("/api/editProduct/:id", authenticateToken, authorizeAdmin, updateProduct); // Update a product
router.delete("/api/deleteProduct/:id", authenticateToken, authorizeAdmin, deleteProduct); // Delete a product

module.exports = router;
