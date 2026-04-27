// middleware/error.middleware.js — Global error handler
const logger = require('../utils/logger');

const errorMiddleware = (err, req, res, next) => {
  logger.error(`[Error] ${req.method} ${req.url} — ${err.message}`, { stack: err.stack });

  // Log to debug file for AI
  const fs = require('fs');
  const path = require('path');
  const logPath = path.join(__dirname, '..', 'login_debug.log');
  fs.appendFileSync(logPath, `[${new Date().toISOString()}] GLOBAL ERROR 500: ${req.method} ${req.url} - ${err.message}\n${err.stack}\n`);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorMiddleware;
