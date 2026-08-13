const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  itemTitle: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
  image: { type: String },
  status: { type: String, enum: ['Processing', 'Dispatched', 'Delivered', 'Cancelled'], default: 'Processing' },
  buyerName: { type: String, default: 'Sithum Nethsara' },
  buyerEmail: { type: String, default: 'sithum@marketplace.lk' },
  shippingAddress: { type: String },
  paymentMethod: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
