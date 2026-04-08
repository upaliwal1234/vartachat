const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Session = require('../models/Session');

// Track waiting users and active rooms
const waitingQueue = [];
const activeRooms = new Map(); // roomId -> { user1socketId, user2socketId }
const socketToUser = new Map(); // socketId -> { userId, isGuest, name, roomId }

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('New connection:', socket.id);

    // Authenticate socket
    socket.on('authenticate', async (data) => {
      const { token, guestId, guestName } = data;

      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          socketToUser.set(socket.id, {
            userId: decoded.id,
            isGuest: false,
            name: 'User',
            roomId: null,
          });
          socket.emit('authenticated', { success: true });
        } catch (err) {
          socket.emit('authenticated', { success: false, error: 'Invalid token' });
        }
      } else if (guestId) {
        socketToUser.set(socket.id, {
          userId: guestId,
          isGuest: true,
          name: guestName || `Guest_${guestId.slice(0, 6)}`,
          roomId: null,
        });
        socket.emit('authenticated', { success: true, isGuest: true });
      }
    });

    // Find a chat partner
    socket.on('find_partner', () => {
      const userInfo = socketToUser.get(socket.id);
      if (!userInfo) return;

      // Remove from queue if already there
      const queueIndex = waitingQueue.indexOf(socket.id);
      if (queueIndex !== -1) waitingQueue.splice(queueIndex, 1);

      // Leave current room if in one
      if (userInfo.roomId) {
        leaveRoom(socket, io, userInfo.roomId);
      }

      // Try to match with someone in queue
      if (waitingQueue.length > 0) {
        const partnerSocketId = waitingQueue.shift();
        const partnerSocket = io.sockets.sockets.get(partnerSocketId);
        const partnerInfo = socketToUser.get(partnerSocketId);

        if (!partnerSocket || !partnerInfo) {
          waitingQueue.push(socket.id);
          socket.emit('waiting');
          return;
        }

        const roomId = uuidv4();
        userInfo.roomId = roomId;
        partnerInfo.roomId = roomId;

        socket.join(roomId);
        partnerSocket.join(roomId);

        activeRooms.set(roomId, {
          user1: socket.id,
          user2: partnerSocketId,
        });

        // Notify both users
        socket.emit('partner_found', { roomId, isStranger: true });
        partnerSocket.emit('partner_found', { roomId, isStranger: true });

        io.to(roomId).emit('system_message', {
          content: 'Stranger connected. Say hi!',
          type: 'system',
          timestamp: new Date().toISOString(),
        });
      } else {
        waitingQueue.push(socket.id);
        socket.emit('waiting');
      }
    });

    // Send a message
    socket.on('send_message', async (data) => {
      const { content, type = 'text' } = data;
      const userInfo = socketToUser.get(socket.id);

      if (!userInfo || !userInfo.roomId) return;
      if (!content || content.trim().length === 0) return;

      const message = {
        roomId: userInfo.roomId,
        senderId: userInfo.userId,
        senderName: userInfo.name,
        content: content.trim(),
        type,
        isGuest: userInfo.isGuest,
        timestamp: new Date().toISOString(),
      };

      // Save to DB
      try {
        const savedMessage = await Message.create({
          roomId: message.roomId,
          senderId: message.senderId,
          senderName: message.senderName,
          content: message.content,
          type: message.type,
          isGuest: message.isGuest,
        });

        // Update guest session
        if (userInfo.isGuest) {
          await Session.findOneAndUpdate(
            { guestId: userInfo.userId },
            { $addToSet: { rooms: userInfo.roomId }, lastActive: new Date() },
            { upsert: true }
          );
        }

        message._id = savedMessage._id;
      } catch (err) {
        console.error('Error saving message:', err);
      }

      socket.to(userInfo.roomId).emit('new_message', message);
    });

    // Typing indicator
    socket.on('typing', (isTyping) => {
      const userInfo = socketToUser.get(socket.id);
      if (!userInfo || !userInfo.roomId) return;

      socket.to(userInfo.roomId).emit('stranger_typing', isTyping);
    });

    // Skip / find next
    socket.on('skip', () => {
      const userInfo = socketToUser.get(socket.id);
      if (!userInfo) return;

      if (userInfo.roomId) {
        leaveRoom(socket, io, userInfo.roomId);
      }

      // Re-queue
      const queueIndex = waitingQueue.indexOf(socket.id);
      if (queueIndex === -1) {
        waitingQueue.push(socket.id);
      }
      socket.emit('waiting');
    });

    // Disconnect
    socket.on('disconnect', () => {
      const userInfo = socketToUser.get(socket.id);
      if (userInfo && userInfo.roomId) {
        leaveRoom(socket, io, userInfo.roomId);
      }

      // Remove from waiting queue
      const queueIndex = waitingQueue.indexOf(socket.id);
      if (queueIndex !== -1) waitingQueue.splice(queueIndex, 1);

      socketToUser.delete(socket.id);
      console.log('Disconnected:', socket.id);
    });
  });
};

function leaveRoom(socket, io, roomId) {
  const userInfo = socketToUser.get(socket.id);
  const room = activeRooms.get(roomId);

  if (room) {
    // Notify partner
    socket.to(roomId).emit('partner_disconnected');
    io.to(roomId).emit('system_message', {
      content: 'Stranger has disconnected.',
      type: 'system',
      timestamp: new Date().toISOString(),
    });

    // Update partner's roomId
    const partnerSocketId = room.user1 === socket.id ? room.user2 : room.user1;
    const partnerInfo = socketToUser.get(partnerSocketId);
    if (partnerInfo) {
      partnerInfo.roomId = null;
    }

    activeRooms.delete(roomId);
  }

  socket.leave(roomId);
  if (userInfo) {
    userInfo.roomId = null;
  }
}

module.exports = socketHandler;
