const Order = require("../models/order");
const Product = require("../models/product");
const User = require("../models/user");

// Get all Orders
const getAllOrders = async (req, res) => {
    try {
      const userId = req.user.id; // User ID extracted from the token
      // Fetch all orders for the user
      const orders = await Order.find({ userId }).populate("productId", "name price type stock");
      if(!orders){
        return null
      }
  
     return orders
    } catch (error) {
      console.error("Error fetching orders:", error.message);
      res.status(500).json({
        success: false,
        message: "Server error. Could not fetch orders.",
      });
    }
  };

  // Get orders by ID
const getAllOrdersById = async (req, res) => {
  try {
    const userId = req.params; 

    // Fetch all orders for the user
    const orders = await Order.find({ userId }).populate("productId", "name price description");

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error. Could not fetch orders.",
    });
  }
};

//   Get Order count

const getOrderCount = async (req, res) => {
  try {
    const userId = req.user.id; // User ID extracted from the token

    // Count the total number of orders for the user
    const orderCount = await Order.countDocuments({ userId });

    res.status(200).json({
      success: true,
      orderCount,
    });
  } catch (error) {
    console.error("Error fetching order count:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error. Could not fetch order count.",
    });
  }
};


// Create Order

const createOrder = async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.id; // User ID extracted from the token

  try {
    // Validate input
    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    // Fetch the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Fetch the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if the user has sufficient balance
    if (user.balance < product.price) {
      return res.status(400).json({ success: false, message: "Insufficient balance" });
    }

    // (Optional) Check if the user already purchased the product
    const existingOrder = await Order.findOne({ userId, productId });
    if (existingOrder) {
      return res.status(400).json({ success: false, message: "You have already purchased this product" });
    }

    // Deduct the product price from the user's balance
    user.balance -= product.price;
    await user.save();

    // Create a new order
    const newOrder = await Order.create({
      userId,
      productId,
      purchaseDate: new Date(),
      status: "completed", // Status could also be "pending" based on the flow
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error.message);
    res.status(500).json({ success: false, message: "Server error. Could not create order." });
  }
};



module.exports = {getOrderCount,getAllOrders,createOrder};
