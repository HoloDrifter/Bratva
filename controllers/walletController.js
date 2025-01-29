const Wallet = require("../models/wallet"); // Assuming this is your Wallet model
const User = require("../models/user");
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

module.exports = { calculateTotalDeposits };
