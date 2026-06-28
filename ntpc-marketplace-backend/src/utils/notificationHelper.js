const notificationsService = require('../services/notifications.service');

/**
 * Reusable helper function to create notifications
 * @param {Object} payload - Notification data
 * @param {number} payload.user_id - User to notify
 * @param {string} payload.title - Notification title
 * @param {string} payload.message - Notification message
 * @param {string} payload.type - Notification type (e.g., 'RESERVATION', 'ORDER', 'CHAT_MESSAGE', etc.)
 * @param {string} [payload.related_entity_type] - Entity type (e.g., 'RESERVATION', 'ORDER', 'CHAT_ROOM')
 * @param {number} [payload.related_entity_id] - Entity ID
 * @returns {Promise<Object>} Created notification
 */
async function createNotification({
  user_id,
  title,
  message,
  type,
  related_entity_type,
  related_entity_id,
}) {
  try {
    return await notificationsService.createNotification({
      user_id,
      title,
      message,
      type,
      related_entity_type,
      related_entity_id,
    });
  } catch (err) {
    console.error('Error creating notification:', err);
    // Don't throw - notifications should not break the main flow
    return null;
  }
}

module.exports = {
  createNotification,
};
