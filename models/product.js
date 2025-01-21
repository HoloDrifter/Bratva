const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Société / entreprise
  type: { type: String, enum: ["SAS", "EI"], required: true }, // Forme
  bankAccount: { type: String, required: true }, // Compte bancaire
  incorporationDate: { type: Date, required: true }, // Date d'incorporation
  apeCode: { type: String, required: true }, // Code APE (Code NAF)
  socialCapital: { type: Number, required: true }, // Capital social
  price: { type: Number, required: true }, // Prix
  createdAt: { type: Date, default: Date.now }, // Timestamp for product creation
});

module.exports = mongoose.model("Product", productSchema);
