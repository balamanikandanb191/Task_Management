// scripts/seed.js — Initial database seed
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const seed = async () => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'admin',
        database: process.env.DB_NAME || 'task_management_db'
    });

    console.log('🚀 Starting database seed...');

    try {
        // Clear existing data (in reverse order of dependencies)
        console.log('🧹 Clearing old data...');
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        await connection.query('TRUNCATE TABLE activity_logs');
        await connection.query('TRUNCATE TABLE notifications');
        await connection.query('TRUNCATE TABLE task_comments');
        await connection.query('TRUNCATE TABLE task_files');
        await connection.query('TRUNCATE TABLE tasks');
        await connection.query('TRUNCATE TABLE team_members');
        await connection.query('TRUNCATE TABLE teams');
        await connection.query('TRUNCATE TABLE projects');
        await connection.query('TRUNCATE TABLE users');
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        // 1. Create Default Users
        console.log('👤 Creating default users...');
        const hashedPassword = await bcrypt.hash('admin123', 10);

        const users = [
            ['Admin User', 'admin@taskmaster.com', hashedPassword, 'admin'],
            ['John PM', 'pm@taskmaster.com', hashedPassword, 'project_manager'],
            ['Sarah TL', 'tl@taskmaster.com', hashedPassword, 'team_leader'],
            ['Mike TM', 'tm@taskmaster.com', hashedPassword, 'team_member'],
            ['Jane TM', 'jane@taskmaster.com', hashedPassword, 'team_member']
        ];

        await connection.query(
            'INSERT INTO users (name, email, password, role) VALUES ?',
            [users]
        );

        // Get inserted user IDs
        const [userRows] = await connection.query('SELECT id, role FROM users');
        const adminId = userRows.find(u => u.role === 'admin').id;
        const pmId = userRows.find(u => u.role === 'project_manager').id;
        const tlId = userRows.find(u => u.role === 'team_leader').id;
        const tm1Id = userRows.find(u => u.role === 'team_member' && u.id > tlId).id;
        const tm2Id = userRows.find(u => u.role === 'team_member' && u.id > tm1Id).id;

        // 2. Create a Sample Project
        console.log('🏗️ Creating sample project...');
        const [projectResult] = await connection.query(
            'INSERT INTO projects (title, description, created_by, deadline) VALUES (?, ?, ?, ?)',
            ['ERP System Development', 'Phase 1 development of the company ERP.', pmId, '2024-12-31']
        );
        const projectId = projectResult.insertId;

        // 3. Create a Team
        console.log('👥 Creating sample team...');
        const [teamResult] = await connection.query(
            'INSERT INTO teams (project_id, team_leader_id, name) VALUES (?, ?, ?)',
            [projectId, tlId, 'Core Development Team']
        );
        const teamId = teamResult.insertId;

        // Add members to team
        await connection.query(
            'INSERT INTO team_members (team_id, user_id) VALUES (?, ?), (?, ?)',
            [teamId, tm1Id, teamId, tm2Id]
        );

        // 4. Create Sample Tasks
        console.log('📝 Creating sample tasks...');
        const tasks = [
            [projectId, teamId, 'Database Design', 'Create the initial SQL schema.', 'High', 'Approved', 'approved', tm1Id, tlId, '2024-05-30'],
            [projectId, teamId, 'API Implementation', 'Build core REST endpoints.', 'Medium', 'In Progress', 'pending_review', tm2Id, tlId, '2024-06-15'],
            [projectId, teamId, 'Frontend Scaffold', 'Setup Vite and React.', 'High', 'Pending', 'pending_review', tm1Id, tlId, '2024-06-20']
        ];

        await connection.query(
            'INSERT INTO tasks (project_id, team_id, title, description, priority, status, approval_status, assigned_to, created_by, deadline) VALUES ?',
            [tasks]
        );

        console.log('✅ Database seeded successfully!');
    } catch (err) {
        console.error('❌ Error seeding database:', err);
    } finally {
        await connection.end();
        process.exit();
    }
};

seed();
