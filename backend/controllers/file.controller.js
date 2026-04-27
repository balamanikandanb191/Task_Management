// controllers/file.controller.js — Task & Project file uploads
const path = require('path');
const fs   = require('fs');
const db   = require('../config/db.config');
const { sendSuccess, sendError } = require('../utils/helpers');
const { logActivity } = require('../services/activity.service');

// POST /api/files/task/:taskId — TM uploads file
exports.uploadFile = async (req, res) => {
  const { taskId } = req.params;
  if (!req.file) return sendError(res, 'No file uploaded', 400);
  try {
    const [result] = await db.execute(
      `INSERT INTO task_files (task_id, file_name, file_path, file_type, file_size, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [taskId, req.file.originalname, req.file.filename,
       req.file.mimetype, req.file.size, req.user.id]
    );
    await logActivity(req.user.id, `Uploaded file for task #${taskId}`, 'task', taskId);
    sendSuccess(res, {
      id: result.insertId,
      file_name: req.file.originalname,
      file_path: req.file.filename,
    }, 'File uploaded', 201);
  } catch (err) {
    sendError(res, 'File upload failed', 500, err);
  }
};

// GET /api/files/task/:taskId — Get all files for a task
exports.getTaskFiles = async (req, res) => {
  try {
    const [files] = await db.execute(
      `SELECT f.*, u.name as uploaded_by_name
       FROM task_files f
       LEFT JOIN users u ON f.uploaded_by = u.id
       WHERE f.task_id = ?
       ORDER BY f.uploaded_at DESC`,
      [req.params.taskId]
    );
    sendSuccess(res, files);
  } catch (err) {
    sendError(res, 'Failed to fetch files', 500, err);
  }
};

// POST /api/files/project/:projectId — PM uploads project-level file
exports.uploadProjectFile = async (req, res) => {
  const { projectId } = req.params;
  if (!req.file) return sendError(res, 'No file uploaded', 400);
  try {
    const [result] = await db.execute(
      `INSERT INTO project_files (project_id, file_name, file_path, file_type, file_size, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [projectId, req.file.originalname, req.file.filename,
       req.file.mimetype, req.file.size, req.user.id]
    );
    await logActivity(req.user.id, `Uploaded document for project #${projectId}`, 'project', projectId);
    sendSuccess(res, {
      id: result.insertId,
      file_name: req.file.originalname,
      file_path: req.file.filename,
    }, 'Project file uploaded', 201);
  } catch (err) {
    sendError(res, 'Project file upload failed', 500, err);
  }
};

// GET /api/files/project/:projectId — Get all files for a project
exports.getProjectFiles = async (req, res) => {
  try {
    const [files] = await db.execute(
      `SELECT f.*, u.name as uploaded_by_name
       FROM project_files f
       LEFT JOIN users u ON f.uploaded_by = u.id
       WHERE f.project_id = ?
       ORDER BY f.uploaded_at DESC`,
      [req.params.projectId]
    );
    sendSuccess(res, files);
  } catch (err) {
    sendError(res, 'Failed to fetch project files', 500, err);
  }
};

// DELETE /api/files/:id/:type — Delete a file (type: 'task' or 'project')
exports.deleteFile = async (req, res) => {
  const { id, type } = req.params;
  const table = type === 'project' ? 'project_files' : 'task_files';
  try {
    const [rows] = await db.execute(`SELECT * FROM ${table} WHERE id = ?`, [id]);
    if (!rows.length) return sendError(res, 'File not found', 404);

    const filePath = path.join(__dirname, '../uploads', rows[0].file_path);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await db.execute(`DELETE FROM ${table} WHERE id = ?`, [id]);
    sendSuccess(res, null, 'File deleted');
  } catch (err) {
    sendError(res, 'Failed to delete file', 500, err);
  }
};
