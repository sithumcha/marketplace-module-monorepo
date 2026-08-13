const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // [buyer, seller]
  lastMessage: String,
  lastMessageAt: Date,
  unreadCount: {
    type: Map,
    of: Number // { userId: count }
  }
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);
