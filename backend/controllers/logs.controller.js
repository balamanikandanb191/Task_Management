const db = require('../config/db.config');
const { sendSuccess, sendError } = require('../utils/helpers');

// GET /api/logs
exports.getLogs = async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;
    let query = `
      SELECT al.*, u.name as user_name, u.email as user_email, u.role as user_role 
      FROM activity_logs al 
      LEFT JOIN users u ON al.user_id = u.id 
      WHERE 1=1
    `;
    const params = [];

    if (userId && userId !== 'All Users') {
      query += ` AND (u.id = ? OR u.email LIKE ?)`;
      params.push(userId, `%${userId}%`);
    }

    if (startDate) {
      query += ` AND al.created_at >= ?`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND al.created_at <= ?`;
      params.push(endDate);
    }

    query += ` ORDER BY al.created_at DESC LIMIT 500`;

    const [rows] = await db.execute(query, params);
    sendSuccess(res, rows);
  } catch (err) {
    sendError(res, 'Failed to fetch logs', 500, err);
  }
};
