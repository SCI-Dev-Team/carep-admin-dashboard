const mysql = require('mysql2/promise');
const fs = require('fs');
(async () => {
  const sql = fs.readFileSync('/Users/thun/Desktop/Project/sci-project/cucumber-tele-bot/db_sql/migration_add_label_to_user_uploads.sql', 'utf8');
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'db_user',
    password: 'db_password',
    database: 'db-name'
  });
  await conn.query(sql);
  await conn.end();
  console.log('Migration applied');
})().catch(e => { console.error(e); process.exit(1); });