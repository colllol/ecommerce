/**
 * RBAC Database Setup Script
 * Runs the RBAC migration SQL to create tables and seed data
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ecommerce_db',
    });

    console.log('Connected successfully!');
    console.log('Running full database schema setup...');

    // Read the full ecommerce_db.sql file
    const sqlPath = path.join(__dirname, '..', '..', 'ecommerce_db.sql');
    const schemaSQL = fs.readFileSync(sqlPath, 'utf8');

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

    console.log(`Executing ${statements.length} SQL statements...`);

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.query(statement);
        } catch (err) {
          // Ignore errors for existing tables/data
          if (!err.message.includes('already exists') && !err.message.includes('Duplicate entry')) {
            console.warn(`Warning: ${err.message}`);
          }
        }
      }
    }

    console.log('Schema setup completed successfully!');

    // Verify the setup
    console.log('\n=== Verification ===');
    
    const [roles] = await connection.query('SELECT * FROM Roles');
    console.log(`Roles created: ${roles.length}`);
    
    const [permissions] = await connection.query('SELECT * FROM Permissions');
    console.log(`Permissions created: ${permissions.length}`);
    
    const [userRoles] = await connection.query('SELECT COUNT(*) as count FROM User_Roles');
    console.log(`User-Role assignments: ${userRoles[0].count}`);
    
    const [rolePermissions] = await connection.query('SELECT COUNT(*) as count FROM Role_Permissions');
    console.log(`Role-Permission assignments: ${rolePermissions[0].count}`);

    console.log('\n=== Role Summary ===');
    const [roleSummary] = await connection.query(`
      SELECT r.name, COUNT(rp.permission_id) as permission_count
      FROM Roles r
      LEFT JOIN Role_Permissions rp ON r.id = rp.role_id
      GROUP BY r.id, r.name
    `);
    roleSummary.forEach(r => {
      console.log(`  ${r.name}: ${r.permission_count} permissions`);
    });

    console.log('\n=== User Role Assignments ===');
    const [userRoleAssignments] = await connection.query(`
      SELECT u.email, u.full_name, r.name as role
      FROM Users u
      JOIN User_Roles ur ON u.user_id = ur.user_id
      JOIN Roles r ON ur.role_id = r.id
    `);
    userRoleAssignments.forEach(u => {
      console.log(`  ${u.full_name} (${u.email}): ${u.role}`);
    });

    await connection.end();
    console.log('\n✅ RBAC setup complete!');
    
  } catch (error) {
    console.error('Migration failed:', error.message);
    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
}

runMigration();
