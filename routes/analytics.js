const User = require("../models/user");
const Order = require("../models/order");
const mongoose = require("mongoose");
const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/user-registrations", authenticateToken, async (req, res) => {
  try {
    // Get the current UTC time
    const today = new Date();
    today.setUTCHours(23, 59, 59, 999); // End of today in UTC

    // Calculate the start date (11 days ago)
    const startDate = new Date(today);
    startDate.setUTCDate(today.getUTCDate() - 14); // Move back 10 days
    startDate.setUTCHours(0, 0, 0, 0); // Start of the day in UTC

    // console.log("Fetching registrations from:", startDate, "to", today); // Debugging

    // Aggregate user registrations grouped by day
    const userRegistrations = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: today }, // Include records within this range
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // Group by date
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 }, // Sort in ascending order
      },
    ]);


    // Create a complete 11-day dataset (fill missing days with 0)
    const last11Days = [];
    for (let i = 14; i >= 0; i--) {
      const date = new Date();
      date.setUTCDate(today.getUTCDate() - i);
      date.setUTCHours(0, 0, 0, 0);
      const formattedDate = date.toISOString().split("T")[0]; // Format YYYY-MM-DD

      const foundData = userRegistrations.find((item) => item._id === formattedDate);
      last11Days.push({
        date: formattedDate,
        count: foundData ? foundData.count : 0,
      });
    }

    res.status(200).json({ success: true, data: last11Days });
  } catch (error) {
    console.error("Error fetching user registrations:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// customers
router.get("/customers-count", authenticateToken, async (req, res) => {
  try {
      const today = new Date();
      today.setUTCHours(23, 59, 59, 999); // End of today

      // Start date (11 days ago)
      const startDate = new Date();
      startDate.setUTCDate(today.getUTCDate() - 14);
      startDate.setUTCHours(0, 0, 0, 0);

      // console.log("Fetching customers from:", startDate, "to", today);

      // Aggregate new customers grouped by date
      const customerCounts = await User.aggregate([
          {
              $match: {
                  hasPurchased: true,
                  createdAt: { $gte: startDate, $lte: today }
              },
          },
          {
              $group: {
                  _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                  count: { $sum: 1 },
              },
          },
          {
              $sort: { _id: 1 },
          },
      ]);

      // Generate full 11-day dataset with missing days set to 0
      const last11Days = [];
      for (let i = 14; i >= 0; i--) {
          const date = new Date();
          date.setUTCDate(today.getUTCDate() - i);
          date.setUTCHours(0, 0, 0, 0);
          const formattedDate = date.toISOString().split("T")[0];

          const foundData = customerCounts.find((item) => item._id === formattedDate);
          last11Days.push({
              date: formattedDate,
              count: foundData ? foundData.count : 0,
          });
      }

      res.status(200).json({ success: true, data: last11Days });
  } catch (error) {
      console.error("Error fetching customer counts:", error);
      res.status(500).json({ success: false, message: "Server error" });
  }
});


// getting orders
router.get("/user-orders", authenticateToken, async (req, res) => {
  try {
      const userId = req.user._id; // Extract user ID from token
      const today = new Date();
      today.setUTCHours(23, 59, 59, 999); // Set to the end of today

      // Calculate the start date (11 days ago)
      const startDate = new Date();
      startDate.setUTCDate(today.getUTCDate() - 14);
      startDate.setUTCHours(0, 0, 0, 0);

      // console.log("Fetching orders from:", startDate, "to", today);

      // Aggregate orders grouped by date
      const orderCounts = await Order.aggregate([
          {
              $match: {
                  userId: userId,
                  createdAt: { $gte: startDate, $lte: today }
              },
          },
          {
              $group: {
                  _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                  count: { $sum: 1 },
              },
          },
          {
              $sort: { _id: 1 },
          },
      ]);

      // Generate a full 11-day dataset with missing days set to 0
      const last11Days = [];
      for (let i = 14; i >= 0; i--) {
          const date = new Date();
          date.setUTCDate(today.getUTCDate() - i);
          date.setUTCHours(0, 0, 0, 0);
          const formattedDate = date.toISOString().split("T")[0];

          const foundData = orderCounts.find((item) => item._id === formattedDate);
          last11Days.push({
              date: formattedDate,
              count: foundData ? foundData.count : 0,
          });
      }

      res.status(200).json({ success: true, data: last11Days });
  } catch (error) {
      console.error("Error fetching user orders:", error);
      res.status(500).json({ success: false, message: "Server error" });
  }
});
 module.exports = router
