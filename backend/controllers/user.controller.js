// controllers/user.controller.js — CRUD users (Admin)
const bcrypt = require('bcryptjs');
const db = require('../config/db.config');
const { sendSuccess, sendError, sanitizeUser } = require('../utils/helpers');
const { logActivity } = require('../services/activity.service');
const logger = require('../utils/logger');

// GET /api/users — Admin: all | PM: TLs & TMs | TL: TMs in their team
exports.getUsers = async (req, res) => {
  const { role, id } = req.user;
  const { search, userRole } = req.query;
  try {
    let query = `
      SELECT u.id, u.name, u.email, u.role, u.is_active, u.avatar, u.created_at,
             (SELECT GROUP_CONCAT(DISTINCT t.name) 
              FROM (
                SELECT team_id as tid, user_id as uid FROM team_members
                UNION
                SELECT id as tid, team_leader_id as uid FROM teams
              ) combined
              JOIN teams t ON combined.tid = t.id
              WHERE combined.uid = u.id) as team_names
      FROM users u 
      WHERE 1=1
    `;
    const params = [];

    if (role === 'project_manager') {
      query += ` AND u.role IN ('team_leader','team_member')`;
    } else if (role === 'team_leader') {
      query += ` AND u.role = 'team_member'`;
    }
    if (userRole) { query += ` AND u.role = ?`; params.push(userRole); }
    if (search) { query += ` AND (u.name LIKE ? OR u.email LIKE ?)`; params.push(`%${search}%`, `%${search}%`); }

    query += ' ORDER BY u.created_at DESC';
    const [users] = await db.execute(query, params);
    sendSuccess(res, users);
  } catch (err) {
    sendError(res, 'Failed to fetch users', 500, err);
  }
};

// GET /api/users/:id
exports.getUserById = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, name, email, role, is_active, avatar, created_at FROM users WHERE id = ?',
      [req.params.id]
    );
    if (!rows.length) return sendError(res, 'User not found', 404);
    sendSuccess(res, rows[0]);
  } catch (err) {
    sendError(res, 'Failed to fetch user', 500, err);
  }
};

// PUT /api/users/:id — Admin updates any user
exports.updateUser = async (req, res) => {
  const { name, email, role, is_active } = req.body;
  try {
    await db.execute(
      'UPDATE users SET name=?, email=?, role=?, is_active=? WHERE id=?',
      [name, email, role, is_active, req.params.id]
    );
    await logActivity(req.user.id, `Updated user #${req.params.id}`, 'user', req.params.id);
    sendSuccess(res, null, 'User updated');
  } catch (err) {
    sendError(res, 'Failed to update user', 500, err);
  }
};

// DELETE /api/users/:id — Admin only
exports.deleteUser = async (req, res) => {
  try {
    await db.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
    await logActivity(req.user.id, `Deleted user #${req.params.id}`, 'user', req.params.id);
    sendSuccess(res, null, 'User deleted');
  } catch (err) {
    sendError(res, 'Failed to delete user', 500, err);
  }
};

// PUT /api/users/:id/password — Admin reset password
exports.resetPassword = async (req, res) => {
  const { newPassword } = req.body;
  try {
    const hashed = await bcrypt.hash(newPassword, 10);
    await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashed, req.params.id]);
    sendSuccess(res, null, 'Password reset successfully');
  } catch (err) {
    sendError(res, 'Failed to reset password', 500, err);
  }
};

// GET /api/users/stats (Admin dashboard counts)
exports.getStats = async (req, res) => {
  try {
    const [totalUsers] = await db.execute('SELECT COUNT(*) as count FROM users');
    const [byRole] = await db.execute('SELECT role, COUNT(*) as count FROM users GROUP BY role');
    const [totalProjects] = await db.execute('SELECT COUNT(*) as count FROM projects');
    const [totalTasks] = await db.execute('SELECT COUNT(*) as count FROM tasks');
    const [tasksByStatus] = await db.execute('SELECT status, COUNT(*) as count FROM tasks GROUP BY status');

    const [overdueTasks] = await db.execute(
      "SELECT COUNT(*) as count FROM tasks WHERE deadline < CURDATE() AND status != 'Completed'"
    );

    const [approvedTasks] = await db.execute(
      "SELECT COUNT(*) as count FROM tasks WHERE approval_status = 'approved'"
    );

    const [recentActivity] = await db.execute(
      `SELECT al.*, u.name as user_name 
       FROM activity_logs al 
       LEFT JOIN users u ON al.user_id = u.id 
       ORDER BY al.created_at DESC LIMIT 5`
    );

    sendSuccess(res, {
      totalUsers: totalUsers[0].count,
      byRole,
      totalProjects: totalProjects[0].count,
      totalTasks: totalTasks[0].count,
      tasksByStatus,
      overdueTasks: overdueTasks[0].count,
      approvedTasks: approvedTasks[0].count,
      recentActivity
    });
  } catch (err) {
    sendError(res, 'Failed to fetch stats', 500, err);
  }
};
// GET /api/users/reset-requests — Admin: all pending requests
exports.getResetRequests = async (req, res) => {
  try {
    const query = `
      SELECT r.*, u.name as user_name 
      FROM password_reset_requests r
      JOIN users u ON r.user_id = u.id
      WHERE r.status = 'pending'
      ORDER BY r.created_at DESC
    `;
    const [requests] = await db.execute(query);
    sendSuccess(res, requests);
  } catch (err) {
    sendError(res, 'Failed to fetch reset requests', 500, err);
  }
};

// PUT /api/users/reset-requests/:id — Admin: approve/reject
exports.updateResetRequestStatus = async (req, res) => {
  const { status } = req.body; // 'approved' or 'rejected'
  try {
    await db.execute(
      'UPDATE password_reset_requests SET status = ? WHERE id = ?',
      [status, req.params.id]
    );
    sendSuccess(res, null, `Request ${status}`);
  } catch (err) {
    sendError(res, 'Failed to update request status', 500, err);
  }
};
