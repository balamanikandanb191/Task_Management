// config/db.config.js — MySQL connection pool
const mysql = require('mysql2/promise');
require('dotenv').config();
const logger = require('../utils/logger');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'task_management_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00',
});

// Test connection on startup and run migrations
pool.getConnection()
  .then(async conn => {
    logger.info('✅ MySQL connected successfully');
    
    // Migration Helper: Check if column exists before adding
    const ensureColumn = async (table, column, definition) => {
      try {
        const [cols] = await conn.execute(`
          SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_NAME = ? AND COLUMN_NAME = ? AND TABLE_SCHEMA = DATABASE()
        `, [table, column]);
        
        if (cols.length === 0) {
          await conn.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
          logger.info(`✅ Migration: Added ${column} to ${table}`);
        } else {
          logger.info(`ℹ️ Migration: ${table}.${column} already exists`);
        }
      } catch (err) {
        logger.error(`❌ Migration failed for ${table}.${column}:`, err.message);
      }
    };

    // Run Migrations
    await ensureColumn('tasks', 'parent_task_id',   'INT NULL DEFAULT NULL AFTER id');
    await ensureColumn('tasks', 'rejection_reason', 'TEXT DEFAULT NULL AFTER approval_status');
    await ensureColumn('tasks', 'submission_notes', 'TEXT DEFAULT NULL AFTER rejection_reason');
    await ensureColumn('tasks', 'submission_link',  'VARCHAR(255) DEFAULT NULL AFTER submission_notes');
    await ensureColumn('tasks', 'rejection_screenshot', 'VARCHAR(512) DEFAULT NULL AFTER submission_link');
    await ensureColumn('tasks', 'submitted_at',     'TIMESTAMP NULL DEFAULT NULL AFTER deadline');
    await ensureColumn('tasks', 'approved_at',      'TIMESTAMP NULL DEFAULT NULL AFTER submitted_at');
    await ensureColumn('users', 'modules',          'TEXT DEFAULT NULL AFTER role');
    await ensureColumn('projects', 'workflow_path', 'VARCHAR(500) NULL DEFAULT NULL AFTER deadline');

    // Update ENUM for multi-stage approval
    try {
      // First ensure the column can hold the values (VARCHAR fallback if ENUM is problematic)
      await conn.execute(`
        ALTER TABLE tasks MODIFY COLUMN approval_status 
        VARCHAR(50) DEFAULT 'pending_review'
      `);
      logger.info('✅ Migration: Updated approval_status to VARCHAR(50) for flexibility');
    } catch (err) {
      logger.error('❌ Migration failed for approval_status update:', err.message);
    }

    // Auto-create password_reset_requests table
    try {
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS password_reset_requests (
          id          INT AUTO_INCREMENT PRIMARY KEY,
          user_id     INT NOT NULL,
          email       VARCHAR(150) NOT NULL,
          status      ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
          created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      logger.info('✅ Migration: password_reset_requests table ensured');
    } catch (err) {
      logger.error('❌ Migration: Failed to ensure password_reset_requests table:', err.message);
    }

    conn.release();
  })
  .catch(err => {
    logger.error('❌ MySQL connection failed:', err.message);
    process.exit(1);
  });

module.exports = pool;
