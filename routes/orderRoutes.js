const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const {
  getAllOrders,
  getOrderCount,
  createOrder,
} = require("../controllers/orderController");

const router = express.Router();

// Get all orders for a user
router.get("/", authenticateToken, async (req, res) => {
  try {
    const orders = await getAllOrders(req, res);
    const user = req.user;
    if (user.role === "admin") {
      res.render("admin/orders", { user, orders });
    } else {
      res.render("orders", { user, orders });
    }
  } catch (error) {
    console.log("error rendering orders", error);
  }
});

// Get the number of orders for a user
router.get("/count", authenticateToken, getOrderCount);

// create new order
router.post("/create", authenticateToken, createOrder);

module.exports = router;
