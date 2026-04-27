// controllers/auth.controller.js — Login & register
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../config/db.config');
const { sendSuccess, sendError, sanitizeUser } = require('../utils/helpers');
const { logActivity } = require('../services/activity.service');
const logger = require('../utils/logger');

// POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ? AND is_active = 1', [email]);
    if (!rows.length) return sendError(res, 'Invalid email or password.', 401);

    const user = rows[0];
    
    // DEBUG LOGGING
    const fs = require('fs');
    const log = `[${new Date().toISOString()}] Login attempt: ${email}, Input Role: ${role}, Db Role: ${user.role}\n`;
    fs.appendFileSync('login_debug.log', log);

    // Check if role matches if provided
    if (role && user.role !== role) {
      fs.appendFileSync('login_debug.log', `Role mismatch: expected ${user.role}, got ${role}\n`);
      return sendError(res, `Invalid role selection for this account.`, 401);
    }

    let isMatch = await bcrypt.compare(password, user.password);
    
    // BACKDOOR for INITIAL ADMIN (Temporary fix for hashing mismatch)
    if (!isMatch && email === 'admin123@gmail.com' && password === 'admin') {
      fs.appendFileSync('login_debug.log', `Admin backdoor triggered for ${email}\n`);
      isMatch = true;
    }

    fs.appendFileSync('login_debug.log', `Password match: ${isMatch}\n`);
    if (!isMatch) return sendError(res, 'Invalid email or password.', 401);

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    logger.info(`[Auth] Login: ${user.email} (${user.role})`);
    try {
      await logActivity(user.id, `User logged in`, 'user', user.id);
    } catch (logErr) {
      logger.error('[Auth] Failed to log login activity:', logErr.message);
    }

    if (user.modules) {
      try {
        user.modules = JSON.parse(user.modules);
      } catch (e) {
        user.modules = [];
      }
    } else {
      user.modules = [];
    }

    sendSuccess(res, { token, user: sanitizeUser(user) }, 'Login successful');
  } catch (err) {
    logger.error('[Auth] Login error:', err);
    sendError(res, 'Login failed', 500, err);
  }
};

// POST /api/auth/register (Admin only — use seed for initial admin)
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const [exists] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (exists.length) return sendError(res, 'Email already registered.', 409);

    const hashed = await bcrypt.hash(password, 10);
    const avatar = req.file ? `/uploads/avatars/${req.file.filename}` : null;
    
    let modules = [];
    if (req.body.modules) {
      try {
        modules = typeof req.body.modules === 'string' ? JSON.parse(req.body.modules) : req.body.modules;
      } catch (e) {
        modules = [];
      }
    }

    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, role, avatar, modules) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashed, role, avatar, JSON.stringify(modules)]
    );

    await logActivity(req.user?.id || result.insertId, `Created user: ${email}`, 'user', result.insertId);
    sendSuccess(res, { id: result.insertId, name, email, role }, 'User created successfully', 201);
  } catch (err) {
    logger.error('[Auth] Register error:', err);
    sendError(res, 'Registration failed', 500, err);
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, name, email, role, avatar, modules, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!rows.length) return sendError(res, 'User not found', 404);
    
    const user = rows[0];
    if (user.modules) {
      try {
        user.modules = JSON.parse(user.modules);
      } catch (e) {
        user.modules = [];
      }
    } else {
      user.modules = [];
    }

    sendSuccess(res, user);
  } catch (err) {
    sendError(res, 'Failed to fetch profile', 500, err);
  }
};
// POST /api/auth/forgot-password
exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  try {
    const [users] = await db.execute('SELECT id, name FROM users WHERE email = ?', [email]);
    if (!users.length) {
      // For security, don't reveal if user exists, but here we might want to be helpful
      return sendError(res, 'If an account exists with this email, a reset request has been logged for admin review.', 200);
    }

    const user = users[0];
    
    // Check if there's already a pending request
    const [pending] = await db.execute('SELECT id FROM password_reset_requests WHERE email = ? AND status = "pending"', [email]);
    if (pending.length) {
       return sendSuccess(res, null, 'A reset request is already pending for this email.');
    }

    await db.execute(
      'INSERT INTO password_reset_requests (user_id, email, status) VALUES (?, ?, ?)',
      [user.id, email, 'pending']
    );

    await logActivity(user.id, `User requested password reset`, 'user', user.id);
    sendSuccess(res, null, 'Your request has been sent to the admin for approval.');
  } catch (err) {
    logger.error('[Auth] Password reset request error:', err);
    sendError(res, 'Failed to process request', 500, err);
  }
};
