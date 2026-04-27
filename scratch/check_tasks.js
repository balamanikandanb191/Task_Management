const axios = require('axios');

async function debug() {
    try {
        // Need a token to call this. But I can't easily get one here.
        // I'll check the db directly instead.
        const mysql = require('mysql2/promise');
        const db = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'task_management_db'
        });

        const [rows] = await db.execute(`
            SELECT t.*, u1.role as assigned_to_role 
            FROM tasks t 
            LEFT JOIN users u1 ON t.assigned_to = u1.id
        `);
        console.log('Tasks with roles:', rows.slice(0, 5));
        await db.end();
    } catch (e) {
        console.log('Debug failed:', e.message);
    }
}

debug();
