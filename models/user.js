const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  telegramAccount: { type: String },
  balance: { type: Number, default: 0 },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  hasPurchased: { type: Boolean, default: false }, 
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
