const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

(async () => {
  // Use relative path from script location
  const sqlPath = path.join(__dirname, '../../db_sql/cabbage_cure_schema.sql');
  console.log(`Reading SQL file: ${sqlPath}`);
  
  const sql = fs.readFileSync(sqlPath, 'utf8');
  
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'db_user',
    password: process.env.DB_PASSWORD || 'db_password',
    database: process.env.DB_NAME || 'db-name',
    multipleStatements: true  // Enable multiple SQL statements
  });
  
  console.log('Executing migration...');
  await conn.query(sql);
  await conn.end();
  
  console.log('✅ Cabbage diseases migration applied successfully!');
})().catch(e => { 
  console.error('❌ Migration failed:', e.message); 
  process.exit(1); 
});