const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  icon: { type: String, default: 'Tag' },
  isBusinessCategory: { type: Boolean, default: false },
  itemCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Category', categorySchema);
