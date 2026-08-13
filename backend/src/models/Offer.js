const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originalPrice: Number,
  offeredAmount: Number,
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'countered', 'expired'], default: 'pending' },
  counterAmount: Number,
  history: [{
    amount: Number,
    by: { type: String, enum: ['buyer', 'seller'] },
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Offer', offerSchema);
