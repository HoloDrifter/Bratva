const User = require("../models/user");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();

    if (!users) {
      return null;
    }
    return users;
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error. Could not fetch users.",
    });
  }
};

const getAllCustomers = async (req, res) => {
  try {
    const customers = await User.find({ hasPurchased: true }).select(
      "username telegram createdAt _id totalOrders"
    );

    if (!customers) {
      return null;
    }
    return customers;
  } catch (error) {
    console.error("Error fetching customers:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error. Could not fetch customers.",
    });
  }
};

// Logout user

const logout = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict", // Prevent CSRF attacks
    });

    res.redirect("/login");
  } catch (error) {
    console.error("Error during logout:", error.message);
    res.status(500).send("Server error. Could not log out.");
  }
};

module.exports = { getAllUsers, getAllCustomers, logout };
