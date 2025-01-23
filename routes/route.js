const express = require("express");
const router = express.Router();
const { handleSignup } = require("../controllers/authController");
const authenticateToken=require('../middleware/authMiddleware')
const authorizeAdmin=require('../middleware/authorizeAdmin')
const redirectIfLoggedIn=require('../middleware/redirectIfLoggedIn')
const {fetchAllAnnouncement}=require('../controllers/adminController')
const {
  getAllProducts,
} = require("../controllers/productController");
const {
  getAllUsers,
  logout,
 
} = require("../controllers/userController");


// Register
router.get("/register",redirectIfLoggedIn, (req, res) => {
  res.render("register", {
    error: "",
    formData: "",
  });
});

// Login
router.get("/login",redirectIfLoggedIn, (req, res) => {
  res.render("login", { error: "", formData: "" });
});

// logout
router.get('/logout',authenticateToken,logout)

// Dashboard
router.get("/dashboard", authenticateToken, async (req, res) => {
  try{
    const users = await getAllUsers(req, res);
    const announcements=await fetchAllAnnouncement(req,res)
    res.render("dashboard",{user:req.user, announcements,users});
  }catch(error){
    console.error("Error rendering Users Dashboard:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error. Could not render Users Dashboard.",
    });
  }
});




//  Profile routes
router.get('/profile',authenticateToken,(req,res)=>{
  // console.log(req.user)
  res.render('profile', {user:req.user})
})

router.get('/profile/pass', authenticateToken,(req,res)=>{
  res.render('changePass',{user:req.user})
})





// Random routes
// router.get('/userDetails', authenticateToken,(req,res)=>{
//   console.log(req.user)
// })
module.exports = router;
