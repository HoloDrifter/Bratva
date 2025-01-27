const authenticateToken = require("../middleware/authMiddleware");
const Order = require("../models/order");
const Product = require("../models/product");
const User = require("../models/user");

// Get all Orders
const getAllOrders = async (req, res) => {
  try {
    if (req.params) {
      const userId = req.params;
    }
    const userId = req.user.id; // User ID extracted from the token
    // Fetch all orders for the user
    const orders = await Order.find({ userId }).populate(
      "productId",
      "name description price type socialCapital apeCode "
    );
    if (!orders) {
      return null;
    }

    return orders;
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
    const orders = await Order.find({ userId }).populate(
      "productId",
      "name price description"
    );

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
console.log(orderCount)
    return orderCount

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
      return res
        .status(400)
        .json({ success: false, message: "Product ID is required" });
    }

    // Fetch the product
    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    if (product.stock <= 0) {
      return res.status(400).json({ success: false, message: "Out of stock!" });
    }

    // Fetch the user
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check if the user has sufficient balance
    if (user.balance < product.price) {
      return res
        .status(400)
        .json({ success: false, message: "Insufficient balance" });
    }

    if (product.stock < 1) {
      return res.status(400).json({ success: false, message: "Out of Stock!" });
    }

    // Check if the user already purchased the product
    // const existingOrder = await Order.findOne({ userId, productId });
    // if (existingOrder) {
    //   return res.status(400).json({ success: false, message: "You have already purchased this product" });
    // }

    // Create a new order
    const newOrder = await Order.create({
      userId,
      productId,
      totalAmount: product.price,
      purchaseDate: new Date(),
    });

    // Deduct the product price from the user's balance
    user.hasPurchased = true;
    user.balance -= product.price;
    await user.save(); // Save the updated balance

    // Decrease the product stock by 1
    product.stock -= 1;
    await product.save();

    // redirection

    // Verify the user has purchased the product
    const order = await Order.findOne({ userId, productId, status: "Paid" });

    if (order) {
      console.log(order);
      return res.status(201).json({
        success: true,
        message: "Purchase successful",
        redirectUrl: `/thank-you/${productId}`,
      });
    } else {
      return res
        .status(403)
        .json({ success: false, message: "Order is not paid yet" });
    }

    // Respond with success and order details
    // res.status(201).json({
    //   success: true,
    //   message: "Order created successfully",
    //   order: {
    //     productId: product._id,
    //     name: product.name,
    //     type: product.type,
    //     description: product.description,
    //     apeCode: product.apeCode,
    //     socialCapital: product.socialCapital,
    //     price: product.price,
    //     purchaseDate: newOrder.purchaseDate,
    //     totalAmount: newOrder.totalAmount,
    //   },
    // });
  } catch (error) {
    console.error("Error creating order:", error.message);
    res
      .status(500)
      .json({
        success: false,
        message: "Server error. Could not create order.",
      });
  }
};

module.exports = { getOrderCount, getAllOrders, createOrder };
