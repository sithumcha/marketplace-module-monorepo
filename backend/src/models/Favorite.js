const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  email: { type: String, required: true },
  listingId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

favoriteSchema.index({ email: 1, listingId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
