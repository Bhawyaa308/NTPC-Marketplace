const notificationsService = require('../services/notifications.service');

async function getUserNotifications(req, res, next) {
  try {
    const notifications = await notificationsService.getUserNotifications(req.user.user_id);
    return res.status(200).json(notifications);
  } catch (err) {
    return next(err);
  }
}

async function markNotificationAsRead(req, res, next) {
  try {
    const notification = await notificationsService.markNotificationAsRead(req.user.user_id, req.params.id);
    return res.status(200).json(notification);
  } catch (err) {
    return next(err);
  }
}

async function markAllNotificationsAsRead(req, res, next) {
  try {
    const notifications = await notificationsService.markAllUserNotificationsAsRead(req.user.user_id);
    return res.status(200).json({
      message: 'All notifications marked as read',
      count: notifications.length,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
