// services/activity.service.js — Log any action to activity_logs
const db = require('../config/db.config');
const logger = require('../utils/logger');

/**
 * @param {number} userId - Who performed the action
 * @param {string} action - Description of the action
 * @param {string} entityType - 'project' | 'task' | 'user' | 'team'
 * @param {number} entityId - ID of the affected record
 * @param {string} details - Optional JSON details
 */
exports.logActivity = async (userId, action, entityType = null, entityId = null, details = null) => {
  try {
    await db.execute(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [userId, action, entityType, entityId, details]
    );
  } catch (err) {
    logger.warn(`[ActivityService] Failed to log: ${action}`, err.message);
  }
};
