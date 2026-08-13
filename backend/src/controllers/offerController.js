const Offer = require('../models/Offer');
const Listing = require('../models/Listing');
const Chat = require('../models/Chat');
const Message = require('../models/Message');

const createOffer = async (req, res) => {
  try {
    const { listingId, buyerId, sellerId, offeredAmount, originalPrice } = req.body;
    
    // 1. Create Offer Record
    const offer = await Offer.create({
      listingId,
      buyerId,
      sellerId,
      originalPrice,
      offeredAmount,
      status: 'pending',
      history: [{ amount: offeredAmount, by: 'buyer', timestamp: new Date() }]
    });

    // 2. Find or create Chat between Buyer & Seller for this listing
    let chat = await Chat.findOne({
      listingId,
      participants: { $all: [buyerId, sellerId] }
    });

    if (!chat) {
      chat = await Chat.create({
        listingId,
        participants: [buyerId, sellerId],
        lastMessage: `Submitted offer of $${offeredAmount}`,
        lastMessageAt: new Date()
      });
    }

    // 3. Create Offer message in Chat
    const offerMsg = await Message.create({
      chatId: chat._id,
      senderId: buyerId,
      type: 'offer',
      text: `Made an offer of $${offeredAmount}`,
      offerData: {
        offerId: offer._id,
        amount: offeredAmount,
        status: 'pending'
      }
    });

    return res.status(201).json({ success: true, offer, chatId: chat._id, message: offerMsg });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const respondToOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const { status, counterAmount, actionBy, chatId } = req.body; // status: 'accepted', 'rejected', 'countered'

    const offer = await Offer.findById(offerId);
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });

    offer.status = status;
    if (status === 'countered' && counterAmount) {
      offer.counterAmount = counterAmount;
      offer.history.push({ amount: counterAmount, by: actionBy, timestamp: new Date() });
    } else if (status === 'accepted') {
      // Reserved listing status when accepted
      await Listing.findByIdAndUpdate(offer.listingId, { status: 'reserved' });
    }

    await offer.save();

    // Create system / message update in chat
    if (chatId) {
      let msgText = status === 'accepted' ? `Deal Confirmed! Offer of $${counterAmount || offer.offeredAmount} accepted.` 
                  : status === 'rejected' ? `Offer rejected.` 
                  : `Counter offer sent: $${counterAmount}`;
      
      await Message.create({
        chatId,
        senderId: req.body.userId || (actionBy === 'seller' ? offer.sellerId : offer.buyerId),
        type: 'offer',
        text: msgText,
        offerData: {
          offerId: offer._id,
          amount: counterAmount || offer.offeredAmount,
          status
        }
      });
    }

    return res.json({ success: true, offer });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createOffer, respondToOffer };
