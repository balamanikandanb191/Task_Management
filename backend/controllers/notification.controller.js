// controllers/notification.controller.js
const db = require('../config/db.config');
const { sendSuccess, sendError } = require('../utils/helpers');

// GET /api/notifications — current user's notifications
exports.getNotifications = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
      [req.user.id]
    );
    const unreadCount = rows.filter(n => !n.is_read).length;
    sendSuccess(res, { notifications: rows, unreadCount });
  } catch (err) {
    sendError(res, 'Failed to fetch notifications', 500, err);
  }
};

// PUT /api/notifications/:id/read
exports.markRead = async (req, res) => {
  try {
    await db.execute(
      'UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?',
      [req.params.id, req.user.id]
    );
    sendSuccess(res, null, 'Marked as read');
  } catch (err) {
    sendError(res, 'Failed to update notification', 500, err);
  }
};

// PUT /api/notifications/read-all
exports.markAllRead = async (req, res) => {
  try {
    await db.execute(
      'UPDATE notifications SET is_read=1 WHERE user_id=?', [req.user.id]
    );
    sendSuccess(res, null, 'All notifications marked as read');
  } catch (err) {
    sendError(res, 'Failed to update notifications', 500, err);
  }
};
