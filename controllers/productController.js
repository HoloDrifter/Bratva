const Product = require("../models/product");

// Fetch all products

const getAllProducts = async (page, limit) => {
  try {
    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    // Fetch paginated products
    const products = await Product.find()
      .skip(skip)
      .limit(parseInt(limit))
      .select("-banks.bankFile -banks.purchasedBy");

    // Count total number of products for pagination
    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit);

    return { products, totalPages };
  } catch (error) {
    console.error("Error fetching products:", error.message);
    throw new Error("Error fetching products");
  }
};


const getAvailableProducts = async (page, limit) => {
  try {
    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    // Fetch products whose banks have at least one bank with purchased: false
    const products = await Product.aggregate([
      // Step 1: Unwind the banks array to check each bank individually
      { $unwind: "$banks" },

      // Step 2: Filter only the products with banks where purchased: false
      { $match: { "banks.purchased": false } },

      // Step 3: Exclude the fields bankFile and purchasedBy from the banks
      { $project: {
        name: 1,
        description: 1,
        type: 1,
        apeCode: 1,
        socialCapital: 1,
        fileUrl: 1,
        dateImmatriculation: 1,
        createdAt: 1,
        banks: {
          _id: 1,
          name: 1,
          price: 1
        }
      } },

      // Step 4: Group back the products by their _id to reassemble the product documents
      { $group: {
        _id: "$_id",
        name: { $first: "$name" },
        description: { $first: "$description" },
        type: { $first: "$type" },
        apeCode: { $first: "$apeCode" },
        socialCapital: { $first: "$socialCapital" },
        fileUrl: { $first: "$fileUrl" },
        dateImmatriculation: { $first: "$dateImmatriculation" },
        banks: { $push: "$banks" }, // reassemble banks array
        createdAt: { $first: "$createdAt" }
      } },

      // Step 5: Pagination - Skip and Limit
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);

    // Count total number of products with at least one bank with purchased: false for pagination
    const totalProducts = await Product.aggregate([
      { $unwind: "$banks" },
      { $match: { "banks.purchased": false } },
      { $group: { _id: "$_id" } },
      { $count: "total" }
    ]);

    const totalPages = totalProducts.length > 0 ? Math.ceil(totalProducts[0].total / limit) : 1;

    return { products, totalPages };
  } catch (error) {
    console.error("Error fetching products:", error.message);
    throw new Error("Error fetching products");
  }
};







const getProductById = async (req, res) => {
  const { productId } = req.body;

  try {
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product Id is required",
      });
    }

    const product = await Product.findById(productId).select(
      "-banks.bankFile -banks.purchasedBy"
    );
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




// Add new product (Admin Only)

const addProduct = async (req, res) => {
  // Use multer middleware for file uploads

  const {
    name,
    description,
    type,
    apeCode,
    socialCapital,
    dateImmatriculation,
    bankNames,
    bankPrices,
  } = req.body;

  try {
    // Validate the form input
    if (
      !name ||
      !description ||
      !dateImmatriculation ||
      !type ||
      !apeCode ||
      !socialCapital
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if the product already exists
    const existingProduct = await Product.findOne({
      name,
      description,
      type,
      apeCode,
      socialCapital,
    });

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Product already exists with the same details",
      });
    }

    let banks = [];
    if (Array.isArray(bankNames)) {
      banks = bankNames.map((name, index) => ({
        name,
        price: bankPrices[index],
        bankFile: req.files[index]?.filename,
      }));
    } else if (bankNames) {
      banks.push({
        name: bankNames,
        price: bankPrices,
        bankFile: req.files[0]?.filename,
      });
    }


    // Create a new product with bank data and file paths
    const newProduct = await Product.create({
      name,
      description,
      type,
      apeCode,
      socialCapital,
      banks, // Store the banks data with file paths
      dateImmatriculation,
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
  getAvailableProducts
};
