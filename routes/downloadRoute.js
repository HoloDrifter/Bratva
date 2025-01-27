const express=require('express')
const router=express.Router();
const path = require("path");
const fs = require("fs");
const Product=require('../models/product')


router.get("/:productId", async (req, res) => {
  try {
    const productId = req.params.productId;

    // Find the product in the database
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).send("Product not found.");
    }

    // Construct the file path using the stored fileUrl
    const filePath = path.join(__dirname, "..", product.fileUrl); // Adjust this as needed
    if (!fs.existsSync(filePath)) {
      return res.status(404).send("File not found.");
    }

    // Send the file for download
    res.download(filePath, product.fileUrl.split("/").pop(), (err) => {
      if (err) {
        console.error("Error sending file:", err.message);
        res.status(500).send("Error downloading file.");
      }
    });
  } catch (error) {
    console.error("Error in download route:", error.message);
    res.status(500).send("Server error.");
  }
});


module.exports=router;