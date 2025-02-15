const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const successfulPurchase = require("../middleware/successfulPurchase");
const {
  getAllOrders,
  getOrderCount,
  createOrder,
  getAllOrdersById
} = require("../controllers/orderController");
const { getProductById } = require("../controllers/productController");

const router = express.Router();
const rateLimit = require("express-rate-limit");

// Apply rate limiter only on order creation
const orderLimiter = rateLimit({
    windowMs: 7000, 
    max: 1, // Allow 1 request per 7 seconds per IP
    message: { success: false, message: "Too many requests. Please wait before ordering again." }
});

// Get all orders for a user
router.get("/", authenticateToken, async (req, res) => {
  try {
    const orders = await getAllOrders(req, res);
    const user = req.user;
    res.render("orders", { user, orders });
  } catch (error) {
    console.log("error rendering orders", error);
  }
});

router.get("/:userId", authenticateToken,async (req, res) => {
  try {
    const ordersById = await getAllOrdersById(req, res);
    const user = req.user;
    res.render("admin/orders", { user, ordersById });
  } catch (error) {
    console.log("error rendering orders", error);

  }
});

// Get the number of orders for a user

// create new order
router.post("/create", authenticateToken,orderLimiter, createOrder);

// Render Successful order
router.post("/thank-you", authenticateToken, successfulPurchase, createOrder);

module.exports = router;
