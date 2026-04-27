const db = require('../config/db.config');

async function checkRequests() {
  try {
    const [rows] = await db.execute('SELECT * FROM password_reset_requests');
    console.log('--- Password Reset Requests ---');
    console.log(JSON.stringify(rows, null, 2));
    console.log('-------------------------------');
    process.exit(0);
  } catch (err) {
    console.error('Failed to query requests:', err.message);
    process.exit(1);
  }
}

checkRequests();
