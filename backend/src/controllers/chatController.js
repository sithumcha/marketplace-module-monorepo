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
    const messages = await Message.find({ chatId }).sort({ createdAt: 1 });
    return res.json({ success: true, messages });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getUserSupportMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const { email, id } = req.query;

    const identifiers = new Set();
    if (userId) identifiers.add(String(userId));
    if (email) identifiers.add(String(email));
    if (id) identifiers.add(String(id));

    const idList = Array.from(identifiers);

    const messages = await Message.find({
      $or: [
        { senderId: { $in: idList } },
        { targetUserId: { $in: idList } },
        { userEmail: { $in: idList } }
      ]
    }).sort({ createdAt: 1 });

    return res.json({ success: true, messages });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { 
      chatId = 'support_chat', 
      senderId, 
      senderName, 
      sender, 
      userEmail, 
      targetUserId,
      type = 'text', 
      text, 
      imageUrl, 
      offerData, 
      locationData,
      isAdmin = false
    } = req.body;

    if (!senderId && !userEmail) {
      return res.status(400).json({ success: false, message: 'senderId or userEmail is required' });
    }

    const nameToSave = isAdmin ? 'Admin Support' : (senderName || sender || 'Marketplace User');

    let resolvedEmail = userEmail ? String(userEmail) : null;
    let resolvedTargetId = targetUserId ? String(targetUserId) : null;

    if (isAdmin) {
      if (!resolvedEmail && resolvedTargetId && resolvedTargetId.includes('@')) {
        resolvedEmail = resolvedTargetId;
      }
      if (!resolvedTargetId && resolvedEmail) {
        resolvedTargetId = resolvedEmail;
      }
    }

    const textToSave = text || '';
    const sId = String(senderId || userEmail);

    const checkConditions = [{ senderId: sId }];
    if (userEmail) checkConditions.push({ userEmail: String(userEmail) });

    const recentDuplicate = await Message.findOne({
      $or: checkConditions,
      text: textToSave,
      createdAt: { $gte: new Date(Date.now() - 5000) }
    });

    if (recentDuplicate) {
      return res.status(200).json({ success: true, message: recentDuplicate });
    }

    const createdMsg = await Message.create({
      chatId: String(chatId),
      senderId: sId,
      targetUserId: resolvedTargetId,
      userEmail: resolvedEmail,
      sender: nameToSave,
      senderName: nameToSave,
      isAdmin: Boolean(isAdmin),
      type,
      text: textToSave,
      imageUrl,
      offerData,
      locationData
    });
    
    return res.status(201).json({ success: true, message: createdMsg });
  } catch (err) {
    console.error('Error saving chat message:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getAllSupportMessages = async (req, res) => {
  try {
    const messages = await Message.find({}).sort({ createdAt: 1 });
    return res.json({ success: true, messages });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const deleteThread = async (req, res) => {
  try {
    const { threadId } = req.params;
    const { email } = req.query;

    const queryConditions = [
      { senderId: threadId },
      { targetUserId: threadId },
      { userEmail: threadId }
    ];

    if (email) {
      queryConditions.push({ userEmail: email }, { senderId: email }, { targetUserId: email });
    }

    const result = await Message.deleteMany({ $or: queryConditions });
    return res.json({ success: true, deletedCount: result.deletedCount, message: 'Chat thread deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const deleteSingleMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    await Message.findByIdAndDelete(messageId);
    return res.json({ success: true, message: 'Single message deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { 
  getChatsForUser, 
  getChatMessages, 
  getUserSupportMessages,
  sendMessage, 
  getAllSupportMessages,
  deleteThread,
  deleteSingleMessage
};
