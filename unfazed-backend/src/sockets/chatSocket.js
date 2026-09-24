// In-memory message store for chat demo persistence
const chatHistory = new Map();

const initChatSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Join room for a session or client-therapist pair
    socket.on('join_room', ({ roomId, senderName, role }) => {
      socket.join(roomId);
      console.log(`[Socket.io] ${senderName} (${role}) joined room: ${roomId}`);

      // Send existing history for this room
      const history = chatHistory.get(roomId) || [];
      socket.emit('load_history', history);

      socket.to(roomId).emit('user_joined', {
        senderName,
        role,
        timestamp: new Date()
      });
    });

    // Handle incoming chat message
    socket.on('send_message', ({ roomId, senderId, senderName, senderRole, text, attachmentUrl }) => {
      const message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        roomId,
        senderId,
        senderName,
        senderRole, // 'therapist' or 'client'
        text,
        attachmentUrl: attachmentUrl || null,
        timestamp: new Date(),
        status: 'delivered'
      };

      if (!chatHistory.has(roomId)) {
        chatHistory.set(roomId, []);
      }
      chatHistory.get(roomId).push(message);

      // Keep recent 100 messages per room
      if (chatHistory.get(roomId).length > 100) {
        chatHistory.get(roomId).shift();
      }

      // Broadcast to everyone in the room (including sender)
      io.to(roomId).emit('receive_message', message);
    });

    // Typing indicators
    socket.on('typing', ({ roomId, senderName, isTyping }) => {
      socket.to(roomId).emit('user_typing', { senderName, isTyping });
    });

    // Message read receipts
    socket.on('mark_read', ({ roomId, messageId }) => {
      socket.to(roomId).emit('message_read', { messageId, readAt: new Date() });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = initChatSocket;
