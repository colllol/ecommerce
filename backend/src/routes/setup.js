/**
 * Temporary Setup Endpoint for Railway Database
 * Runs the database setup script via HTTP request
 * DELETE THIS FILE after setup is complete!
 */

const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Only allow in production with secret token
const SETUP_TOKEN = process.env.SETUP_TOKEN || 'temp-setup-token-change-me';

router.post('/', async (req, res) => {
  const { token } = req.body;
  
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
    const sqlPath = path.join(__dirname, '..', '..', 'ecommerce_db.sql');
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
          // Ignore errors for existing tables/data
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

    // Verify the setup
    logs.push('\n=== Verification ===');
    console.log('\n=== Verification ===');

    const [roles] = await connection.query('SELECT COUNT(*) as count FROM Roles');
    logs.push(`Roles created: ${roles[0].count}`);
    console.log(`Roles created: ${roles[0].count}`);

    const [permissions] = await connection.query('SELECT COUNT(*) as count FROM Permissions');
    logs.push(`Permissions created: ${permissions[0].count}`);
    console.log(`Permissions created: ${permissions[0].count}`);

    const [users] = await connection.query('SELECT COUNT(*) as count FROM Users');
    logs.push(`Users created: ${users[0].count}`);
    console.log(`Users created: ${users[0].count}`);

    const [products] = await connection.query('SELECT COUNT(*) as count FROM Products');
    logs.push(`Products created: ${products[0].count}`);
    console.log(`Products created: ${products[0].count}`);

    await connection.end();
    
    logs.push('\n✅ Database setup complete!');
    logs.push('⚠️ IMPORTANT: Delete /src/routes/setup.js file now!');

    res.json({ 
      success: true, 
      message: 'Database setup completed successfully!',
      logs: logs 
    });

  } catch (error) {
    console.error('Setup failed:', error.message);
    logs.push(`ERROR: ${error.message}`);
    if (connection) {
      await connection.end();
    }
    res.status(500).json({ 
      success: false, 
      message: error.message,
      logs: logs 
    });
  }
});

module.exports = router;
