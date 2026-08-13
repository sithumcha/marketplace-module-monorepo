const Listing = require('../models/Listing');
const { searchListings } = require('../services/searchService');

const getListings = async (req, res) => {
  try {
    const listings = await searchListings(req.query);
    return res.json({ success: true, count: listings.length, listings });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('sellerId', 'name avatar rating phone isVerified');
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    
    // Increment view count
    listing.views += 1;
    await listing.save();
    
    return res.json({ success: true, listing });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const createListing = async (req, res) => {
  try {
    const listing = await Listing.create(req.body);
    return res.status(201).json({ success: true, listing });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateListingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const listing = await Listing.findByIdAndUpdate(req.params.id, { status }, { new: true });
    return res.json({ success: true, listing });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateListingStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stockQuantity, quantity, title } = req.body;

    let listing;
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(id)) {
      listing = await Listing.findById(id);
    }
    if (!listing && title) {
      listing = await Listing.findOne({ title: { $regex: new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') } });
    }
    if (!listing) {
      listing = await Listing.findOne();
    }

    if (listing) {
      const reduceBy = Number(quantity) || 1;
      const targetStock = (stockQuantity !== undefined) ? Number(stockQuantity) : (listing.stockQuantity - reduceBy);
      const newStock = Math.max(0, targetStock);
      listing.stockQuantity = newStock;
      if (newStock === 0) listing.status = 'sold';
      await listing.save();
      console.log(`📉 Decreased Stock for "${listing.title}" (ID: ${listing._id}): ${newStock} units left in MongoDB`);
      return res.json({ success: true, listing });
    }

    return res.status(404).json({ success: false, message: 'Listing not found' });
  } catch (err) {
    console.error('❌ Error updating stock in MongoDB:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getListings, getListingById, createListing, updateListingStatus, updateListingStock };
