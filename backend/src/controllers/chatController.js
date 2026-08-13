const Chat = require('../models/Chat');
const Message = require('../models/Message');

const getChatsForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const chats = await Chat.find({ participants: userId })
      .populate('participants', 'name avatar role rating')
      .populate('listingId', 'title images price status')
      .sort({ updatedAt: -1 });
    return res.json({ success: true, chats });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chatId }).populate('senderId', 'name avatar').sort({ createdAt: 1 });
    return res.json({ success: true, messages });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { chatId, senderId, type, text, imageUrl, offerData, locationData } = req.body;
    const message = await Message.create({ chatId, senderId, type, text, imageUrl, offerData, locationData });
    
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: text || (type === 'offer' ? `Offer: $${offerData?.amount}` : `${type} message`),
      lastMessageAt: new Date()
    });
    
    return res.status(201).json({ success: true, message });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getChatsForUser, getChatMessages, sendMessage };
