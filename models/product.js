const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Société / entreprise
  description:{type:String, required:true},
  type: { type: String, enum: ["SAS", "EI"], required: true }, // Forme
  apeCode: { type: String, required: true }, // Code APE (Code NAF)
  socialCapital: { type: Number, required: true }, // Capital social
  price: { type: Number, required: true }, // Prix
  stock:{type:Number,required:true},
  fileUrl: { type: String, required: false },
  createdAt: { type: Date, default: Date.now }, // Timestamp for product creation
});




module.exports = mongoose.model("Product", productSchema);
