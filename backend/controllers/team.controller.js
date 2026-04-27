// controllers/team.controller.js — Team & membership management (PM)
const db = require('../config/db.config');
const { sendSuccess, sendError } = require('../utils/helpers');
const { logActivity } = require('../services/activity.service');
const logger = require('../utils/logger');

// GET /api/teams
exports.getTeams = async (req, res) => {
  const { role, id } = req.user;
  const { project_id } = req.query;
  try {
    let query = `
      SELECT t.*, p.title as project_title,
             u.name as team_leader_name,
             (SELECT COUNT(*) FROM team_members tm WHERE tm.team_id=t.id) as member_count,
             COALESCE((SELECT GROUP_CONCAT(mu.name SEPARATOR ', ') 
                       FROM team_members tm2 
                       JOIN users mu ON tm2.user_id = mu.id 
                       WHERE tm2.team_id = t.id), '') as member_names
      FROM teams t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u ON t.team_leader_id = u.id
      WHERE 1=1
    `;
    const params = [];
    if (role === 'project_manager') {
      query += ` AND (p.created_by = ? OR p.created_by IN (SELECT id FROM users WHERE role='admin'))`;
      params.push(id);
    } else if (role === 'team_leader') {
      query += ' AND t.team_leader_id = ?'; params.push(id);
    } else if (role === 'team_member') {
      query += ' AND t.id IN (SELECT team_id FROM team_members WHERE user_id = ?)'; params.push(id);
    }

    if (project_id) {
      query += ' AND t.project_id = ?';
      params.push(project_id);
    }
    const [teams] = await db.execute(query, params);
    sendSuccess(res, teams);
  } catch (err) {
    sendError(res, 'Failed to fetch teams', 500, err);
  }
};

// GET /api/teams/:id
exports.getTeamById = async (req, res) => {
  try {
    const [teams] = await db.execute(`
      SELECT t.*, p.title as project_title, u.name as team_leader_name
      FROM teams t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u ON t.team_leader_id = u.id
      WHERE t.id = ?`, [req.params.id]);
    if (!teams.length) return sendError(res, 'Team not found', 404);

    const [members] = await db.execute(`
      SELECT u.id, u.name, u.email, u.role, tm.joined_at
      FROM team_members tm
      JOIN users u ON tm.user_id = u.id
      WHERE tm.team_id = ?`, [req.params.id]);

    sendSuccess(res, { ...teams[0], members });
  } catch (err) {
    sendError(res, 'Failed to fetch team', 500, err);
  }
};

// POST /api/teams — PM creates team for a project
exports.createTeam = async (req, res) => {
  const { project_id, name, team_leader_id, member_ids } = req.body;
  
  // Debug log to verify data arrival
  logger.info(`[Team] Constructing team "${name}" with ${member_ids?.length || 0} members`);
  
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.execute(
      'INSERT INTO teams (project_id, name, team_leader_id) VALUES (?, ?, ?)',
      [project_id, name, team_leader_id || null]
    );
    const teamId = result.insertId;

    if (member_ids && Array.isArray(member_ids) && member_ids.length > 0) {
      // Ensure all IDs are passed as numbers and formatted as a single array of rows
      const memberValues = member_ids.map(uid => [Number(teamId), Number(uid)]);
      
      // Standard mysql2 bulk insert syntax: VALUES ? with [ [ [r1c1, r1c2], [r2c1, r2c2] ] ]
      await conn.query('INSERT IGNORE INTO team_members (team_id, user_id) VALUES ?', [memberValues]);
      logger.info(`[Team] Assigned ${memberValues.length} personnel units to team #${teamId}`);
    }

    await logActivity(req.user.id, `Created team: ${name} for project #${project_id}`, 'team', teamId);
    
    await conn.commit();
    sendSuccess(res, { id: teamId, name }, 'Team created', 201);
  } catch (err) {
    await conn.rollback();
    logger.error('[Team] Construction failed:', err);
    sendError(res, 'Failed to create team', 500, err);
  } finally {
    conn.release();
  }
};

// PUT /api/teams/:id
exports.updateTeam = async (req, res) => {
  const { name, team_leader_id } = req.body;
  try {
    await db.execute(
      'UPDATE teams SET name=?, team_leader_id=? WHERE id=?',
      [name, team_leader_id || null, req.params.id]
    );
    await logActivity(req.user.id, `Updated team #${req.params.id}`, 'team', req.params.id);
    sendSuccess(res, null, 'Team updated');
  } catch (err) {
    sendError(res, 'Failed to update team', 500, err);
  }
};

// DELETE /api/teams/:id
exports.deleteTeam = async (req, res) => {
  const { id } = req.params;
  const { role, id: userId } = req.user;
  try {
    const [teams] = await db.execute(`
      SELECT t.*, p.created_by as project_owner 
      FROM teams t 
      JOIN projects p ON t.project_id = p.id 
      WHERE t.id = ?`, [id]);

    if (!teams.length) return sendError(res, 'Team not found', 404);

    const isAuthorized = role === 'admin' || teams[0].project_owner === userId;
    if (!isAuthorized) {
      return sendError(res, 'Not authorized to delete this team. Only the project owner or administrators can perform this action.', 403);
    }

    await db.execute('DELETE FROM teams WHERE id = ?', [id]);
    await logActivity(userId, `Deleted team #${id}`, 'team', id);
    sendSuccess(res, null, 'Team deleted');
  } catch (err) {
    sendError(res, 'Failed to delete team', 500, err);
  }
};

// POST /api/teams/:id/members — Add TM to team
exports.addMember = async (req, res) => {
  const { user_id } = req.body;
  try {
    await db.execute(
      'INSERT IGNORE INTO team_members (team_id, user_id) VALUES (?, ?)',
      [req.params.id, user_id]
    );
    await logActivity(req.user.id, `Added member #${user_id} to team #${req.params.id}`, 'team', req.params.id);
    sendSuccess(res, null, 'Member added', 201);
  } catch (err) {
    sendError(res, 'Failed to add member', 500, err);
  }
};

// DELETE /api/teams/:id/members/:userId — Remove member
exports.removeMember = async (req, res) => {
  try {
    await db.execute(
      'DELETE FROM team_members WHERE team_id = ? AND user_id = ?',
      [req.params.id, req.params.userId]
    );
    sendSuccess(res, null, 'Member removed');
  } catch (err) {
    sendError(res, 'Failed to remove member', 500, err);
  }
};
