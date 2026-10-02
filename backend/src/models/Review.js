const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  listingId: { type: String, required: true, index: true },
  buyerEmail: { type: String, required: true },
  buyerName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  reviewText: { type: String, required: true },
  isVerifiedBuyer: { type: Boolean, default: true },
  images: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', reviewSchema);
