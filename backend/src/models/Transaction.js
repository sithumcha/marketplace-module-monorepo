const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  offerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer' },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  escrowFee: { type: Number, default: 2.50 }, // Platform Escrow Protection Fee
  status: {
    type: String,
    enum: ['pending_deposit', 'held_in_escrow', 'released_to_seller', 'refunded_to_buyer'],
    default: 'held_in_escrow'
  },
  deliveryMethod: { type: String, enum: ['in_person_meetup', 'courier_doorstep'], default: 'in_person_meetup' },
  courierTrackingCode: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
