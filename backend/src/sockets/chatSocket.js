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
      console.log(`Socket ${socket.id} joined admin_room`);
    });

    // Real-time message broadcast handler
    socket.on('send_message', async (data) => {
      const chatId = data.chatId || 'support_chat';
      const senderId = data.senderId || data.userId || 'user_demo';
      const sender = data.sender || (data.isAdmin ? 'Admin Support' : 'You');
      const text = data.text || '';
      const type = data.type || 'text';
      const offerData = data.offerData || null;

      const messagePayload = {
        id: data.id || Date.now(),
        chatId,
        senderId,
        sender,
        text,
        type,
        offerData,
        isAdmin: data.isAdmin || false,
        time: data.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date()
      };

      console.log(`💬 [Socket] Message from ${sender} (${senderId}): "${text}"`);

      // 1. Broadcast to specific chat room & user room
      io.to(chatId).to(`chat_${chatId}`).to(`user_${senderId}`).emit('receive_message', messagePayload);
      io.to(chatId).to(`chat_${chatId}`).to(`user_${senderId}`).emit('chat_message', messagePayload);

      // 2. Broadcast to Admin Moderation Room
      io.to('admin_room').emit('receive_message', messagePayload);
      io.to('admin_room').emit('chat_message', messagePayload);
      io.to('admin_room').emit('admin_new_message', messagePayload);

      // 3. Global socket broadcast fallback (Guarantees Admin & Users get the message even if room joining failed)
      io.emit('receive_message', messagePayload);
      io.emit('chat_message', messagePayload);

      // Save message in database asynchronously
      try {
        if (Message && Message.create) {
          await Message.create({
            chatId: String(chatId),
            senderId: String(senderId),
            sender: String(sender),
            isAdmin: Boolean(data.isAdmin),
            type,
            text,
            offerData
          });
          console.log(`✅ Chat message saved to MongoDB for chatId: ${chatId}`);
        }
      } catch (err) {
        console.warn('DB message save skipped:', err.message);
      }
    });

    // Handle direct chat_message event
    socket.on('chat_message', (data) => {
      const payload = typeof data === 'string' ? { text: data, sender: 'User', id: Date.now() } : data;
      io.emit('chat_message', payload);
      io.emit('receive_message', payload);
      io.to('admin_room').emit('admin_new_message', payload);
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
