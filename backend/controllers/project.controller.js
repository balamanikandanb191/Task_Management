// controllers/project.controller.js — Project CRUD
const db = require('../config/db.config');
const { sendSuccess, sendError, formatDate, calcProgress } = require('../utils/helpers');
const { logActivity } = require('../services/activity.service');
const { createNotification } = require('../services/notification.service');
const logger = require('../utils/logger');

// GET /api/projects
exports.getProjects = async (req, res) => {
  const { role, id } = req.user;
  const { search, status } = req.query;
  try {
    let query = `
      SELECT p.*, u.name as pm_name,
             (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as total_tasks,
             (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.approval_status='approved') as approved_tasks
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (role === 'project_manager') {
      query += ` AND (p.created_by = ? OR p.created_by IN (SELECT id FROM users WHERE role='admin'))`;
      params.push(id);
    } else if (role === 'team_leader') {
      query += ` AND (p.id IN (SELECT project_id FROM teams WHERE team_leader_id = ?) OR p.created_by IN (SELECT id FROM users WHERE role='admin'))`;
      params.push(id);
    } else if (role === 'team_member') {
      query += ` AND p.id IN (
        SELECT t.project_id FROM teams t
        JOIN team_members tm ON tm.team_id = t.id
        WHERE tm.user_id = ?
      )`; params.push(id);
    }

    if (status) { query += ' AND p.status = ?'; params.push(status); }
    if (search) {
      query += ' AND (p.title LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY p.created_at DESC';

    const [projects] = await db.execute(query, params);
    const withProgress = projects.map(p => ({
      ...p,
      progress: calcProgress(p.total_tasks, p.approved_tasks),
    }));

    sendSuccess(res, withProgress);
  } catch (err) {
    logger.error('[Project] getProjects error:', err);
    sendError(res, 'Failed to fetch projects', 500, err);
  }
};

// GET /api/projects/:id
exports.getProjectById = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT p.*, u.name as pm_name,
        (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as total_tasks,
        (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.approval_status='approved') as approved_tasks
      FROM projects p LEFT JOIN users u ON p.created_by = u.id
      WHERE p.id = ?`, [req.params.id]);
    if (!rows.length) return sendError(res, 'Project not found', 404);
    const p = rows[0];
    p.progress = calcProgress(p.total_tasks, p.approved_tasks);
    sendSuccess(res, p);
  } catch (err) {
    sendError(res, 'Failed to fetch project', 500, err);
  }
};

exports.createProject = async (req, res) => {
  const { title, description, deadline } = req.body;
  const workflowPath = req.file ? req.file.filename : null;
  try {
    const [result] = await db.execute(
      'INSERT INTO projects (title, description, deadline, created_by, workflow_path) VALUES (?, ?, ?, ?, ?)',
      [title, description, formatDate(deadline), req.user.id, workflowPath]
    );
    await logActivity(req.user.id, `Created project: ${title}`, 'project', result.insertId);
    sendSuccess(res, { id: result.insertId, title }, 'Project created', 201);
  } catch (err) {
    sendError(res, 'Failed to create project', 500, err);
  }
};

// PUT /api/projects/:id — PM or Admin
exports.updateProject = async (req, res) => {
    const { title, description, deadline, status } = req.body;
    const { id } = req.params;
    try {
        const [rows] = await db.execute('SELECT * FROM projects WHERE id = ?', [id]);
        if (!rows.length) return sendError(res, 'Project not found', 404);
        const project = rows[0];

        // Completion lock: can only complete if all tasks are approved
        if (status === 'completed') {
            const [tasks] = await db.execute(
                `SELECT COUNT(*) as pending FROM tasks
                 WHERE project_id = ? AND approval_status != 'approved'`, [id]
            );
            if (tasks[0].pending > 0) {
                return sendError(res, `Cannot complete project: ${tasks[0].pending} task(s) not yet approved.`, 400);
            }
        }

        const finalTitle = title !== undefined ? title : (project.title ?? null);
        const finalDesc = description !== undefined ? description : (project.description ?? null);
        const finalDeadline = deadline !== undefined ? (formatDate(deadline) || null) : (project.deadline ?? null);
        const finalStatus = status !== undefined ? status : (project.status ?? null);

        await db.execute(
            'UPDATE projects SET title=?, description=?, deadline=?, status=? WHERE id=?',
            [finalTitle, finalDesc, finalDeadline, finalStatus, id]
        );
        await logActivity(req.user.id, `Updated project #${id}`, 'project', id);
        sendSuccess(res, null, 'Project updated');
    } catch (err) {
        logger.error('[Project] updateProject error:', err);
        sendError(res, 'Failed to update project', 500, err);
    }
};

// DELETE /api/projects/:id — PM (Creator) or Admin
exports.deleteProject = async (req, res) => {
  const { id } = req.params;
  const { role, id: userId } = req.user;
  try {
    const [projects] = await db.execute('SELECT created_by FROM projects WHERE id = ?', [id]);
    if (!projects.length) return sendError(res, 'Project not found', 404);

    if (role !== 'admin' && projects[0].created_by !== userId) {
      return sendError(res, 'Not authorized to delete this project. Only the project owner or administrators can perform this action.', 403);
    }

    await db.execute('DELETE FROM projects WHERE id = ?', [id]);
    await logActivity(userId, `Deleted project #${id}`, 'project', id);
    sendSuccess(res, null, 'Project deleted');
  } catch (err) {
    logger.error('[Project] deleteProject error:', err);
    sendError(res, 'Failed to delete project', 500, err);
  }
};
