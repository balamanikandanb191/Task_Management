const db = require('./config/db.config');

async function updateSchema() {
  try {
    console.log('Updating schema...');
    await db.execute(`
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
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_pwd_reset_email ON password_reset_requests(email)`);
    console.log('Schema updated successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error updating schema:', err.message);
    process.exit(1);
  }
}

updateSchema();
