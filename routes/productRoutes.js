const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const authorizeAdmin = require("../middleware/authorizeAdmin");
const {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const router = express.Router();

// Public routes

// Get all products
router.get("/",authenticateToken , async (req,res)=>{
 
  try {
    // fetch products
    const products = await getAllProducts(req, res);
    res.render("products", { user: req.user, products });
  } catch (error) {
    console.log(error);
  }
}); 

// Get a single product by ID
// router.get("/:id",authenticateToken, getProductById); 

// Admin routes
// router.post("", authenticateToken, authorizeAdmin, addProduct); // Add a product
router.put("/api/editProduct/:id", authenticateToken, authorizeAdmin, updateProduct); // Update a product
router.delete("/api/deleteProduct/:id", authenticateToken, authorizeAdmin, deleteProduct); // Delete a product

module.exports = router;
