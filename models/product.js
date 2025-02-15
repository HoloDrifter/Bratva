const mongoose = require("mongoose");
const bankSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  bankFile: { type: String }, // file path for the bank's digital file
  purchased: { type: Boolean, default: false },
  purchasedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
});


const productSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Société / entreprise
  description:{type:String, required:true},
  type: { type: String, enum: ["SAS", "EI", "LTD"], required: true }, // Forme
  apeCode: { type: String, required: true }, // Code APE (Code NAF)
  socialCapital: { type: Number, required: true }, // Capital social
  fileUrl: { type: String, required: false },
  dateImmatriculation: { type: Date, required: true },
  banks: [bankSchema],
  createdAt: { type: Date, default: Date.now }, // Timestamp for product creation
});




module.exports = mongoose.model("Product", productSchema);
