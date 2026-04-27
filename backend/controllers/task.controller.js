// controllers/task.controller.js — Full task lifecycle with approval workflow
const db = require('../config/db.config');
const { sendSuccess, sendError, formatDate } = require('../utils/helpers');
const { logActivity } = require('../services/activity.service');
const { createNotification } = require('../services/notification.service');
const logger = require('../utils/logger');

// GET /api/tasks — role-filtered
exports.getTasks = async (req, res) => {
  const { role, id } = req.user;
  const { project_id, status, priority, approval_status, search } = req.query;
  try {
    let query = `
      SELECT t.*,
        u1.name as assigned_name,
        u1.role as assigned_to_role,
        u2.name as created_by_name,
        p.title as project_title,
        p.created_by as project_pm,
        (SELECT COUNT(*) FROM task_files WHERE task_id = t.id) as file_count,
        (SELECT file_path FROM task_files WHERE task_id = t.id LIMIT 1) as brief_path
      FROM tasks t
      LEFT JOIN users u1 ON t.assigned_to = u1.id
      LEFT JOIN users u2 ON t.created_by  = u2.id
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (role === 'team_leader') {
      // TL sees: 
      // 1. Tasks they created
      // 2. Tasks assigned directly to them
      // 3. Tasks in Teams they lead (explicit linkage)
      // 4. Tasks assigned to their Team Members for the same project (implicit discovery)
      query += ` AND (
        t.created_by = ? 
        OR t.assigned_to = ? 
        OR t.team_id IN (SELECT id FROM teams WHERE team_leader_id = ?)
        OR t.assigned_to IN (
          SELECT tm.user_id 
          FROM team_members tm 
          JOIN teams tm_t ON tm.team_id = tm_t.id 
          WHERE tm_t.team_leader_id = ? AND tm_t.project_id = t.project_id
        )
      )`; 
      params.push(id, id, id, id);
    } else if (role === 'team_member') {
      // TM sees: (Assigned to them) OR (Assigned to their Team)
      query += ` AND (t.assigned_to = ? OR t.team_id IN (SELECT team_id FROM team_members WHERE user_id = ?))`;
      params.push(id, id);
    } else if (role === 'project_manager') {
      query += ` AND t.project_id IN (SELECT id FROM projects WHERE created_by = ? OR created_by IN (SELECT id FROM users WHERE role='admin'))`;
      params.push(id);
    }

    if (project_id)       { query += ' AND t.project_id = ?';       params.push(project_id); }
    if (status)           { query += ' AND t.status = ?';            params.push(status); }
    if (priority)         { query += ' AND t.priority = ?';          params.push(priority); }
    if (approval_status)  { query += ' AND t.approval_status = ?';   params.push(approval_status); }
    if (search)           {
      query += ' AND (t.title LIKE ? OR t.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY t.created_at ASC';

    const [tasks] = await db.execute(query, params);

    sendSuccess(res, tasks);
  } catch (err) {
    logger.error('[Task] getTasks error:', err);
    sendError(res, 'Failed to fetch tasks', 500, err);
  }
};

// GET /api/tasks/:id
exports.getTaskById = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT t.*, u1.name as assigned_name, u1.role as assigned_to_role, u2.name as created_by_name, p.title as project_title
      FROM tasks t
      LEFT JOIN users u1 ON t.assigned_to = u1.id
      LEFT JOIN users u2 ON t.created_by  = u2.id
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.id = ?`, [req.params.id]);
    if (!rows.length) return sendError(res, 'Task not found', 404);
    sendSuccess(res, rows[0]);
  } catch (err) {
    sendError(res, 'Failed to fetch task', 500, err);
  }
};

