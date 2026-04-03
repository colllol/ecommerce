const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const apiRoutes = require('./routes');

const app = express();

// CORS configuration for production
const corsOptions = {
  origin: process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',')
    : '*',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Ecommerce API running' });
});

// Temporary setup endpoint - DELETE after setup!
app.post('/api/setup', async (req, res) => {
  const { token } = req.body;
  const SETUP_TOKEN = process.env.SETUP_TOKEN || 'temp-setup-token-change-me';
  
  if (token !== SETUP_TOKEN) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  let connection;
  const logs = [];
  
  try {
    console.log('Setup endpoint called - connecting to database...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'railway',
    });

    logs.push('Connected successfully!');
    console.log('Connected successfully!');

    // Read the full ecommerce_db.sql file
    const sqlPath = path.join(__dirname, '..', 'ecommerce_db.sql');
    const schemaSQL = fs.readFileSync(sqlPath, 'utf8');

    logs.push('Executing schema SQL...');
    console.log('Executing schema SQL...');
    
    // Remove comment lines
    const cleanedSQL = schemaSQL
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim().length > 0)
      .join('\n');

    // Split by semicolons and execute each statement
    const statements = cleanedSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    logs.push(`Executing ${statements.length} SQL statements...`);
    console.log(`Executing ${statements.length} SQL statements...`);

    let successCount = 0;
    let skipCount = 0;

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.query(statement);
          successCount++;
        } catch (err) {
          if (err.message.includes('already exists') || err.message.includes('Duplicate entry')) {
            skipCount++;
          } else {
            logs.push(`Warning: ${err.message}`);
            console.warn(`Warning: ${err.message}`);
          }
        }
      }
    }

    logs.push(`Schema setup completed! (${successCount} executed, ${skipCount} skipped)`);
    console.log('Schema setup completed successfully!');

    // Verify
    logs.push('\n=== Verification ===');
    const [roles] = await connection.query('SELECT COUNT(*) as count FROM Roles');
    logs.push(`Roles: ${roles[0].count}`);
    const [permissions] = await connection.query('SELECT COUNT(*) as count FROM Permissions');
    logs.push(`Permissions: ${permissions[0].count}`);
    const [users] = await connection.query('SELECT COUNT(*) as count FROM Users');
    logs.push(`Users: ${users[0].count}`);
    const [products] = await connection.query('SELECT COUNT(*) as count FROM Products');
    logs.push(`Products: ${products[0].count}`);

    await connection.end();
    logs.push('\n✅ Database setup complete!');
    logs.push('⚠️ DELETE this endpoint now!');

    res.json({ success: true, logs });

  } catch (error) {
    console.error('Setup failed:', error.message);
    logs.push(`ERROR: ${error.message}`);
    if (connection) await connection.end();
    res.status(500).json({ success: false, message: error.message, logs });
  }
});

app.use('/api', apiRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'Không tìm thấy API' });
});

// error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'JSON body không hợp lệ' });
  }

  const status = err?.statusCode || err?.status || 500;
  return res.status(status).json({ message: status === 500 ? 'Lỗi server' : 'Yêu cầu không hợp lệ' });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Ecommerce API listening on port ${PORT}`);
});

