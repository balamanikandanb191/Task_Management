const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function runSchema() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true
    });

    const schemaPath = path.join(__dirname, 'models', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log("Executing schema...");
    await connection.query(schemaSql);
    console.log("Schema executed successfully!");

    await connection.end();
  } catch (error) {
    console.error("Error executing schema:", error);
  }
}

runSchema();
