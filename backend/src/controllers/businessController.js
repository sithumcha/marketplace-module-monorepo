const Business = require('../models/Business');
const BusinessReview = require('../models/BusinessReview');

const getBusinesses = async (req, res) => {
  try {
    const { category, isVerified } = req.query;
    let filter = {};
    if (category) filter.category = category;
    if (isVerified !== undefined) filter.isVerified = isVerified === 'true';
    
    const businesses = await Business.find(filter).populate('ownerId', 'name email avatar');
    return res.json({ success: true, count: businesses.length, businesses });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getBusinessById = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id).populate('ownerId', 'name email phone avatar');
    if (!business) return res.status(404).json({ success: false, message: 'Business not found' });
    const reviews = await BusinessReview.find({ businessId: req.params.id }).populate('userId', 'name avatar');
    return res.json({ success: true, business, reviews });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const registerBusiness = async (req, res) => {
  try {
    const business = await Business.create(req.body);
    return res.status(201).json({ success: true, business });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const addReview = async (req, res) => {
  try {
    const review = await BusinessReview.create(req.body);
    // Recalculate rating
    const allReviews = await BusinessReview.find({ businessId: req.body.businessId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Business.findByIdAndUpdate(req.body.businessId, {
      rating: parseFloat(avgRating.toFixed(1)),
      reviewCount: allReviews.length
    });
    return res.status(201).json({ success: true, review });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getBusinesses, getBusinessById, registerBusiness, addReview };
