// utils/helpers.js — Shared helper functions
const { APPROVAL_STATUS } = require('./constants');

/**
 * Calculate project progress based on task counts
 */
exports.calcProgress = (totalTasks, approvedTasks) => {
  if (!totalTasks || totalTasks === 0) return 0;
  return Math.round((approvedTasks / totalTasks) * 100);
};

/**
 * Generate a paginated response object
 */
exports.paginate = (data, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  return {
    data: data.slice(offset, offset + limit),
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: data.length,
      pages: Math.ceil(data.length / limit),
    },
  };
};

/**
 * Send a standardised API success response
 */
exports.sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({ success: true, message, data });
};

/**
 * Send a standardised API error response
 */
exports.sendError = (res, message = 'Internal Server Error', statusCode = 500, error = null) => {
  const payload = { success: false, message };
  
  if (process.env.NODE_ENV === 'development' && error) {
    // Robustly handle different error types to prevent secondary crashes
    const errorMsg = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : 'No stack trace available';
    
    payload.error = errorMsg;
    
    // Log to file for AI investigation
    try {
      const fs = require('fs');
      const path = require('path');
      const logPath = path.join(__dirname, '..', 'login_debug.log');
      fs.appendFileSync(logPath, `[${new Date().toISOString()}] ERROR 500: ${message} - ${errorMsg}\n${errorStack}\n`);
    } catch (logErr) {
      console.error('Failed to write to login_debug.log:', logErr);
    }
  }
  res.status(statusCode).json(payload);
};

/**
 * Format a date to YYYY-MM-DD for MySQL
 */
exports.formatDate = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr).toISOString().split('T')[0];
};

/**
 * Strip sensitive fields from user object
 */
exports.sanitizeUser = (user) => {
  const { password, ...safe } = user;
  return safe;
};
