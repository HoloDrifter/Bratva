const User = require("./models/user");
const bcrypt = require("bcrypt"); 

require("dotenv").config();
const connection = require("./connection");
connection()

const seedAdmin = async () => {
  try {

    const adminExists = await User.findOne({ username: "bratvaadmin93*@autoshop" });
    if (adminExists) {
      console.log("Admin account already exists");
      return;
    }
    // Hashing the password
        const hashedPassword = await bcrypt.hash('Bratvafamily93*', 10);

    const admin = new User({
      username: "bratvaadmin93*@autoshop",
      password: hashedPassword, 
      role: "admin",
    });

    await admin.save();
    
    console.log("Admin account created");
  } catch (error) {
    console.error("Error seeding admin:", error);
  } 
};

seedAdmin();
