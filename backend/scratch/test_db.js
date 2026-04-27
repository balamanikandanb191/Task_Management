const db = require('./config/db.config');

async function testDB() {
  try {
    const [rows] = await db.execute('SHOW TABLES LIKE "password_reset_requests"');
    console.log('Table exists:', rows.length > 0);
    if (rows.length > 0) {
      const [cols] = await db.execute('DESCRIBE password_reset_requests');
      console.log('Columns:', cols.map(c => c.Field));
    }
    process.exit(0);
  } catch (err) {
    console.error('DB Test Failed:', err.message);
    process.exit(1);
  }
}

testDB();
