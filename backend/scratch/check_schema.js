const pool = require('./config/db.config');

async function checkTasksSchema() {
  try {
    const [rows] = await pool.execute('DESCRIBE tasks');
    console.log('--- TASKS TABLE SCHEMA ---');
    console.table(rows);
    process.exit(0);
  } catch (err) {
    console.error('Error checking tasks table:', err.message);
    process.exit(1);
  }
}

checkTasksSchema();
