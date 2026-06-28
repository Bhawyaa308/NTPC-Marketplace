const { pool } = require('../config/db');

async function createNotification(payload) {
  const { user_id, title, message, type, related_entity_type, related_entity_id } = payload;

  const { rows } = await pool.query(
    `INSERT INTO notifications (user_id, title, message, type, related_entity_type, related_entity_id, is_read, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, FALSE, NOW())
     RETURNING notification_id, user_id, title, message, type, related_entity_type, related_entity_id, is_read, created_at`,
    [user_id, title, message, type, related_entity_type, related_entity_id]
  );

  return rows[0];
}

async function getUserNotifications(user_id) {
  const { rows } = await pool.query(
    `SELECT notification_id, user_id, title, message, type, related_entity_type, related_entity_id, is_read, created_at
     FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [user_id]
  );

  return rows;
}

async function getNotificationById(notification_id) {
  const { rows } = await pool.query(
    `SELECT notification_id, user_id, title, message, type, related_entity_type, related_entity_id, is_read, created_at
     FROM notifications
     WHERE notification_id = $1
     LIMIT 1`,
    [notification_id]
  );

  return rows[0];
}

async function markNotificationAsRead(notification_id) {
  const { rows } = await pool.query(
    `UPDATE notifications
     SET is_read = TRUE
     WHERE notification_id = $1
     RETURNING notification_id, user_id, title, message, type, related_entity_type, related_entity_id, is_read, created_at`,
    [notification_id]
  );

  return rows[0];
}

async function markAllUserNotificationsAsRead(user_id) {
  const { rows } = await pool.query(
    `UPDATE notifications
     SET is_read = TRUE
     WHERE user_id = $1 AND is_read = FALSE
     RETURNING notification_id, user_id, title, message, type, related_entity_type, related_entity_id, is_read, created_at`,
    [user_id]
  );

  return rows;
}

module.exports = {
  createNotification,
  getUserNotifications,
  getNotificationById,
  markNotificationAsRead,
  markAllUserNotificationsAsRead,
};
