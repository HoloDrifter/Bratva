const Product = require("../models/product");
const multer = require("multer");
const path = require("path");

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Directory where files will be saved
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname); // Unique filename
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedFileTypes = /zip|rar/; // Restrict to ZIP or RAR files
    const extname = allowedFileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedFileTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Only .zip and .rar files are allowed"));
    }
  },
}).single("productFile"); // Expect a file field named 'productFile'

// Fetch all products
// const getAllProducts = async (req, res) => {
//   try {
//     const products = await Product.find();

//     if (!products) {
//       return null;
//     }
//     return products;
//   } catch (error) {
//     console.error("Error fetching products:", error.message);
//     res.status(500).json({
//       success: false,
//       message: "Server error. Could not fetch products.",
//     });
//   }
// };

const getAllProducts = async (page, limit) => {
  try {
    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    // Fetch paginated products
    const products = await Product.find()
      .skip(skip)
      .limit(parseInt(limit))
      .select('name description price type apeCode socialCapital stock createdAt');

    // Count total number of products for pagination
    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit);

    return { products, totalPages };
  } catch (error) {
    console.error("Error fetching products:", error.message);
    throw new Error("Error fetching products");
  }
};








// Fetch product by ID

const getProductById = async (req, res) => {
  const { productId } = req.body;

  try {
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product Id is required",
      });
    }

    const product = await Product.findById(productId).select('name description price type socialCapital ');
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

   return res.status(200).json({
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

// Fetch product details by params
const getProductDetails = async (req, res) => {
  const { productId } = req.params;

  try {
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product Id is required",
      });
    }

    const product = await Product.findById(productId).select('name description price type socialCapital fileUrl');
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return product
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
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "File upload failed",
      });
    }

    const { name, description, type, apeCode, socialCapital, stock, price } =
      req.body;

    try {
     

      // Validate input
      if (
        !name ||
        !description ||
        !price ||
        !type ||
        !apeCode ||
        !socialCapital ||
        !stock ||
        !req.file
      ) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }

      const existingProduct = await Product.findOne({
        name,
        description,
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
        description,
        type,
        apeCode,
        socialCapital,
        stock,
        price,
        fileUrl: req.file ? req.file.path : null, // Save file path in DB
      });

      return res.status(201).json({
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
  });
};

// Update a Product (Admin Only)

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, type, apeCode, socialCapital, stock, price } =
    req.body;

  try {
    // Validate input
    if (
      !name ||
      !description ||
      !price ||
      !type ||
      !apeCode ||
      !socialCapital ||
      !stock
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, description, type, apeCode, socialCapital, stock, price },
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
  getProductDetails
};
