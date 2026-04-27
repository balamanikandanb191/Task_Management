// controllers/activity.controller.js — Admin-facing activity log viewer
const db = require('../config/db.config');
const { sendSuccess, sendError } = require('../utils/helpers');

// GET /api/activity — Admin sees all; others see own
exports.getActivity = async (req, res) => {
  const { role, id } = req.user;
  const { limit = 100, userId, startDate, endDate } = req.query;
  try {
    let query = `
      SELECT a.*, u.name as user_name, u.role as user_role, u.email as user_email
      FROM activity_logs a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (role !== 'admin') {
      query += ' AND a.user_id = ?'; 
      params.push(id || null);
    } else {
      if (userId && userId !== 'All Users') {
        const searchId = `%${userId}%`;
        query += ' AND (u.name LIKE ? OR u.email LIKE ? OR u.role LIKE ?)';
        params.push(searchId, searchId, searchId);
      }
      if (startDate && startDate.length > 5) {
        query += ' AND a.created_at >= ?';
        params.push(startDate.replace('T', ' ') + ':00');
      }
      if (endDate && endDate.length > 5) {
        query += ' AND a.created_at <= ?';
        params.push(endDate.replace('T', ' ') + ':59');
      }
    }
    
    const finalLimit = isNaN(parseInt(limit)) ? 100 : parseInt(limit);
    query += ` ORDER BY a.created_at DESC LIMIT ${finalLimit}`;

    const [logs] = await db.execute(query, params);
    sendSuccess(res, logs);
  } catch (err) {
    sendError(res, 'Failed to fetch activity logs', 500, err);
  }
};
