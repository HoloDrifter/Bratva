const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  totalAmount: { type: Number, required: true }, // Total price of the product
  status: { type: String, default:"Paid" }, // Total price of the product
  createdAt: { type: Date, default: Date.now }, // Date when the order was created
});

module.exports = mongoose.model("Order", orderSchema);
