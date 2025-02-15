const express = require("express");
const axios = require("axios");
const authenticateToken = require("../middleware/authMiddleware");
const router = express.Router();
const Transaction = require("../models/Transaction");
require("dotenv").config();

router.get("/", authenticateToken, (req, res) => {
  res.render("deposit", { message: null, user: req.user });
});

// Get user's deposit history
router.get("/api/user/deposits", authenticateToken, async (req, res) => {
  try {
    const deposits = await Transaction.find({
      userId: req.user._id,
      type: "deposit",
    }).sort({ createdAt: -1 });

    res.json(deposits);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch deposits" });
  }
});

// Get total successful deposits
router.get("/api/user/total-deposits", authenticateToken, async (req, res) => {
  try {
    const result = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          status: "Settled",
          type: "deposit",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const total = result.length > 0 ? result[0].total : 0;
    res.json({ totalDeposits: total });
  } catch (error) {
    res.status(500).json({ error: "Failed to calculate deposits" });
  }
});

// Create a deposit
router.post("/api/deposit", authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user._id;

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid deposit amount" });
    }

    // Create BTCPay invoice
    const response = await axios.post(
      `${process.env.BTCPAY_SERVER_URL}/api/v1/stores/${process.env.STORE_ID}/invoices`,
      {
        amount: amount,
        currency: "EUR",
        metadata: { userId: userId.toString() },
      },
      { headers: { Authorization: `token ${process.env.API_KEY}` } }
    );

    // Save transaction
    const transaction = new Transaction({
      userId,
      invoiceId: response.data.id,
      amount,
      checkOutLink: response.data.checkoutLink,
      currency: "EUR",
      status: "Created",
    });

    await transaction.save();

    res.json({
      checkoutLink: response.data.checkoutLink,
      invoiceId: response.data.id,
    });
  } catch (error) {
    console.error("Deposit error:", error);
    res.status(500).json({ error: "Failed to create deposit" });
  }
});

module.exports = router;
