const db = require('../config/db');

const PermissionController = {
  /**
   * Get all permissions with role count
   */
  async getAllPermissions(req, res) {
    try {
      const [permissions] = await db.query(`
        SELECT 
          p.id,
          p.name,
          p.description,
          p.created_at,
          COUNT(DISTINCT rp.role_id) as role_count
        FROM Permissions p
        LEFT JOIN Role_Permissions rp ON p.id = rp.permission_id
        GROUP BY p.id, p.name, p.description, p.created_at
        ORDER BY p.name
      `);

      return res.json({ permissions });
    } catch (err) {
      console.error('[PermissionController.getAllPermissions] Error:', err.message);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  /**
   * Get permission by ID with roles
   */
  async getPermissionById(req, res) {
    try {
      const permissionId = req.params.id;

      const [perms] = await db.query('SELECT * FROM Permissions WHERE id = ?', [permissionId]);
      
      if (perms.length === 0) {
        return res.status(404).json({ message: 'Permission không tồn tại' });
      }

      const permission = perms[0];

      // Get roles with this permission
      const [roles] = await db.query(`
        SELECT r.id, r.name, r.description
        FROM Roles r
        JOIN Role_Permissions rp ON r.id = rp.role_id
        WHERE rp.permission_id = ?
        ORDER BY r.name
      `, [permissionId]);

      return res.json({
        permission: {
          ...permission,
          roles
        }
      });
    } catch (err) {
      console.error('[PermissionController.getPermissionById] Error:', err.message);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  /**
   * Create a new permission
   */
  async createPermission(req, res) {
    try {
      const { name, description } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ message: 'Tên permission là bắt buộc' });
      }

      // Check if permission already exists
      const [existing] = await db.query('SELECT id FROM Permissions WHERE name = ?', [name.trim()]);
      if (existing.length > 0) {
        return res.status(409).json({ message: 'Permission đã tồn tại' });
      }

      const [result] = await db.query(
        'INSERT INTO Permissions (name, description) VALUES (?, ?)',
        [name.trim(), description || null]
      );

      const [newPermission] = await db.query('SELECT * FROM Permissions WHERE id = ?', [result.insertId]);

      return res.status(201).json({
        message: 'Tạo permission thành công',
        permission: newPermission[0]
      });
    } catch (err) {
      console.error('[PermissionController.createPermission] Error:', err.message);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  /**
   * Update a permission
   */
  async updatePermission(req, res) {
    try {
      const permissionId = req.params.id;
      const { name, description } = req.body;

      // Check if permission exists
      const [existing] = await db.query('SELECT id FROM Permissions WHERE id = ?', [permissionId]);
      if (existing.length === 0) {
        return res.status(404).json({ message: 'Permission không tồn tại' });
      }

      // Check if new name already exists (if name is being changed)
      if (name && name.trim()) {
        const [nameExists] = await db.query(
          'SELECT id FROM Permissions WHERE name = ? AND id != ?',
          [name.trim(), permissionId]
        );
        if (nameExists.length > 0) {
          return res.status(409).json({ message: 'Permission đã tồn tại' });
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

      updateValues.push(permissionId);

      await db.query(
        `UPDATE Permissions SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );

      const [updated] = await db.query('SELECT * FROM Permissions WHERE id = ?', [permissionId]);

      return res.json({
        message: 'Cập nhật permission thành công',
        permission: updated[0]
      });
    } catch (err) {
      console.error('[PermissionController.updatePermission] Error:', err.message);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  /**
   * Delete a permission
   */
  async deletePermission(req, res) {
    try {
      const permissionId = req.params.id;

      // Check if permission exists
      const [existing] = await db.query('SELECT id FROM Permissions WHERE id = ?', [permissionId]);
      if (existing.length === 0) {
        return res.status(404).json({ message: 'Permission không tồn tại' });
      }

      // Check if permission is assigned to any roles
      const [roleCount] = await db.query(
        'SELECT COUNT(*) as count FROM Role_Permissions WHERE permission_id = ?',
        [permissionId]
      );

      if (roleCount[0].count > 0) {
        return res.status(400).json({ 
          message: `Không thể xóa permission đang được gán cho ${roleCount[0].count} role. Vui lòng gỡ quyền khỏi các role trước.` 
        });
      }

      // Delete permission (cascade will handle role_permissions)
      await db.query('DELETE FROM Permissions WHERE id = ?', [permissionId]);

      return res.json({ message: 'Xóa permission thành công' });
    } catch (err) {
      console.error('[PermissionController.deletePermission] Error:', err.message);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  }
};

module.exports = PermissionController;
