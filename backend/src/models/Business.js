const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  businessName: { type: String, required: true },
  category: String, // restaurant, salon, repair shop, etc.
  description: String,
  logo: String,
  coverImages: [String],
  location: {
    address: String,
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number] // [lng, lat]
  },
  contactPhone: String,
  contactEmail: String,
  openingHours: [{
    day: String,
    open: String,
    close: String
  }],
  isVerified: { type: Boolean, default: false },
  verificationDocs: [String],
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

businessSchema.index({ location: '2dsphere' });
businessSchema.index({ businessName: 'text', description: 'text' });

module.exports = mongoose.model('Business', businessSchema);
