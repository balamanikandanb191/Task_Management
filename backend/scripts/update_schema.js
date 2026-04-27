// scripts/update_schema.js — Fix missing columns and ensure structure
const mysql = require('mysql2/promise');
require('dotenv').config();

const update = async () => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'admin',
        database: process.env.DB_NAME || 'task_management_db'
    });

    console.log('🛠️ Starting database schema update...');

    try {
        // 1. Add 'modules' column to users if missing
        console.log('👤 Checking users table...');
        const [userCols] = await connection.query('SHOW COLUMNS FROM users LIKE "modules"');
        if (userCols.length === 0) {
            console.log('➕ Adding "modules" column to users...');
            await connection.query('ALTER TABLE users ADD COLUMN modules TEXT AFTER role');
        } else {
            console.log('✅ "modules" column already exists.');
        }

        // 2. Add 'parent_task_id' to tasks for hierarchical delegation
        console.log('📝 Checking tasks table...');
        const [taskCols] = await connection.query('SHOW COLUMNS FROM tasks LIKE "parent_task_id"');
        if (taskCols.length === 0) {
            console.log('➕ Adding "parent_task_id" column to tasks...');
            await connection.query('ALTER TABLE tasks ADD COLUMN parent_task_id INT NULL AFTER id');
            await connection.query('ALTER TABLE tasks ADD CONSTRAINT fk_parent_task FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE CASCADE');
        } else {
            console.log('✅ "parent_task_id" column already exists.');
        }

        // 3. Ensure activity_logs structure
        console.log('📜 Checking activity_logs table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS activity_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                action VARCHAR(255) NOT NULL,
                entity_type VARCHAR(50),
                entity_id INT,
                details TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
            )
        `);
        console.log('✅ activity_logs table is ready.');

        console.log('🚀 Database schema update complete!');
    } catch (err) {
        console.error('❌ Error updating database:', err);
    } finally {
        await connection.end();
        process.exit();
    }
};

update();
