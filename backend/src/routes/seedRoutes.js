const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');

/**
 * TEMPORARY SEED ROUTE - DELETE AFTER USE!
 * Creates admin user if not exists
 * 
 * Usage: POST /api/seed/admin
 * WARNING: Delete this route after seeding!
 */
router.post('/admin', async (req, res) => {
  try {
    const { secret_key } = req.body;
    
    // Simple protection - change this to your own secret
    if (secret_key !== 'seed-admin-2024') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    console.log('[SEED] Starting admin user seed...');

    // 1. Create admin user if not exists
    const [existingUsers] = await db.query(
      'SELECT user_id FROM Users WHERE email = ?',
      ['admin@example.com']
    );

    if (existingUsers.length === 0) {
      const passwordHash = await bcrypt.hash('123456', 10);
      await db.query(
        `INSERT INTO Users (full_name, email, phone, password_hash, role, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['Admin User', 'admin@example.com', '0900000000', passwordHash, 'admin', 'active']
      );
      console.log('[SEED] Created admin user');
    } else {
      // Update password to known value
      const passwordHash = await bcrypt.hash('123456', 10);
      await db.query(
        'UPDATE Users SET password_hash = ?, status = ? WHERE email = ?',
        [passwordHash, 'active', 'admin@example.com']
      );
      console.log('[SEED] Updated admin user password');
    }

    // 2. Get admin user ID
    const [adminUser] = await db.query(
      'SELECT user_id FROM Users WHERE email = ?',
      ['admin@example.com']
    );
    const adminUserId = adminUser[0].user_id;

    // 3. Ensure Admin role exists
    const [adminRole] = await db.query(
      "SELECT id FROM Roles WHERE name = 'Admin'"
    );

    if (adminRole.length === 0) {
      await db.query(
        "INSERT INTO Roles (name, description) VALUES ('Admin', 'Quản trị viên')",
      );
      console.log('[SEED] Created Admin role');
    }

    // 4. Get Admin role ID
    const [adminRoleUpdated] = await db.query(
      "SELECT id FROM Roles WHERE name = 'Admin'"
    );
    const adminRoleId = adminRoleUpdated[0].id;

    // 5. Assign Admin role to admin user
    await db.query(
      'INSERT IGNORE INTO User_Roles (user_id, role_id) VALUES (?, ?)',
      [adminUserId, adminRoleId]
    );
    console.log('[SEED] Assigned Admin role to user');

    // 6. Ensure permissions exist
    const permissions = [
      ['VIEW_DASHBOARD', 'Xem trang dashboard'],
      ['CREATE_USER', 'Tạo người dùng mới'],
      ['EDIT_USER', 'Chỉnh sửa thông tin người dùng'],
      ['DELETE_USER', 'Xóa người dùng'],
      ['VIEW_USERS', 'Xem danh sách người dùng'],
      ['CREATE_ROLE', 'Tạo vai trò mới'],
      ['EDIT_ROLE', 'Chỉnh sửa vai trò'],
      ['DELETE_ROLE', 'Xóa vai trò'],
      ['VIEW_ROLES', 'Xem danh sách vai trò'],
      ['CREATE_PERMISSION', 'Tạo quyền mới'],
      ['EDIT_PERMISSION', 'Chỉnh sửa quyền'],
      ['DELETE_PERMISSION', 'Xóa quyền'],
      ['VIEW_PERMISSIONS', 'Xem danh sách quyền'],
      ['CREATE_PRODUCT', 'Tạo sản phẩm mới'],
      ['EDIT_PRODUCT', 'Chỉnh sửa sản phẩm'],
      ['DELETE_PRODUCT', 'Xóa sản phẩm'],
      ['VIEW_PRODUCTS', 'Xem danh sách sản phẩm'],
      ['VIEW_ORDERS', 'Xem danh sách đơn hàng'],
      ['EDIT_ORDER', 'Chỉnh sửa đơn hàng'],
      ['DELETE_ORDER', 'Xóa đơn hàng'],
      ['VIEW_INVENTORY', 'Xem kho hàng'],
      ['EDIT_INVENTORY', 'Chỉnh sửa kho hàng'],
    ];

    for (const [name, desc] of permissions) {
      await db.query(
        'INSERT INTO Permissions (name, description) VALUES (?, ?) ON DUPLICATE KEY UPDATE description = description',
        [name, desc]
      );
    }
    console.log('[SEED] Created permissions');

    // 7. Assign all permissions to Admin role
    const [allPermissions] = await db.query('SELECT id FROM Permissions');
    for (const perm of allPermissions) {
      await db.query(
        'INSERT IGNORE INTO Role_Permissions (role_id, permission_id) VALUES (?, ?)',
        [adminRoleId, perm.id]
      );
    }
    console.log('[SEED] Assigned all permissions to Admin role');

    // 8. Verify
    const [verifyRoles] = await db.query(
      'SELECT r.name FROM Roles r JOIN User_Roles ur ON r.id = ur.role_id WHERE ur.user_id = ?',
      [adminUserId]
    );

    const [verifyPermissions] = await db.query(
      `SELECT COUNT(*) as total FROM Permissions p
       JOIN Role_Permissions rp ON p.id = rp.permission_id
       JOIN Roles r ON rp.role_id = r.id
       WHERE r.name = 'Admin'`
    );

    console.log('[SEED] Admin user seeded successfully');

    return res.json({
      message: 'Admin user seeded successfully',
      user: {
        email: 'admin@example.com',
        password: '123456',
        roles: verifyRoles.map(r => r.name),
        total_permissions: verifyPermissions[0].total,
      },
      WARNING: 'DELETE THIS ROUTE AFTER USE!',
    });
  } catch (err) {
    console.error('[SEED] Error:', err.message);
    return res.status(500).json({ message: 'Seed failed', error: err.message });
  }
});

module.exports = router;
