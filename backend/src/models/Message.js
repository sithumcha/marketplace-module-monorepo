const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['text', 'image', 'offer', 'location'], default: 'text' },
  text: String,
  imageUrl: String,
  offerData: {
    offerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer' },
    amount: Number,
    status: { type: String, enum: ['pending', 'accepted', 'rejected', 'countered'] }
  },
  locationData: {
    lat: Number,
    lng: Number,
    address: String
  },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
