const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chatId: { type: String, required: true },
  senderId: { type: String, required: true },
  targetUserId: { type: String },
  userEmail: { type: String },
  sender: { type: String },
  senderName: { type: String },
  isAdmin: { type: Boolean, default: false },
  type: { type: String, enum: ['text', 'image', 'offer', 'location'], default: 'text' },
  text: String,
  imageUrl: String,
  offerData: {
    offerId: String,
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
