// middleware/role.middleware.js — Role-based access control
const { sendError } = require('../utils/helpers');

/**
 * allowRoles('admin', 'project_manager')
 * Returns middleware that checks req.user.role
 */
const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    if (!roles.includes(req.user.role)) {
      return sendError(res, `Access denied. Requires role: ${roles.join(' or ')}.`, 403);
    }
    next();
  };
};

module.exports = { allowRoles };
