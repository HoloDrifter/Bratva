const authenticateToken = require("../middleware/authMiddleware");
const Order = require("../models/order");
const Product = require("../models/product");
const User = require("../models/user");

// Get all Orders
const getAllOrders = async (req, res) => {
  try {
    const userId = req.user.id;
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
    const { userId } = req.params;
    // Fetch all orders for the user
    const orders = await Order.find({ userId })
    .populate({
      path: "productId",
      select: "name description type socialCapital apeCode banks",
    })
    .populate("userId", "username")
    .lean();

    if (!orders) {
      return null;
    }

    const processedOrders = orders.map(order => {
      try {
        // Preserve banks array for filtering
        const productBanks = order.productId?.banks || [];
        const selectedBankIds = order.selectedBanks?.map(id => id.toString()) || [];

        // Filter using original banks array
        const selectedBanks = productBanks.filter(bank => 
          selectedBankIds.includes(bank._id.toString())
        );

        // Create new product object WITHOUT banks after filtering
        const productWithoutBanks = { ...order.productId };
        delete productWithoutBanks.banks;

        return {
          ...order,
          productId: productWithoutBanks,
          selectedBanks: selectedBanks.map(bank => ({
            // Transform to desired format
            _id: bank._id,
            name: bank.name,
            price: bank.price,
            bankFile: bank.bankFile
          }))
        };
      } catch (mapError) {
        console.error("Error processing order:", mapError.message);
        return null;
      }
    }).filter(order => order !== null);
    // console.log("Processed Orders:", processedOrders[0].selectedBanks);
    // console.log("Sample populated product:", orders[0]?.productId);
    // console.log("Sample selectedBanks:", orders[0]?.selectedBanks);

    return processedOrders;
  } catch (error) {
    console.error("Error fetching orders:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error. Could not fetch orders.",
    });
  }
};

// Create Order

const createOrder = async (req, res) => {
  const { productId, selectedBanks } = req.body;
  const userId = req.user.id; // User ID from authentication token

  try {
    //  Validate input
    if (!productId || !selectedBanks || selectedBanks.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Product ID and at least one bank must be selected",
      });
    }

    //  Fetch the product
    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    //  Fetch the user
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    //  Check if selected banks are available (not already purchased)
    const banksToPurchase = product.banks.filter(
      (bank) => selectedBanks.includes(bank._id.toString()) && !bank.purchased
    );

    if (banksToPurchase.length !== selectedBanks.length) {
      return res.status(400).json({
        success: false,
        message: "Some selected banks are already purchased",
      });
    }

    //  Calculate total price based on selected banks
    const totalAmount = banksToPurchase.reduce(
      (sum, bank) => sum + bank.price,
      0
    );

    //  Check if the user has sufficient balance
    if (user.balance < totalAmount) {
      return res
        .status(400)
        .json({ success: false, message: "Insufficient balance" });
    }

    //  Create a new order
    const newOrder = await Order.create({
      userId,
      productId,
      selectedBanks, // Store the selected bank IDs
      totalAmount,
      status: "Paid",
    });

    //  Deduct the total amount from the user's balance
    await User.findByIdAndUpdate(userId, {
      $inc: { totalOrders: 1 },
      $set: { balance: user.balance - totalAmount, hasPurchased: true },
    });

    //  Mark banks as purchased
    product.banks = product.banks.map((bank) => {
      if (selectedBanks.includes(bank._id.toString())) {
        return { ...bank.toObject(), purchased: true, purchasedBy: userId };
      }
      return bank;
    });

    await product.save(); // Save updated product with modified banks

    //  Return success response
    return res.status(201).json({
      success: true,
      message: "Purchase successful",
      orderId: newOrder._id,
      redirectUrl: `/thank-you/${newOrder._id}`,
    });
  } catch (error) {
    console.error("Error creating order:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error. Could not create order.",
    });
  }
};

// Get Order Details

const getOrderDetails = async (userId, orderId) => {
  try {
    if (!orderId) {
      throw new Error("Order ID is required");
    }

    //  Fetch Specific Order by Order ID
    const order = await Order.findOne({ userId, _id: orderId, status: "Paid" })
      .populate("productId", "name description type socialCapital")
      .lean();

    if (!order) {
      console.error("Order not found for user:", userId);
      return null;
    }

    console.log(order)
    if (!order.selectedBanks || order.selectedBanks.length === 0) {
      console.error("selectedBanks is missing or empty in order:", order);
      return null;
    }

    //  Fetch Product
    const product = await Product.findById(order.productId).lean();
    if (!product) {
      console.error(" Product not found:", order.productId);
      return null;
    }

    //  Only Include Banks Purchased in this Order
    const purchasedBanks = product.banks.filter((bank) =>
      order.selectedBanks.some((id) => id.toString() === bank._id.toString())
    );

    return {
      product: order.productId,
      purchasedBanks,
      totalAmount: order.totalAmount,
      purchaseDate: order.createdAt,
      orderId: order._id,
    };
  } catch (error) {
    console.error(" Error fetching order details:", error.message);
    return null;
  }
};

module.exports = {
  getAllOrders,
  createOrder,
  getAllOrdersById,
  getOrderDetails,
};
