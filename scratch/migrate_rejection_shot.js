const db = require('../backend/config/db.config');

async function migrate() {
    try {
        console.log('Adding rejection_screenshot column to tasks table...');
        await db.execute('ALTER TABLE tasks ADD COLUMN rejection_screenshot VARCHAR(512) DEFAULT NULL');
        console.log('Migration successful.');
    } catch (err) {
        if (err.code === 'ER_DUP_COLUMN_NAME') {
            console.log('Column already exists.');
        } else {
            console.error('Migration failed:', err);
        }
    } finally {
        process.exit();
    }
}

migrate();
