const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Login
const handleLogin = async (req, res) => {
  const { username, password } = req.body;

  // Check for empty fields
  if (!username || !password) {
    let error = !username ? "Username is Empty" : "Password is Empty";
    return res.status(400).json({ success: false, error });
  }

  try {
    // Find user in the database
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Check password match
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: "Invalid credentials" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role }, // Include user role in the token payload
      process.env.JWT_SCRT, // Secret key
      {
        expiresIn: "2d", // Token expires in 2 days
      }
    );

    // Set token as an HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true, // Prevent client-side JavaScript access
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production (HTTPS)
      maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days in milliseconds
    });

    // Send response without including the token in the body
    if (user.username === "bratvaadmin93*@autoshop") {
      return res.status(200).json({ success: true, message: "Admin login successful", role: user.role });
    }

    res.status(200).json({ success: true, message: "Login successful", role: user.role });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
};


//   Signup

const handleSignup = async (req, res) => {
  const { username, password, confirmPassword, telegram } = req.body;


  // Validation block
  if (!username || !password || !confirmPassword) {
    let error = "Field is Empty";

    if (!username) {
      error = "Username is Empty";
    } else if (!password) {
      error = "Password is Empty";
    } else if (!confirmPassword) {
      error = "Confirm Password is Empty";
    }

    return res.status(400).json({ success: false, error });
  }

  try {
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, error: "User already exists" });
    }

    if (username.length < 4 || username.length > 15) {
      return res.status(400).json({
        success: false,
        error: "Username must be 4-15 characters long",
      });
    }

    if (password.length < 8 || password.length > 20) {
      // console.log("Password must be 8-20 characters long");
      return res.status(400).json({
        success: false,
        error: "Password must be 8-20 characters long",
      });
    }

    if (password !== confirmPassword) {
      // console.log("Password does not match");
      return res.status(400).json({
        success: false,
        error: "Password does not match",
      });
    }

    // Hashing the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
      telegram,
    });

    // Save the user
    await newUser.save();

    // Generate a JWT token
    const token = jwt.sign(
      { id: newUser._id, username: newUser.username, role: newUser.role },
      process.env.JWT_SCRT,
      { expiresIn: "2d" }
    );

    console.log("User created successfully");

    // Set token as an HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true, // Prevent access via client-side JavaScript
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production (HTTPS)
      maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days in milliseconds
    });

    // Send response without including the token in the body
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      role: newUser.role,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      success: false,
      error: "Error creating user. Please try again later.",
    });
  }
};


module.exports = { handleLogin, handleSignup };
