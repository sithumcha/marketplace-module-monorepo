const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  title: { type: String, required: true },
  tag: { type: String, default: 'LIMITED OFFER' },
  subtitle: { type: String, default: 'Discount offer available now!' },
  discountAmount: { type: Number, required: true },
  discountType: { type: String, enum: ['FLAT', 'PERCENT'], default: 'FLAT' },
  minOrderAmount: { type: Number, default: 0 },
  gradient: { type: String, default: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PromoCode', promoCodeSchema);
