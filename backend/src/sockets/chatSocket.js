module.exports = function (io) {
  io.on('connection', (socket) => {
    console.log(`Socket Connected: ${socket.id}`);

    // User joins active chat room
    socket.on('join_chat', (chatId) => {
      socket.join(chatId);
      console.log(`Socket ${socket.id} joined room ${chatId}`);
    });

    // Real-time message broadcast
    socket.on('send_message', (data) => {
      // data contains: chatId, senderId, text, type, offerData, locationData
      io.to(data.chatId).emit('receive_message', data);
    });

    // Real-time offer status change broadcast
    socket.on('respond_offer', (data) => {
      // data contains: chatId, offerId, status, counterAmount
      io.to(data.chatId).emit('offer_updated', data);
    });

    socket.on('disconnect', () => {
      console.log(`Socket Disconnected: ${socket.id}`);
    });
  });
};
