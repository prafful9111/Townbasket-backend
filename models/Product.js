// models/Product.js
const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String, required: true },
  category:    { type: String, required: true },
  price:       { type: Number, required: true },
  sku:         { type: String },
  quantity:    { type: Number, default: 0 },
  images:      [String],
  onSale:      { type: Boolean, default: false },
  featured:    { type: Boolean, default: false },
  sellerId:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

module.exports = mongoose.model("Product", ProductSchema);
