const db = require('../config/db');

const RoleController = {
  /**
   * Get all roles with user count and permissions
   */
  async getAllRoles(req, res) {
    try {
      const [roles] = await db.query(`
        SELECT 
          r.id,
          r.name,
          r.description,
          r.created_at,
          COUNT(DISTINCT ur.user_id) as user_count,
          COUNT(DISTINCT rp.permission_id) as permission_count
        FROM Roles r
        LEFT JOIN User_Roles ur ON r.id = ur.role_id
        LEFT JOIN Role_Permissions rp ON r.id = rp.role_id
        GROUP BY r.id, r.name, r.description, r.created_at
        ORDER BY r.id
      `);

      return res.json({ roles });
    } catch (err) {
      console.error('[RoleController.getAllRoles] Error:', err.message);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  /**
   * Get role by ID with permissions and users
   */
  async getRoleById(req, res) {
    try {
      const roleId = req.params.id;

      const [roles] = await db.query('SELECT * FROM Roles WHERE id = ?', [roleId]);
      
      if (roles.length === 0) {
        return res.status(404).json({ message: 'Role không tồn tại' });
      }

      const role = roles[0];

      // Get permissions for this role
      const [permissions] = await db.query(`
        SELECT p.id, p.name, p.description
        FROM Permissions p
        JOIN Role_Permissions rp ON p.id = rp.permission_id
        WHERE rp.role_id = ?
        ORDER BY p.name
      `, [roleId]);

      // Get users with this role
      const [users] = await db.query(`
        SELECT u.user_id, u.full_name, u.email, u.status
        FROM Users u
        JOIN User_Roles ur ON u.user_id = ur.user_id
        WHERE ur.role_id = ?
        ORDER BY u.full_name
      `, [roleId]);

      return res.json({
        role: {
          ...role,
          permissions,
          users
        }
      });
    } catch (err) {
      console.error('[RoleController.getRoleById] Error:', err.message);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  /**
   * Create a new role
   */
  async createRole(req, res) {
    try {
      const { name, description } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ message: 'Tên role là bắt buộc' });
      }

      // Check if role already exists
      const [existing] = await db.query('SELECT id FROM Roles WHERE name = ?', [name.trim()]);
      if (existing.length > 0) {
        return res.status(409).json({ message: 'Role đã tồn tại' });
      }

      const [result] = await db.query(
        'INSERT INTO Roles (name, description) VALUES (?, ?)',
        [name.trim(), description || null]
      );

      const [newRole] = await db.query('SELECT * FROM Roles WHERE id = ?', [result.insertId]);

      return res.status(201).json({
        message: 'Tạo role thành công',
        role: newRole[0]
      });
    } catch (err) {
      console.error('[RoleController.createRole] Error:', err.message);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  /**
   * Update a role
   */
  async updateRole(req, res) {
    try {
      const roleId = req.params.id;
      const { name, description } = req.body;

      // Check if role exists
      const [existing] = await db.query('SELECT id FROM Roles WHERE id = ?', [roleId]);
      if (existing.length === 0) {
        return res.status(404).json({ message: 'Role không tồn tại' });
      }

      // Check if new name already exists (if name is being changed)
      if (name && name.trim()) {
        const [nameExists] = await db.query(
          'SELECT id FROM Roles WHERE name = ? AND id != ?',
          [name.trim(), roleId]
        );
        if (nameExists.length > 0) {
          return res.status(409).json({ message: 'Role đã tồn tại' });
        }
      }

      const updateFields = [];
      const updateValues = [];

      if (name && name.trim()) {
        updateFields.push('name = ?');
        updateValues.push(name.trim());
      }
      
      if (description !== undefined) {
        updateFields.push('description = ?');
        updateValues.push(description);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ message: 'Không có trường nào để cập nhật' });
      }

      updateValues.push(roleId);

      await db.query(
        `UPDATE Roles SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );

      const [updated] = await db.query('SELECT * FROM Roles WHERE id = ?', [roleId]);

      return res.json({
        message: 'Cập nhật role thành công',
        role: updated[0]
      });
    } catch (err) {
      console.error('[RoleController.updateRole] Error:', err.message);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  /**
   * Delete a role
   */
  async deleteRole(req, res) {
    try {
      const roleId = req.params.id;

      // Check if role exists
      const [existing] = await db.query('SELECT id FROM Roles WHERE id = ?', [roleId]);
      if (existing.length === 0) {
        return res.status(404).json({ message: 'Role không tồn tại' });
      }

      // Check if role is assigned to any users
      const [userCount] = await db.query(
        'SELECT COUNT(*) as count FROM User_Roles WHERE role_id = ?',
        [roleId]
      );

      if (userCount[0].count > 0) {
        return res.status(400).json({ 
          message: `Không thể xóa role đang được gán cho ${userCount[0].count} người dùng. Vui lòng gỡ vai trò khỏi người dùng trước.` 
        });
      }

      // Delete role (cascade will handle role_permissions)
      await db.query('DELETE FROM Roles WHERE id = ?', [roleId]);

      return res.json({ message: 'Xóa role thành công' });
    } catch (err) {
      console.error('[RoleController.deleteRole] Error:', err.message);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  /**
   * Assign permissions to a role (replaces existing permissions)
   */
  async assignPermissions(req, res) {
    try {
      const roleId = req.params.id;
      const { permissionIds } = req.body;

      if (!Array.isArray(permissionIds)) {
        return res.status(400).json({ message: 'permissionIds phải là một mảng' });
      }

      // Check if role exists
      const [role] = await db.query('SELECT id FROM Roles WHERE id = ?', [roleId]);
      if (role.length === 0) {
        return res.status(404).json({ message: 'Role không tồn tại' });
      }

      // Validate permission IDs
      if (permissionIds.length > 0) {
        const [validPermissions] = await db.query(
          'SELECT id FROM Permissions WHERE id IN (?)',
          [permissionIds]
        );

        if (validPermissions.length !== permissionIds.length) {
          return res.status(400).json({ message: 'Một hoặc nhiều permission ID không hợp lệ' });
        }
      }

      // Start transaction
      const connection = await db.getConnection();
      
      try {
        await connection.beginTransaction();

        // Delete existing permissions
        await connection.query('DELETE FROM Role_Permissions WHERE role_id = ?', [roleId]);

        // Insert new permissions
        if (permissionIds.length > 0) {
          const values = permissionIds.map(id => [roleId, id]);
          await connection.query(
            'INSERT INTO Role_Permissions (role_id, permission_id) VALUES ?',
            [values]
          );
        }

        await connection.commit();

        // Get updated permissions
        const [permissions] = await db.query(`
          SELECT p.id, p.name, p.description
          FROM Permissions p
          JOIN Role_Permissions rp ON p.id = rp.permission_id
          WHERE rp.role_id = ?
          ORDER BY p.name
        `, [roleId]);

        return res.json({
          message: 'Gán quyền thành công',
          permissions
        });
      } catch (err) {
        await connection.rollback();
        throw err;
      } finally {
        connection.release();
      }
    } catch (err) {
      console.error('[RoleController.assignPermissions] Error:', err.message);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  /**
   * Get all permissions (for dropdowns, etc.)
   */
  async getAllPermissions(req, res) {
    try {
      const [permissions] = await db.query(`
        SELECT 
          p.id,
          p.name,
          p.description,
          COUNT(DISTINCT rp.role_id) as role_count
        FROM Permissions p
        LEFT JOIN Role_Permissions rp ON p.id = rp.permission_id
        GROUP BY p.id, p.name, p.description
        ORDER BY p.name
      `);

      return res.json({ permissions });
    } catch (err) {
      console.error('[RoleController.getAllPermissions] Error:', err.message);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  }
};

module.exports = RoleController;
