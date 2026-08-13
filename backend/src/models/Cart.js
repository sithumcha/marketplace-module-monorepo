const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  listingId: { type: String, required: true },
  itemTitle: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
  image: { type: String },
});

const CartSchema = new mongoose.Schema({
  userEmail: { type: String, required: true, unique: true },
  items: [CartItemSchema],
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Cart', CartSchema);
