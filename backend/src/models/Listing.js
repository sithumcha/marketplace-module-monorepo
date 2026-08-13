const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  title: { type: String, required: true },
  description: String,
  category: { type: String, required: true }, // electronics, fashion, groceries, furniture
  subCategory: String,
  images: [String], // Cloudinary URLs, first = cover image
  price: { type: Number, required: true },
  isNegotiable: { type: Boolean, default: true },
  condition: { type: String, enum: ['new', 'like_new', 'good', 'fair', 'used'], default: 'good' },
  location: {
    address: String,
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number] // [lng, lat]
  },
  status: { type: String, enum: ['active', 'sold', 'reserved', 'expired', 'removed', 'flagged', 'sold_out', 'draft'], default: 'active' },
  stockQuantity: { type: Number, default: 1 },
  isStoreItem: { type: Boolean, default: true },
  storeBadge: { type: String, default: 'Official Store' },
  views: { type: Number, default: 0 },
  favoriteCount: { type: Number, default: 0 },
  tags: [String], // for search
  createdAt: { type: Date, default: Date.now },
  expiresAt: Date // auto-expire after 30 days
});

listingSchema.index({ location: '2dsphere' });
listingSchema.index({ title: 'text', description: 'text', tags: 'text' }); // full-text search

module.exports = mongoose.model('Listing', listingSchema);
