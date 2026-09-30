const Favorite = require('../models/Favorite');

const getWishlist = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.json({ success: true, favorites: [] });
    }
    const favs = await Favorite.find({ email: email.toLowerCase().trim() });
    const listingIds = favs.map(f => f.listingId);
    return res.json({ success: true, favorites: listingIds });
  } catch (err) {
    console.error('Error fetching wishlist:', err.message);
    return res.status(500).json({ success: false, favorites: [] });
  }
};

const toggleWishlist = async (req, res) => {
  try {
    const { email, listingId } = req.body;
    if (!email || !listingId) {
      return res.status(400).json({ success: false, message: 'email and listingId are required' });
    }
    const cleanEmail = email.toLowerCase().trim();
    const cleanListingId = String(listingId);

    const existing = await Favorite.findOne({ email: cleanEmail, listingId: cleanListingId });
    if (existing) {
      await Favorite.deleteOne({ _id: existing._id });
    } else {
      await Favorite.create({ email: cleanEmail, listingId: cleanListingId });
    }

    const allFavs = await Favorite.find({ email: cleanEmail });
    const listingIds = allFavs.map(f => f.listingId);

    return res.json({ success: true, favorites: listingIds });
  } catch (err) {
    console.error('Error toggling wishlist:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getWishlist,
  toggleWishlist
};
