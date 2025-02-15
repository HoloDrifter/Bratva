const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const Product = require("../models/product");
const authenticateToken = require("../middleware/authMiddleware");
const Order = require("../models/order"); // ✅ Ensure Order is imported



router.get("/:orderId/:bankId", authenticateToken, async (req, res) => {
  try {
    const { orderId, bankId } = req.params;
    const userId = req.user.id;

    //  Verify user has purchased this specific order
    const order = await Order.findOne({ userId, _id: orderId, status: "Paid" });

    if (!order) {
      return res
        .status(403)
        .json({ message: "Access denied: You have not purchased this order." });
    }

    if (!order.selectedBanks.includes(bankId)) {
      return res
        .status(403)
        .json({ message: "Access denied: You have not purchased this bank." });
    }

    // Fetch the product and locate the bank file
    const product = await Product.findById(order.productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const bank = product.banks.find((bank) => bank._id.toString() === bankId);

    if (!bank || !bank.bankFile) {
      return res.status(404).json({ message: "Bank file not found." });
    }

    const filePath = path.join(__dirname, "..", "uploads", bank.bankFile);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found on server." });
    }

    // Serve the file for download
    res.download(filePath, bank.bankFile, (err) => {
      if (err) {
        console.error("Error sending file:", err.message);
        res.status(500).json({ message: "Error downloading file." });
      }
    });
  } catch (error) {
    console.error("Error in download route:", error.message);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
