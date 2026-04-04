const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ecommerce_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // SSL configuration for Aiven/Cloud MySQL
  // In production, enable SSL. For Aiven, we use simple SSL without CA verification
  ssl: process.env.NODE_ENV === 'production' ? {} : undefined,
});

// Test connection on startup
pool.getConnection()
  .then(conn => {
    console.log('✅ Database connected successfully to:', process.env.DB_HOST);
    conn.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    console.error('DB config:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      database: process.env.DB_NAME
    });
  });

module.exports = pool;