// POST /api/tasks — TL creates task
exports.createTask = async (req, res) => {
  const { project_id, team_id, title, description, priority, assigned_to, deadline } = req.body;
  try {
    const [result] = await db.execute(
      `INSERT INTO tasks
       (project_id, team_id, title, description, priority, assigned_to, created_by, deadline)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [project_id, team_id || null, title, description, priority || 'Medium',
       assigned_to || null, req.user.id, formatDate(deadline)]
    );

    await logActivity(req.user.id, `Created task: ${title}`, 'task', result.insertId);

    if (assigned_to) {
      await createNotification(
        assigned_to,
        `You have been assigned a new task: "${title}"`,
        'info'
      );
    }

    sendSuccess(res, { id: result.insertId, title }, 'Task created', 201);
  } catch (err) {
    logger.error('[Task] createTask error:', err);
    sendError(res, 'Failed to create task', 500, err);
  }
};

// PUT /api/tasks/:id — TM updates status; TL/PM updates all fields
exports.updateTask = async (req, res) => {
  const { role, id: userId } = req.user;
  const { title, description, priority, status, assigned_to, deadline, submission_notes, submission_link } = req.body;
  const { id } = req.params;
  try {
    const [tasks] = await db.execute('SELECT t.*, p.created_by as project_pm FROM tasks t JOIN projects p ON t.project_id = p.id WHERE t.id = ?', [id]);
    if (!tasks.length) return sendError(res, 'Task not found', 404);

    const isAssignee = tasks[0].assigned_to === userId;

    if (role === 'team_member' || (role === 'team_leader' && isAssignee)) {
      if (!isAssignee) return sendError(res, 'Not authorized to update this task', 403);
      
      // Worker Role: TM always reviews to TL; TL always reviews to PM
      const isTL = role === 'team_leader';
      const newApproval = status === 'Completed' ? (isTL ? 'tl_approved' : 'pending_review') : (tasks[0].approval_status || 'pending');
      const submittedAt = status === 'Completed' ? new Date() : (tasks[0].submitted_at || null);
      
      const finalNotes = submission_notes || tasks[0].submission_notes || null;
      const finalLink = submission_link || tasks[0].submission_link || null;
      
      await db.execute(
        'UPDATE tasks SET status=?, approval_status=?, submitted_at=?, submission_notes=?, submission_link=? WHERE id=?',
        [status || tasks[0].status, newApproval, submittedAt, finalNotes, finalLink, id]
      );

      // Notification Logic
      if (status === 'Completed') {
        if (isTL) {
          // Notify PM directly
          await createNotification(
            tasks[0].project_pm,
            `Stage 1 Bypassed: TL "${req.user.name}" finished their own task "${tasks[0].title}". Final authorization required.`,
            'info',
            '/pm/task-overview'
          );
        } else {
          // Notify TL (creator) and Project PM
          await createNotification(
            tasks[0].created_by,
            `Task Submission: "${tasks[0].title}" has been uploaded and is pending your review.`,
            'info',
            '/tl/approvals'
          );
          
          if (tasks[0].project_pm !== tasks[0].created_by) {
            await createNotification(
              tasks[0].project_pm,
              `Asset Uploaded: "${tasks[0].title}" in project "${tasks[0].project_title}" is ready for TL review.`,
              'info',
              '/pm/task-overview'
            );
          }
        }
      }
    } else {
      // Management Role: Admin, PM, or TL (as creator/leader)
      let isOwner = role === 'admin' || (role === 'project_manager' && tasks[0].project_pm === userId);
      if (!isOwner && role === 'team_leader') {
        const [teams] = await db.execute('SELECT id FROM teams WHERE team_leader_id = ? AND project_id = ?', [userId, tasks[0].project_id]);
        isOwner = teams.length > 0;
      }
      if (!isOwner) return sendError(res, 'Not authorized to modify this task', 403);

      await db.execute(
        'UPDATE tasks SET title=?, description=?, priority=?, status=?, assigned_to=?, deadline=? WHERE id=?',
        [
          title || tasks[0].title, 
          description || tasks[0].description, 
          priority || tasks[0].priority, 
          status || tasks[0].status, 
          assigned_to || tasks[0].assigned_to, 
          formatDate(deadline) || tasks[0].deadline, 
          id
        ]
      );
    }

    await logActivity(userId, `Updated task #${id}`, 'task', id);
    sendSuccess(res, null, 'Task updated');
  } catch (err) {
    logger.error(`[Task] updateTask error for task #${id}:`, err.message);
    if (err.code === 'ER_BAD_FIELD_ERROR') {
      return sendError(res, 'Database schema mismatch: missing required columns. Please contact administrator.', 500, err);
    }
    sendError(res, 'Failed to update task', 500, err);
  }
};

// PUT /api/tasks/:id/approve — TL/PM/Admin approves task
exports.approveTask = async (req, res) => {
  const { id } = req.params;
  const { role, id: userId } = req.user;
  try {
    const [tasks] = await db.execute(`
      SELECT t.*, p.created_by as project_pm, u.role as assigned_to_role
      FROM tasks t 
      JOIN projects p ON t.project_id = p.id 
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.id = ?`, [id]);
      
    if (!tasks.length) return sendError(res, 'Task not found', 404);

    let isAuthorized = role === 'admin' || (role === 'project_manager' && tasks[0].project_pm === userId);
    if (!isAuthorized && role === 'team_leader') {
      const [teams] = await db.execute('SELECT id FROM teams WHERE team_leader_id = ? AND project_id = ?', [userId, tasks[0].project_id]);
      isAuthorized = teams.length > 0;
    }
    if (!isAuthorized) return sendError(res, 'Not authorized to approve this task', 403);

    let newApprovalStatus = '';
    let finalStatus = tasks[0].status;

    if (role === 'team_leader') {
      // TL Approval Stage 1
      newApprovalStatus = 'tl_approved';
      await db.execute(
        `UPDATE tasks SET approval_status='tl_approved' WHERE id=?`, [id]
      );
      
      // Notify PM (Stage 2)
      await createNotification(
        tasks[0].project_pm,
        `Stage 1 Complete: TL has approved "${tasks[0].title}". Final authorization required.`,
        'info',
        '/pm/task-overview'
      );
    } else {
      // Admin/PM Final Approval
      newApprovalStatus = 'approved';
      finalStatus = 'Completed';
      await db.execute(
        `UPDATE tasks SET approval_status='approved', approved_at=NOW(), status='Completed' WHERE id=?`, [id]
      );

      // Notify Member (Complete Success)
      await createNotification(
        tasks[0].assigned_to,
        `Mission Accomplished: "${tasks[0].title}" has been fully approved and finalized! ✅`,
        'success',
        '/tm/my-tasks'
      );
    }

    await logActivity(req.user.id, `Approved task #${id} (${newApprovalStatus})`, 'task', id);
    
    // Notify all Admins if final approval
    if (newApprovalStatus === 'approved') {
      const [admins] = await db.execute('SELECT id FROM users WHERE role = "admin"');
      for (const admin of admins) {
        if (admin.id !== userId) {
          await createNotification(
            admin.id,
            `Corporate Update: Task "${tasks[0].title}" has been finalized.`,
            'info',
            '/admin/tasks'
          );
        }
      }
    }

    sendSuccess(res, { approval_status: newApprovalStatus }, `Task approval processed as ${role}`);
  } catch (err) {
    logger.error('[Task] approveTask error:', err);
    sendError(res, 'Failed to approve task', 500, err);
  }
};

// PUT /api/tasks/:id/reject — TL/PM rejects task
exports.rejectTask = async (req, res) => {
  const { id } = req.params;
  const { rejection_reason } = req.body;
  const { role, id: userId } = req.user;
  try {
    const [tasks] = await db.execute('SELECT t.*, p.created_by as project_pm FROM tasks t JOIN projects p ON t.project_id = p.id WHERE t.id = ?', [id]);
    if (!tasks.length) return sendError(res, 'Task not found', 404);

    let isAuthorized = role === 'admin' || (role === 'project_manager' && tasks[0].project_pm === userId);
    if (!isAuthorized && role === 'team_leader') {
      const [teams] = await db.execute('SELECT id FROM teams WHERE team_leader_id = ? AND project_id = ?', [userId, tasks[0].project_id]);
      isAuthorized = teams.length > 0;
    }
    if (!isAuthorized) return sendError(res, 'Not authorized to reject this task', 403);

    const rejection_screenshot = req.file ? req.file.filename : null;

    await db.execute(
      `UPDATE tasks SET approval_status='rejected', rejection_reason=?, rejection_screenshot=?, status='In Progress' WHERE id=?`,
      [rejection_reason || 'No reason provided', rejection_screenshot, id]
    );

    await logActivity(req.user.id, `Rejected task #${id}`, 'task', id);
    await createNotification(
      tasks[0].assigned_to,
      `Your task "${tasks[0].title}" was rejected. Feedback provided${rejection_screenshot ? ' with screenshot' : ''}. Reason: ${rejection_reason || 'Please review and resubmit.'}`,
      'warning'
    );

    sendSuccess(res, { rejection_screenshot }, 'Task rejected');
  } catch (err) {
    logger.error('[Task] rejectTask error:', err);
    sendError(res, 'Failed to reject task', 500, err);
  }
};

// DELETE /api/tasks/:id — TL/PM or Admin
exports.deleteTask = async (req, res) => {
  const { id } = req.params;
  const { role, id: userId } = req.user;
  try {
    const [tasks] = await db.execute('SELECT t.*, p.created_by as project_pm FROM tasks t JOIN projects p ON t.project_id = p.id WHERE t.id = ?', [id]);
    if (!tasks.length) return sendError(res, 'Task not found', 404);

    let isAuthorized = role === 'admin' || (role === 'project_manager' && tasks[0].project_pm === userId);
    if (!isAuthorized && role === 'team_leader') {
      const [teams] = await db.execute('SELECT id FROM teams WHERE team_leader_id = ? AND project_id = ?', [userId, tasks[0].project_id]);
      isAuthorized = teams.length > 0;
    }
    if (!isAuthorized) return sendError(res, 'Not authorized to delete this task', 403);

    await db.execute('DELETE FROM tasks WHERE id = ?', [id]);
    await logActivity(userId, `Deleted task #${id}`, 'task', id);
    sendSuccess(res, null, 'Task deleted');
  } catch (err) {
    sendError(res, 'Failed to delete task', 500, err);
  }
};
