const PromoCode = require('../models/PromoCode');

// Default initial promo codes if MongoDB collection is empty
const defaultPromosList = [
  {
    code: 'TECH40',
    title: 'MEGA SALE - UP TO 40% OFF',
    tag: 'LIMITED TIME OFFER',
    subtitle: 'Discount on Electronics & Gadgets this week!',
    discountAmount: 500,
    discountType: 'FLAT',
    gradient: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)',
    isActive: true
  },
  {
    code: 'FREESHIP',
    title: 'FREE SHIPPING ON ORDERS',
    tag: 'EXPRESS DELIVERY',
    subtitle: 'Fast 2-day courier delivery guaranteed islandwide',
    discountAmount: 500,
    discountType: 'FLAT',
    gradient: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #3b82f6 100%)',
    isActive: true
  },
  {
    code: 'STORE2026',
    title: 'PROMO DISCOUNT 2026',
    tag: 'STORE SPOTLIGHT',
    subtitle: 'Verified items from official sellers added daily',
    discountAmount: 1000,
    discountType: 'FLAT',
    gradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #ef4444 100%)',
    isActive: true
  }
];

// Helper to seed default promos into MongoDB if collection is empty
const ensureDefaultPromosSeeded = async () => {
  try {
    const count = await PromoCode.countDocuments();
    if (count === 0) {
      await PromoCode.insertMany(defaultPromosList);
      console.log('🌱 Default Promo Codes seeded into MongoDB.');
    }
  } catch (err) {
    console.error('Error seeding default promos:', err.message);
  }
};

// Get all promo codes
const getPromoCodes = async (req, res) => {
  try {
    await ensureDefaultPromosSeeded();
    const codes = await PromoCode.find().sort({ createdAt: -1 });
    return res.json({ success: true, promos: codes });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, promos: defaultPromosList });
  }
};

// Create new promo code (Admin action)
const createPromoCode = async (req, res) => {
  try {
    const { code, title, tag, subtitle, discountAmount, discountType, gradient } = req.body;
    if (!code || !title || discountAmount === undefined) {
      return res.status(400).json({ success: false, message: 'Code, title, and discountAmount are required' });
    }
    const cleanCode = String(code).trim().toUpperCase();
    
    let promo = await PromoCode.findOne({ code: cleanCode });
    if (promo) {
      promo.title = title || promo.title;
      promo.tag = tag || promo.tag;
      promo.subtitle = subtitle || promo.subtitle;
      promo.discountAmount = Number(discountAmount);
      if (gradient) promo.gradient = gradient;
      await promo.save();
    } else {
      promo = await PromoCode.create({
        code: cleanCode,
        title,
        tag: tag || 'PROMO OFFER',
        subtitle: subtitle || 'Special discount offer',
        discountAmount: Number(discountAmount) || 500,
        discountType: discountType || 'FLAT',
        gradient: gradient || 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)',
        isActive: true
      });
    }

    console.log('✅ Promo Code Created/Saved in MongoDB:', promo.code);
    return res.status(201).json({ success: true, promo });
  } catch (err) {
    console.error('❌ Error creating promo code:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Delete promo code (Admin action)
const deletePromoCode = async (req, res) => {
  try {
    const { id } = req.params;
    const mongoose = require('mongoose');
    let deleted;
    if (mongoose.Types.ObjectId.isValid(id)) {
      deleted = await PromoCode.findByIdAndDelete(id);
    }
    if (!deleted) {
      deleted = await PromoCode.findOneAndDelete({ code: String(id).trim().toUpperCase() });
    }
    return res.json({ success: true, message: 'Promo code deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Toggle active status (Admin action)
const togglePromoStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const mongoose = require('mongoose');
    let promo;
    if (mongoose.Types.ObjectId.isValid(id)) {
      promo = await PromoCode.findById(id);
    }
    if (!promo) {
      promo = await PromoCode.findOne({ code: String(id).trim().toUpperCase() });
    }

    if (!promo) {
      // Upsert default promo if toggled
      const cleanCode = String(id).trim().toUpperCase();
      const matched = defaultPromosList.find(p => p.code === cleanCode);
      promo = await PromoCode.create({
        code: cleanCode,
        title: matched?.title || cleanCode,
        tag: matched?.tag || 'PROMO OFFER',
        subtitle: matched?.subtitle || 'Special offer',
        discountAmount: matched?.discountAmount || 500,
        gradient: matched?.gradient || 'linear-gradient(135deg, #4f46e5, #ec4899)',
        isActive: false
      });
    } else {
      promo.isActive = !promo.isActive;
      await promo.save();
    }

    return res.json({ success: true, promo });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Edit / Update promo code (Admin action)
const updatePromoCode = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, title, tag, subtitle, discountAmount, discountType, gradient, isActive } = req.body;
    
    const mongoose = require('mongoose');
    let promo;
    if (mongoose.Types.ObjectId.isValid(id)) {
      promo = await PromoCode.findById(id);
    }
    if (!promo) {
      promo = await PromoCode.findOne({ code: String(id).trim().toUpperCase() });
    }

    const cleanCode = code ? String(code).trim().toUpperCase() : String(id).trim().toUpperCase();

    if (!promo) {
      // Automatic Upsert if promo code wasn't stored in MongoDB yet
      promo = new PromoCode({
        code: cleanCode,
        title: title || cleanCode,
        tag: tag || 'PROMO CODE',
        subtitle: subtitle || 'Special discount offer!',
        discountAmount: discountAmount !== undefined ? Number(discountAmount) : 500,
        discountType: discountType || 'FLAT',
        gradient: gradient || 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)',
        isActive: isActive !== undefined ? isActive : true
      });
    } else {
      if (code) promo.code = cleanCode;
      if (title) promo.title = title;
      if (tag) promo.tag = tag;
      if (subtitle !== undefined) promo.subtitle = subtitle;
      if (discountAmount !== undefined) promo.discountAmount = Number(discountAmount);
      if (discountType) promo.discountType = discountType;
      if (gradient) promo.gradient = gradient;
      if (isActive !== undefined) promo.isActive = isActive;
    }

    await promo.save();
    console.log(`✏️ Promo Code Saved/Updated in MongoDB: ${promo.code}`);
    return res.json({ success: true, promo });
  } catch (err) {
    console.error('❌ Error updating promo code:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getPromoCodes, createPromoCode, deletePromoCode, togglePromoStatus, updatePromoCode };
