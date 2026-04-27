// middleware/auth.middleware.js — Verify JWT token
const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/helpers');
const logger = require('../utils/logger');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Access denied. No token provided.', 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, name, email, role }
    next();
  } catch (err) {
    logger.warn(`[Auth] Invalid token: ${err.message}`);
    return sendError(res, 'Invalid or expired token.', 401);
  }
};

module.exports = authMiddleware;
