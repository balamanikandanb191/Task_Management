// controllers/projectComment.controller.js
const db = require('../config/db.config');
const { sendSuccess, sendError } = require('../utils/helpers');

// GET /api/comments/project/:projectId
exports.getProjectComments = async (req, res) => {
  try {
    const [comments] = await db.execute(
      `SELECT c.*, u.name as user_name, u.role as user_role, u.avatar
       FROM project_comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.project_id = ?
       ORDER BY c.created_at ASC`,
      [req.params.projectId]
    );
    sendSuccess(res, comments);
  } catch (err) {
    sendError(res, 'Failed to fetch project comments', 500, err);
  }
};

// POST /api/comments/project/:projectId
exports.addProjectComment = async (req, res) => {
  const { comment } = req.body;
  try {
    const [result] = await db.execute(
      'INSERT INTO project_comments (project_id, user_id, comment) VALUES (?, ?, ?)',
      [req.params.projectId, req.user.id, comment]
    );
    sendSuccess(res, { id: result.insertId, comment }, 'Comment added to project', 201);
  } catch (err) {
    sendError(res, 'Failed to add project comment', 500, err);
  }
};
