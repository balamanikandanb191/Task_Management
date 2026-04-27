// controllers/comment.controller.js — Task comments
const db = require('../config/db.config');
const { sendSuccess, sendError } = require('../utils/helpers');

// GET /api/comments/task/:taskId
exports.getComments = async (req, res) => {
  try {
    const [comments] = await db.execute(
      `SELECT c.*, u.name as user_name, u.role as user_role
       FROM task_comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.task_id = ?
       ORDER BY c.created_at ASC`,
      [req.params.taskId]
    );
    sendSuccess(res, comments);
  } catch (err) {
    sendError(res, 'Failed to fetch comments', 500, err);
  }
};

// POST /api/comments/task/:taskId
exports.addComment = async (req, res) => {
  const { comment } = req.body;
  try {
    const [result] = await db.execute(
      'INSERT INTO task_comments (task_id, user_id, comment) VALUES (?, ?, ?)',
      [req.params.taskId, req.user.id, comment]
    );
    sendSuccess(res, { id: result.insertId, comment }, 'Comment added', 201);
  } catch (err) {
    sendError(res, 'Failed to add comment', 500, err);
  }
};

// DELETE /api/comments/:id
exports.deleteComment = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM task_comments WHERE id = ?', [req.params.id]);
    if (!rows.length) return sendError(res, 'Comment not found', 404);
    if (rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return sendError(res, 'Not authorized', 403);
    }
    await db.execute('DELETE FROM task_comments WHERE id = ?', [req.params.id]);
    sendSuccess(res, null, 'Comment deleted');
  } catch (err) {
    sendError(res, 'Failed to delete comment', 500, err);
  }
};
