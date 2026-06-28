const chatService = require('../services/chat.service');

async function createOrGetChatRoom(req, res, next) {
  try {
    const room = await chatService.createOrGetChatRoom(req.user.user_id, req.body);
    return res.status(200).json(room);
  } catch (err) {
    return next(err);
  }
}

async function getUserChatRooms(req, res, next) {
  try {
    const rooms = await chatService.getUserChatRooms(req.user.user_id);
    return res.status(200).json(rooms);
  } catch (err) {
    return next(err);
  }
}

async function getRoomMessages(req, res, next) {
  try {
    const messages = await chatService.getRoomMessages(req.user.user_id, req.params.roomId);
    return res.status(200).json(messages);
  } catch (err) {
    return next(err);
  }
}

async function sendMessage(req, res, next) {
  try {
    const result = await chatService.sendMessage(req.user.user_id, req.params.roomId, req.body);
    return res.status(201).json(result.message);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createOrGetChatRoom,
  getUserChatRooms,
  getRoomMessages,
  sendMessage,
};
