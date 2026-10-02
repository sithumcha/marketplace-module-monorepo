const Chat = require('../models/Chat');
const Message = require('../models/Message');

module.exports = function (io) {
  io.on('connection', (socket) => {
    console.log(`Socket Connected: ${socket.id}`);

    // Join room by chatId
    socket.on('join_chat', (chatId) => {
      const cId = chatId || 'support_chat';
      socket.join(cId);
      socket.join(`chat_${cId}`);
      console.log(`Socket ${socket.id} joined chat room: ${cId}`);
    });

    // Join room by userId (syncs across multiple devices/tabs for same user)
    socket.on('join_user', (userId) => {
      const uId = userId || 'user_demo';
      socket.join(`user_${uId}`);
      console.log(`Socket ${socket.id} joined user room: user_${uId}`);
    });

    // Join admin room for real-time moderation and customer support
    socket.on('join_admin', () => {
      socket.join('admin_room');
      socket.join('support_chat');
      console.log(`Socket ${socket.id} joined admin_room & support_chat`);
    });

    // Real-time message broadcast handler
    socket.on('send_message', async (data) => {
      const chatId = data.chatId || 'support_chat';
      const senderId = data.senderId || data.userId || data.userEmail || 'user_guest';
      const targetUserId = data.targetUserId || data.recipientId;
      const userEmail = data.userEmail || '';
      
      // Extract user's display name, ensuring it is passed to admin accurately
      let senderName = data.senderName || data.userName || data.sender;
      if (!senderName || senderName === 'You' || senderName === 'Customer User') {
        senderName = (data.sender && data.sender !== 'You' && data.sender !== 'Customer User') ? data.sender : 'Customer User';
      }
      const sender = data.isAdmin ? 'Admin Support' : senderName;
      const text = data.text || '';
      const type = data.type || 'text';
      const offerData = data.offerData || null;

      const messagePayload = {
        id: data.id || Date.now(),
        chatId,
        senderId,
        targetUserId,
        userEmail,
        sender,
        senderName: sender,
        userName: sender,
        device: data.device || 'Web Client',
        text,
        type,
        offerData,
        isAdmin: data.isAdmin || false,
        time: data.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date()
      };

      console.log(`💬 [Socket] Message from ${sender} (${senderId}): "${text}"`);

      // Broadcast to Admin and User rooms cleanly ONCE
      io.to('admin_room').to(chatId).to(`chat_${chatId}`).to(`user_${senderId}`).emit('receive_message', messagePayload);

      // Save message in database asynchronously if not duplicate
      try {
        if (Message && Message.create) {
          const textToSave = text || '';
          const sId = String(senderId);

          const searchConditions = [{ senderId: sId }];
          if (userEmail) searchConditions.push({ userEmail: String(userEmail) });

          const recentDuplicate = await Message.findOne({
            $or: searchConditions,
            text: textToSave,
            createdAt: { $gte: new Date(Date.now() - 5000) }
          });

          if (!recentDuplicate) {
            await Message.create({
              chatId: String(chatId),
              senderId: sId,
              targetUserId: targetUserId ? String(targetUserId) : null,
              userEmail: userEmail ? String(userEmail) : null,
              sender: String(sender),
              senderName: String(sender),
              isAdmin: Boolean(data.isAdmin),
              type,
              text: textToSave,
              offerData
            });
            console.log(`✅ Chat message saved to MongoDB for chatId: ${chatId} with sender: ${sender}`);
          } else {
            console.log(`ℹ️ Skipped duplicate DB save for socket message from: ${sender}`);
          }
        }
      } catch (err) {
        console.warn('DB message save skipped:', err.message);
      }
    });

    // Handle direct chat_message event
    socket.on('chat_message', (data) => {
      const payload = typeof data === 'string' ? { text: data, sender: 'User', id: Date.now() } : data;
      io.emit('receive_message', payload);
    });

    // Real-time offer response
    socket.on('respond_offer', (data) => {
      io.to(data.chatId || 'support_chat').emit('offer_updated', data);
      io.to('admin_room').emit('offer_updated', data);
    });

    socket.on('disconnect', () => {
      console.log(`Socket Disconnected: ${socket.id}`);
    });
  });
};
