const { pool } = require('../config/db');

async function getListingById(listing_id) {
  const { rows } = await pool.query(
    `SELECT listing_id, seller_id
     FROM listings
     WHERE listing_id = $1
     LIMIT 1`,
    [listing_id]
  );

  return rows[0];
}

async function findOrCreateChatRoom(listing_id, buyer_id, seller_id) {
  const { rows } = await pool.query(
    `SELECT room_id, listing_id, buyer_id, seller_id, last_message_at, is_active, created_at
     FROM chat_rooms
     WHERE listing_id = $1 AND buyer_id = $2 AND seller_id = $3
     LIMIT 1`,
    [listing_id, buyer_id, seller_id]
  );

  if (rows.length > 0) {
    return rows[0];
  }

  // Create new room
  const createResult = await pool.query(
    `INSERT INTO chat_rooms (listing_id, buyer_id, seller_id, is_active, created_at)
     VALUES ($1, $2, $3, TRUE, NOW())
     RETURNING room_id, listing_id, buyer_id, seller_id, last_message_at, is_active, created_at`,
    [listing_id, buyer_id, seller_id]
  );

  return createResult.rows[0];
}

async function getChatRoomById(room_id) {
  const { rows } = await pool.query(
    `SELECT room_id, listing_id, buyer_id, seller_id, last_message_at, is_active, created_at
     FROM chat_rooms
     WHERE room_id = $1
     LIMIT 1`,
    [room_id]
  );

  return rows[0];
}

async function getUserChatRooms(user_id) {
  const { rows } = await pool.query(
    `SELECT 
       cr.room_id,
       cr.listing_id,
       cr.buyer_id,
       cr.seller_id,
       buyer.name AS buyer_name,
       seller.name AS seller_name,
       buyer.profile_picture AS buyer_profile,
       seller.profile_picture AS seller_profile,
       l.title AS listing_title,
       COALESCE(l.image_urls->>0, '') AS listing_image,
       CASE
         WHEN cr.buyer_id = $1 THEN seller.user_id
         ELSE buyer.user_id
       END AS participant_id,
       CASE
         WHEN cr.buyer_id = $1 THEN seller.name
         ELSE buyer.name
       END AS participant_name,
       CASE
         WHEN cr.buyer_id = $1 THEN seller.profile_picture
         ELSE buyer.profile_picture
       END AS participant_profile,
       m.message AS last_message,
       m.created_at AS last_message_timestamp
     FROM chat_rooms cr
     JOIN listings l ON l.listing_id = cr.listing_id
     JOIN users buyer ON buyer.user_id = cr.buyer_id
     JOIN users seller ON seller.user_id = cr.seller_id
     LEFT JOIN messages m ON m.message_id = (
       SELECT message_id
       FROM messages
       WHERE room_id = cr.room_id
       ORDER BY created_at DESC
       LIMIT 1
     )
     WHERE cr.buyer_id = $1 OR cr.seller_id = $1
     ORDER BY cr.last_message_at DESC NULLS LAST`,
    [user_id]
  );

  return rows.map((row) => ({
    ...row,
    buyer_name: row.buyer_name || '',
    seller_name: row.seller_name || '',
    buyer_profile: row.buyer_profile || '',
    seller_profile: row.seller_profile || '',
    listing_title: row.listing_title || '',
    listing_image: row.listing_image || '',
    participant_name: row.participant_name || '',
    participant_profile: row.participant_profile || '',
    last_message: row.last_message || '',
    last_message_timestamp: row.last_message_timestamp || '',
  }));
}

async function getRoomMessages(room_id) {
  const { rows } = await pool.query(
    `SELECT 
       m.message_id,
       m.room_id,
       m.sender_id,
       u.name AS sender_name,
       u.profile_picture AS sender_profile,
       m.message,
       m.created_at
     FROM messages m
     JOIN users u ON u.user_id = m.sender_id
     WHERE m.room_id = $1
     ORDER BY m.created_at ASC`,
    [room_id]
  );

  return rows.map((row) => ({
    ...row,
    sender_name: row.sender_name || '',
    sender_profile: row.sender_profile || '',
    message: row.message || '',
    created_at: row.created_at || '',
  }));
}

async function createMessage(room_id, sender_id, message_text) {
  await pool.query(
    `INSERT INTO messages (room_id, sender_id, message, created_at)
     VALUES ($1, $2, $3, NOW())`,
    [room_id, sender_id, message_text]
  );

  const { rows } = await pool.query(
    `SELECT 
       m.message_id,
       m.room_id,
       m.sender_id,
       u.name AS sender_name,
       u.profile_picture AS sender_profile,
       m.message,
       m.created_at
     FROM messages m
     JOIN users u ON u.user_id = m.sender_id
     WHERE m.room_id = $1
     ORDER BY m.created_at DESC
     LIMIT 1`,
    [room_id]
  );

  return rows[0] || null;
}

async function updateRoomLastMessage(room_id) {
  const { rows } = await pool.query(
    `UPDATE chat_rooms
     SET last_message_at = NOW()
     WHERE room_id = $1
     RETURNING room_id, listing_id, buyer_id, seller_id, last_message_at, is_active, created_at`,
    [room_id]
  );

  return rows[0];
}

module.exports = {
  getListingById,
  findOrCreateChatRoom,
  getChatRoomById,
  getUserChatRooms,
  getRoomMessages,
  createMessage,
  updateRoomLastMessage,
};
