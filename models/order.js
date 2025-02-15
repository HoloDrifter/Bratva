const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  selectedBanks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product.banks" }], // ✅ Ensure this exists
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ["Paid", "Pending"], default: "Paid" },
  createdAt: { type: Date, default: Date.now },
});





module.exports = mongoose.model("Order", orderSchema);
