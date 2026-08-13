const Auction = require('../models/Auction');
const Listing = require('../models/Listing');

const createAuction = async (req, res) => {
  try {
    const { listingId, sellerId, startingPrice, durationHours = 24 } = req.body;
    const endsAt = new Date(Date.now() + durationHours * 60 * 60 * 1000);

    const auction = await Auction.create({
      listingId,
      sellerId,
      startingPrice,
      currentHighestBid: startingPrice,
      endsAt
    });

    return res.status(201).json({ success: true, auction });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const placeBid = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const { bidderId, bidderName, bidAmount } = req.body;

    const auction = await Auction.findById(auctionId);
    if (!auction) return res.status(404).json({ success: false, message: 'Auction not found' });

    if (bidAmount <= auction.currentHighestBid) {
      return res.status(400).json({ success: false, message: `Bid must be higher than current highest bid of $${auction.currentHighestBid}` });
    }

    auction.currentHighestBid = bidAmount;
    auction.highestBidderId = bidderId;
    auction.bidHistory.push({ bidderId, bidderName, amount: bidAmount, timestamp: new Date() });
    await auction.save();

    return res.json({ success: true, message: `Bid of $${bidAmount} placed successfully!`, auction });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getAuctionDetails = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.auctionId).populate('listingId').populate('sellerId', 'name avatar');
    if (!auction) return res.status(404).json({ success: false, message: 'Auction not found' });
    return res.json({ success: true, auction });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createAuction, placeBid, getAuctionDetails };
