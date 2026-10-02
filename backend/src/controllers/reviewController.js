const Review = require('../models/Review');
const Order = require('../models/Order');

const addReview = async (req, res) => {
  try {
    const { listingId, buyerEmail, buyerName, rating, reviewText, images } = req.body;

    if (!listingId || !rating || !reviewText) {
      return res.status(400).json({ success: false, message: 'listingId, rating, and reviewText are required.' });
    }

    // Check if customer is a verified buyer
    const previousOrder = await Order.findOne({
      buyerEmail: { $regex: new RegExp(buyerEmail || '', 'i') }
    });

    const isVerified = !!previousOrder;

    const review = await Review.create({
      listingId,
      buyerEmail: buyerEmail || 'customer@marketplace.lk',
      buyerName: buyerName || 'Verified Buyer',
      rating: Number(rating),
      reviewText,
      images: images || [],
      isVerifiedBuyer: isVerified
    });

    console.log(`⭐ New Review Added for listing ${listingId}: ${rating} stars by ${buyerName}`);
    return res.status(201).json({ success: true, review });
  } catch (err) {
    console.error('Error adding review:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getListingReviews = async (req, res) => {
  try {
    const { listingId } = req.params;
    const reviews = await Review.find({ listingId }).sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : 5.0;

    return res.json({
      success: true,
      reviews,
      stats: {
        totalReviews,
        avgRating: Number(avgRating)
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, reviews: [], stats: { totalReviews: 0, avgRating: 5.0 } });
  }
};

module.exports = {
  addReview,
  getListingReviews
};
