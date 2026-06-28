const chatRepository = require('../repositories/chat.repository');

function createError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function createOrGetChatRoom(user_id, payload) {
  const { listing_id } = payload;

  if (!listing_id || isNaN(listing_id)) {
    throw createError(400, 'Valid listing ID is required');
  }

  // Get listing and verify it exists
  const listing = await chatRepository.getListingById(listing_id);
  if (!listing) {
    throw createError(404, 'Listing not found');
  }

  const seller_id = listing.seller_id;
  const buyer_id = user_id;

  // User cannot chat with themselves
  if (seller_id === buyer_id) {
    throw createError(400, 'You cannot create a chat for your own listing');
  }

  // Find or create chat room
  const room = await chatRepository.findOrCreateChatRoom(listing_id, buyer_id, seller_id);
  return room;
}

async function getUserChatRooms(user_id) {
  const rooms = await chatRepository.getUserChatRooms(user_id);
  return rooms;
}

async function getRoomMessages(user_id, room_id) {
  if (!room_id || isNaN(room_id)) {
    throw createError(400, 'Valid room ID is required');
  }

  // Verify user is participant in this room
  const room = await chatRepository.getChatRoomById(room_id);
  if (!room) {
    throw createError(404, 'Chat room not found');
  }

  const isParticipant = room.buyer_id === user_id || room.seller_id === user_id;
  if (!isParticipant) {
    throw createError(403, 'You do not have access to this chat room');
  }

  const messages = await chatRepository.getRoomMessages(room_id);
  return messages;
}

async function sendMessage(user_id, room_id, payload) {
  const { message } = payload;

  if (!room_id || isNaN(room_id)) {
    throw createError(400, 'Valid room ID is required');
  }

  if (!message || typeof message !== 'string' || message.trim() === '') {
    throw createError(400, 'Message cannot be empty');
  }

  // Verify user is participant in this room
  const room = await chatRepository.getChatRoomById(room_id);
  if (!room) {
    throw createError(404, 'Chat room not found');
  }

  const isParticipant = room.buyer_id === user_id || room.seller_id === user_id;
  if (!isParticipant) {
    throw createError(403, 'You do not have access to this chat room');
  }

  // Save message
  const newMessage = await chatRepository.createMessage(room_id, user_id, message.trim());

  // Update room's last message timestamp
  await chatRepository.updateRoomLastMessage(room_id);

  // Determine receiver for notification
  const receiver_id = room.buyer_id === user_id ? room.seller_id : room.buyer_id;

  // Notify receiver of new message
  const { createNotification } = require('../utils/notificationHelper');
  await createNotification({
    user_id: receiver_id,
    title: 'New Message',
    message: 'You received a new message',
    type: 'CHAT_MESSAGE',
    related_entity_type: 'CHAT_ROOM',
    related_entity_id: room_id,
  });

  return {
    message: newMessage,
    receiver_id,
    room_id,
  };
}

module.exports = {
  createOrGetChatRoom,
  getUserChatRooms,
  getRoomMessages,
  sendMessage,
};
