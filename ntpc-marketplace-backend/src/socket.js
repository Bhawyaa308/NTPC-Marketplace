const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const chatService = require('./services/chat.service');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

function initializeSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:8080',
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;

    if (!token) {
      return next(new Error('Unauthorized'));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const userId = decoded.user_id ?? decoded.id ?? decoded.sub ?? decoded.user?.user_id;

      if (!userId) {
        return next(new Error('Unauthorized'));
      }

      socket.user = {
        user_id: userId,
        employee_id: decoded.employee_id ?? decoded.employeeId ?? null,
        email: decoded.email ?? decoded.user?.email ?? null,
      };
      return next();
    } catch (err) {
      return next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user?.user_id;
    if (!userId) {
      socket.disconnect();
      return;
    }

    socket.join(`user:${userId}`);

    socket.on('join-room', ({ roomId }) => {
      if (roomId) {
        socket.join(`room:${roomId}`);
      }
    });

    socket.on('leave-room', ({ roomId }) => {
      if (roomId) {
        socket.leave(`room:${roomId}`);
      }
    });

    socket.on('typing', ({ roomId }) => {
      if (!roomId) return;
      socket.to(`room:${roomId}`).emit('typing', {
        roomId,
        userId,
      });
    });

    socket.on('stop-typing', ({ roomId }) => {
      if (!roomId) return;
      socket.to(`room:${roomId}`).emit('stop-typing', {
        roomId,
        userId,
      });
    });

    socket.on('send-message', async ({ roomId, message }) => {
      try {
        const result = await chatService.sendMessage(userId, roomId, { message });
        const payload = {
          ...result.message,
          room_id: roomId,
        };

        io.to(`room:${roomId}`).emit('new-message', payload);
        socket.emit('message-sent', payload);
      } catch (err) {
        socket.emit('message-error', {
          message: err.message || 'Failed to send message',
        });
      }
    });
  });

  return io;
}

module.exports = initializeSocket;
