const User = require("../models/user");
const bcrypt = require("bcrypt"); 



// Login
const handleLogin = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    let error = "Field is Empty";

    if (!username) {
      error = "Username is Empty";
    } else if (!password) {
      error = "Password is Empty";
    }

    return res.status(400).render("register", { error, formData: req.body });
  }

  const user = await User.findOne({ username });

  if (!user) {
    return res
      .status(404)
      .render("login", { error: "User not found", formData: req.body });
  }
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res
      .status(400)
      .render("login", { error: "Invalid credentials", formData: req.body });
  }

  return res.redirect("/dashboard");

  res.send("User created");
};

//   Signup

const handleSignup = async (req, res) => {
  const { username, password, confirmPassword, telegram } = req.body;

  console.log(req.body);

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

    return res.status(400).render("register", { error, formData: req.body });
  }

  const existingUser = await User.findOne({ username });

  if (existingUser) {
    console.log("User already exists");
    return res.status(400).render("register", {
      error: "User already exists",
      formData: req.body,
    });
  }

  if (username.length < 4 || username.length > 15) {
    console.log("Username must be 4-10 characters long");
    return res.status(400).render("register", {
      error: "Username must be 4-10 characters long",
      formData: req.body,
    });
  }

  if (password.length < 8 || password.length > 20) {
    console.log("Password must be 8-20 characters long");
    return res.status(400).render("register", {
      error: "Password must be 8-20 characters long",
      formData: req.body,
    });
  }

  if (password !== confirmPassword) {
    console.log("Password does not match");
    return res.status(400).render("register", {
      error: "Password does not match",
      formData: req.body,
    });
  }

  // Hashing the password
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
      telegram,
    });

    // Save the user
    await newUser.save();

    // Redirect to dashboard
    res.redirect("/dashboard");
  } catch (error) {
    console.error("Error creating user:", error);
    res.render("register", {
      error: "Error creating user",
      formData: req.body,
    });
  }
};

module.exports = { handleLogin, handleSignup };
