require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const mysql = require('mysql2/promise');

const migrations = [
  'migrate_demo_ready.sql',
  'migrate_enterprise_features.sql',
];

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hoc_lieu_so_db',
    multipleStatements: true,
  });

  try {
    for (const file of migrations) {
      const fullPath = path.join(__dirname, '..', 'database', file);
      const sql = fs.readFileSync(fullPath, 'utf8');
      process.stdout.write(`[migration] ${file} ... `);
      await connection.query(sql);
      console.log('OK');
    }
    console.log('[migration] Database is ready for DocShare enterprise features.');
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error('[migration] FAILED:', error.message);
  process.exitCode = 1;
});
