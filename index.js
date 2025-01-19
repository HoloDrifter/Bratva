require("dotenv").config();
const express = require("express");
const connection = require("./connection");
// const user = require("./routes/user");
const login = require("./routes/login");
const register = require("./routes/register");
const dashboard = require("./routes/dashboard");
const path = require("path");

const app = express();
const api = process.env.API_URL;
const PORT = process.env.PORT;

// connection
connection();

// Middleware
app.set('view engine', "ejs")
app.use(express.urlencoded({ extended: true }));  
app.use(express.static(path.join(__dirname, 'public')));


// Routes
app.use("/login", login);
app.use("/register", register);
app.use('/dashboard', dashboard);

// Listen
app.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
  console.log(`api is running on http://localhost:${PORT}${api}`);
});
