const Product = require("../models/product");

// Fetch all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();

    if (!products) {
      return null;
    }
    return products;
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error. Could not fetch products.",
    });
  }
};

// Fetch product by ID

const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Error fetching product:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error. Could not fetch product.",
    });
  }
};

// Add new product (Admin Only)

const addProduct = async (req, res) => {
  const { name, type, apeCode, socialCapital, stock, price } = req.body;

  try {
    // Validate input
    if (!name || !price || !type || !apeCode || !socialCapital || !stock) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const existingProduct = await Product.findOne({
      name,
      type,
      apeCode,
      socialCapital,
      stock,
      price,
    });

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Product already exists with the same details",
      });
    }

    const newProduct = await Product.create({
      name,
      type,
      apeCode,
      socialCapital,
      stock,
      price,
    });

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error adding product:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error. Could not add product.",
    });
  }
};

// Update a Product (Admin Only)

const updateProduct = async (req, res) => {
  const { id } = req.params; 
  const { name, type, apeCode, socialCapital, stock, price } = req.body;

  try {
    // Validate input
    if (!name || !price || !type || !apeCode || !socialCapital || !stock) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, type, apeCode, socialCapital, stock, price },
      { new: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product: updatedProduct,
      message: "Product added successfully",
    });
  } catch (error) {
    console.error("Error updating product:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error. Could not update product.",
    });
  }
};

// Delete a Product (Admin Only)

const deleteProduct = async (req, res) => {
  const { id } = req.params; // Extract product ID from route params

  try {
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      product: deletedProduct,
    });
  } catch (error) {
    console.error("Error deleting product:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error. Could not delete product.",
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
};
