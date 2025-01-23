const Wallet = require("../models/wallet"); // Assuming this is your Wallet model
const User=require('../models/user')
const mongoose = require("mongoose");

const calculateTotalDeposits = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user ID is extracted from the token


    // Aggregate the total deposits for the user
    const result = await Wallet.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } }, // Ensure userId matches the ObjectId type
      { $group: { _id: null, totalDeposits: { $sum: "$amount" } } }, // Sum up the deposit amounts
    ]);


    // Check if there are any deposits
    const totalDeposits = result.length > 0 ? result[0].totalDeposits : 0;

    res.status(200).json({
      success: true,
      totalDeposits,
    });
  } catch (error) {
    // console.error("Error calculating total deposits:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error. Could not calculate total deposits.",
    });
  }
};

// Deposits

const addDeposit = async (req, res) => {
    const { amount, transactionId } = req.body;
    const userId = req.user.id; // Assuming user ID is available via authenticateToken middleware
  
    try {
      // Validate deposit amount
      if (!amount || amount <= 0) {
        return res.status(400).json({ success: false, message: "Invalid deposit amount" });
      }
  
      // Validate transaction ID
      if (!transactionId) {
        return res.status(400).json({ success: false, message: "Transaction ID is required" });
      }
  
      // Find the user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      // Add deposit record to the Wallet collection
      const newDeposit = await Wallet.create({
        userId,
        amount,
        transactionId
      });
  
      // Update user's balance and total deposits
      user.balance += amount;
      await user.save();
  
      res.status(201).json({
        success: true,
        message: "Deposit added successfully",
        deposit: newDeposit,
        balance: user.balance,
      });
    } catch (error) {
      console.error("Error in addDeposit:", error.message);
      res.status(500).json({
        success: false,
        message: "Server error. Could not add deposit.",
      });
    }
  };

module.exports = {addDeposit,calculateTotalDeposits};
