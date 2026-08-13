const Listing = require('../models/Listing');

const searchListings = async (params) => {
  const { keyword, category, minPrice, maxPrice, lat, lng, radiusKm, condition, status = 'active' } = params;
  
  let query = { status };
  
  if (keyword) {
    query.$or = [
      { title: { $regex: keyword, $options: 'i' } },
      { description: { $regex: keyword, $options: 'i' } },
      { tags: { $in: [new RegExp(keyword, 'i')] } }
    ];
  }
  
  if (category && category !== 'All') {
    query.category = category.toLowerCase();
  }
  
  if (condition) {
    query.condition = condition;
  }
  
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  
  if (lat && lng) {
    query.location = {
      $near: {
        $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
        $maxDistance: (Number(radiusKm) || 10) * 1000
      }
    };
  }
  
  return await Listing.find(query).populate('sellerId', 'name avatar rating isVerified').sort({ createdAt: -1 }).limit(30);
};

module.exports = { searchListings };
