const notificationsRepository = require('../repositories/notifications.repository');

function createError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function createNotification(payload) {
  const { user_id, title, message, type, related_entity_type, related_entity_id } = payload;

  if (!user_id || !title || !message || !type) {
    throw createError(400, 'user_id, title, message, and type are required');
  }

  const notification = await notificationsRepository.createNotification({
    user_id,
    title,
    message,
    type,
    related_entity_type: related_entity_type || null,
    related_entity_id: related_entity_id || null,
  });

  return notification;
}

async function getUserNotifications(user_id) {
  const notifications = await notificationsRepository.getUserNotifications(user_id);
  return notifications;
}

async function markNotificationAsRead(user_id, notification_id) {
  if (!notification_id || isNaN(notification_id)) {
    throw createError(400, 'Valid notification ID is required');
  }

  const notification = await notificationsRepository.getNotificationById(notification_id);
  if (!notification) {
    throw createError(404, 'Notification not found');
  }

  // Verify ownership
  if (notification.user_id !== user_id) {
    throw createError(403, 'You can only update your own notifications');
  }

  const updatedNotification = await notificationsRepository.markNotificationAsRead(notification_id);
  return updatedNotification;
}

async function markAllUserNotificationsAsRead(user_id) {
  const notifications = await notificationsRepository.markAllUserNotificationsAsRead(user_id);
  return notifications;
}

module.exports = {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllUserNotificationsAsRead,
};
