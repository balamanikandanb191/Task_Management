// services/notification.service.js — Create in-app notifications
const db = require('../config/db.config');
const logger = require('../utils/logger');

/**
 * @param {number} userId - Recipient
 * @param {string} message - Notification text
 * @param {string} type - 'info' | 'success' | 'warning' | 'error'
 * @param {string} link - Optional deep link path
 */
exports.createNotification = async (userId, message, type = 'info', link = null) => {
  if (!userId) return;
  try {
    await db.execute(
      'INSERT INTO notifications (user_id, message, type, link) VALUES (?, ?, ?, ?)',
      [userId, message, type, link]
    );
  } catch (err) {
    logger.warn(`[NotificationService] Failed to create notification for user ${userId}:`, err.message);
  }
};
