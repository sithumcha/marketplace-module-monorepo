const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  icon: String, // Lucide icon name or image URL
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  isBusinessCategory: { type: Boolean, default: false } // true for business directory categories
});

module.exports = mongoose.model('Category', categorySchema);
