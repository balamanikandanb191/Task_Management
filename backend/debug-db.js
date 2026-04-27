const pool = require('./config/db.config');

async function check() {
  try {
    const [rows] = await pool.execute('SELECT id, name, email, role FROM users');
    console.log('--- USERS IN DATABASE ---');
    console.table(rows);
    process.exit(0);
  } catch (err) {
    console.error('Error checking users:', err.message);
    process.exit(1);
  }
}

check();
