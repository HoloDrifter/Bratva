const {
  getAllProducts,
  addProduct,
  deleteProduct,
} = require("../controllers/productController");
const {
  getAllUsers,
  getAllCustomers,
} = require("../controllers/userController");

const Announcement = require("../models/announcement");

//   Render Admin Dashboard
const renderAdminDashboard = async (req, res) => {
  try {
    const users = await getAllUsers(req, res);
    const customers = await getAllCustomers(req, res);

    res.render("admin/adminDashboard", { user: req.user, users, customers });
  } catch (error) {
    console.log(error);
  }
};

//   Render Product page

const renderProductPage = async (req, res) => {
  try {
    // fetch products
    const products = await getAllProducts(req, res);
    res.render("admin/showProduct", { user: req.user, products });
  } catch (error) {
    console.log(error);
  }
};

//   Render Add Product Page

const renderAddProduct = (req, res) => {
  res.render("admin/addProduct", { user: req.user });
};

// Render User Page

const renderUserPage = async (req, res) => {
  try {
    // fetch users
    const users = await getAllUsers(req, res);

    res.render("admin/showUsers", { user: req.user, users });
  } catch (error) {
    console.log(error);
  }
};

// Render Customer Page
const renderCustomerPage = async (req, res) => {
  try {
    // fetch customers
    const customers = await getAllCustomers(req, res);
    res.render("admin/showCustomers", { user: req.user, customers });
  } catch (error) {
    console.log(error);
  }
};

// Fetch all announcements
const fetchAllAnnouncement=async(req,res)=>{
try {
    const announcements = await Announcement.find();

    if (!announcements) {
      return null;
    }
    return announcements;
  } catch (error) {
    console.error("Error fetching announcements:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error. Could not fetch announcement.",
    });
  }
}
//   Render Add Announcement Page
const renderAddAnnouncementPage = async (req, res) => {
  const announcements=await fetchAllAnnouncement(req,res)
  res.render("admin/announcement", { user: req.user ,announcements});
};

//   Add Announcement
const addAnnouncement = async (req, res) => {
  const { description } = req.body;

  try {
    // Validate input
    if (!description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const newAnnouncement = await Announcement.create({
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Announcement added successfully",
      announcement: newAnnouncement,
    });
  } catch (error) {
    console.error("Error adding announcement:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error. Could not add announcement.",
    });
  }
};

module.exports = {
  renderAdminDashboard,
  renderProductPage,
  renderAddProduct,
  renderUserPage,
  renderCustomerPage,
  renderAddAnnouncementPage,
  addAnnouncement,
  fetchAllAnnouncement
};
