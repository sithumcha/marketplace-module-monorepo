const mongoose = require('mongoose');

const businessReviewSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  review: String,
  images: [String],
  ownerReply: {
    text: String,
    repliedAt: Date
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BusinessReview', businessReviewSchema);
