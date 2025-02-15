const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  invoiceId: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "Created",
    enum: ["Created", "Processing", "Paid", "Settled", "Expired", "Failed"],
  },
  checkOutLink:{
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["deposit", "purchase"],
    default: "deposit",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes
transactionSchema.index({ userId: 1, status: 1 });
transactionSchema.index({ invoiceId: 1 });

module.exports = mongoose.model("Transaction", transactionSchema);
