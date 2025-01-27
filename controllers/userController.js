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
    const customers = await User.find({ hasPurchased: true });

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
    // Clear the token cookie
    res.clearCookie("token", {
      httpOnly: true, // Prevent client-side JavaScript access
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "strict", // Prevent CSRF attacks
    });

    // Redirect the user to the login page
    res.redirect("/login");
  } catch (error) {
    console.error("Error during logout:", error.message);
    res.status(500).send("Server error. Could not log out.");
  }
};

// const getUserBalance=(req,res)=>{
//   const id=req.user
//   console.log(id)

//   try{


//   }catch(error)
//   {
//     res.status(500).json({status:false,message:`Failed to get User Balance ${error}`})
//   }
// }

module.exports={getAllUsers,getAllCustomers,logout}