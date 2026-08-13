const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startingPrice: { type: Number, required: true },
  currentHighestBid: { type: Number, required: true },
  highestBidderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  bidHistory: [{
    bidderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bidderName: String,
    amount: Number,
    timestamp: { type: Date, default: Date.now }
  }],
  status: { type: String, enum: ['active', 'ended', 'reserved'], default: 'active' },
  endsAt: { type: Date, required: true }, // e.g. 24 hours from creation
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Auction', auctionSchema);
