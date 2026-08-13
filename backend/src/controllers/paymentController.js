const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Listing = require('../models/Listing');
const { recommendPrice, autoTagImages } = require('../services/aiService');
const { verifyBusinessDocument } = require('../services/ocrService');
const { calculateDeliveryFee, getLiveTrackingStatus } = require('../services/courierService');

const createEscrowPayment = async (req, res) => {
  try {
    const { listingId, offerId, buyerId, sellerId, amount, deliveryMethod } = req.body;
    
    // 1. Create Transaction held in Escrow
    const transaction = await Transaction.create({
      listingId,
      offerId,
      buyerId,
      sellerId,
      amount,
      escrowFee: 2.50,
      status: 'held_in_escrow',
      deliveryMethod: deliveryMethod || 'in_person_meetup',
      courierTrackingCode: deliveryMethod === 'courier_doorstep' ? `TRK-EXPRESS-${Math.floor(100000 + Math.random() * 900000)}` : null
    });

    // 2. Lock listing status to reserved
    await Listing.findByIdAndUpdate(listingId, { status: 'reserved' });

    return res.status(201).json({
      success: true,
      message: 'Payment secured in Escrow! Funds will be released to seller upon order completion.',
      transaction
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const releaseEscrowPayment = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });

    transaction.status = 'released_to_seller';
    await transaction.save();

    // Credit seller wallet
    await User.findByIdAndUpdate(transaction.sellerId, {
      $inc: { walletBalance: transaction.amount }
    });

    // Update listing status to sold
    await Listing.findByIdAndUpdate(transaction.listingId, { status: 'sold' });

    return res.json({
      success: true,
      message: 'Escrow released! Seller wallet credited.',
      transaction
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const withdrawWallet = async (req, res) => {
  try {
    const { userId, amount, bankAccount } = req.body;
    const user = await User.findById(userId);
    if (!user || user.walletBalance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
    }

    user.walletBalance -= Number(amount);
    await user.save();

    return res.json({
      success: true,
      message: `Payout of $${amount} initiated to bank account ${bankAccount || '**** 4421'}.`,
      remainingBalance: user.walletBalance
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// AI & Courier Helper Endpoints
const getAiAssist = (req, res) => {
  const { category, condition, imageUrl } = req.query;
  const pricing = recommendPrice(category, condition);
  const tags = autoTagImages(imageUrl, category);
  return res.json({ success: true, pricing, tags });
};

const getDeliveryQuote = (req, res) => {
  const { origin, dest } = req.query;
  const quote = calculateDeliveryFee(origin, dest);
  return res.json({ success: true, quote });
};

const getDeliveryStatus = (req, res) => {
  const { trackingCode } = req.params;
  const tracking = getLiveTrackingStatus(trackingCode);
  return res.json({ success: true, tracking });
};

const runOcrVerify = (req, res) => {
  const { documentUrl, businessName } = req.body;
  const ocrResult = verifyBusinessDocument(documentUrl, businessName);
  return res.json({ success: true, ocrResult });
};

module.exports = {
  createEscrowPayment,
  releaseEscrowPayment,
  withdrawWallet,
  getAiAssist,
  getDeliveryQuote,
  getDeliveryStatus,
  runOcrVerify
};
