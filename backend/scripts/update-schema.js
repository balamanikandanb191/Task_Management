const pool = require('./config/db.config');

async function updateSchema() {
  try {
    console.log('Adding modules column to users table...');
    await pool.execute('ALTER TABLE users ADD COLUMN modules TEXT DEFAULT NULL');
    console.log('Successfully added modules column.');
    process.exit(0);
  } catch (err) {
    if (err.code === 'ER_DUP_COLUMN_NAME') {
      console.log('Column already exists.');
      process.exit(0);
    }
    console.error('Error updating schema:', err.message);
    process.exit(1);
  }
}

updateSchema();
