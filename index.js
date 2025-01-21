require("dotenv").config();
const express = require("express");
const connection = require("./connection");
const authRoute = require("./routes/authRoute");
const route = require("./routes/route");
const path = require("path");
const cors=require('cors');
const cookieParser = require("cookie-parser");

const app = express();
const api = process.env.API_URL;
const PORT = process.env.PORT;




// connection
connection();

// Middleware
app.use(cookieParser());
app.use(cors());
app.use(express.json());  
app.set('view engine', "ejs")
app.use(express.urlencoded({ extended: true }));  
app.use(express.static(path.join(__dirname, 'public')));




// Routes
app.use("/", route);
app.use("/api/auth", authRoute);


// Listen
app.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
  console.log(`api is running on http://localhost:${PORT}${api}`);
});
