const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function updatePasswords() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    const hash = await bcrypt.hash('123456', 10);
    console.log('Generated hash:', hash);

    await connection.query(`USE ${process.env.DB_NAME}`);
    
    const [result] = await connection.query(
      'UPDATE Users SET password_hash = ?',
      [hash]
    );

    console.log(`Updated ${result.affectedRows} users`);
    console.log('All passwords are now: 123456');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    if (connection) await connection.end();
  }
}

updatePasswords();
