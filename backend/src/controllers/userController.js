const bcrypt = require('bcryptjs');
const db = require('../config/db');
const UserModel = require('../models/userModel');

const UserController = {
  /**
   * Get all users with their roles
   */
  async getAll(req, res) {
    try {
      const users = await UserModel.findAll();
      
      // Enrich each user with roles
      const usersWithRoles = await Promise.all(
        users.map(async (user) => {
          const [roles] = await db.query(`
            SELECT r.id, r.name, r.description
            FROM Roles r
            JOIN User_Roles ur ON r.id = ur.role_id
            WHERE ur.user_id = ?
          `, [user.user_id]);

          return {
            ...user,
            roles: roles.map(r => r.name),
            roleDetails: roles
          };
        })
      );

      return res.json({ users: usersWithRoles });
    } catch (err) {
      console.error('[UserController.getAll] Error:', err.message);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  /**
   * Get user by ID with roles and permissions
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const user = await UserModel.findById(id);
      
      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy user' });
      }

      // Get roles
      const [roles] = await db.query(`
        SELECT r.id, r.name, r.description
        FROM Roles r
        JOIN User_Roles ur ON r.id = ur.role_id
        WHERE ur.user_id = ?
      `, [user.user_id]);

      // Get permissions
      const [permissions] = await db.query(`
        SELECT DISTINCT p.id, p.name, p.description
        FROM Permissions p
        JOIN Role_Permissions rp ON p.id = rp.permission_id
        JOIN User_Roles ur ON rp.role_id = ur.role_id
        WHERE ur.user_id = ?
      `, [user.user_id]);

      return res.json({
        user: {
          ...user,
          roles: roles.map(r => r.name),
          roleDetails: roles,
          permissions: permissions.map(p => p.name),
          permissionDetails: permissions
        }
      });
    } catch (err) {
      console.error('[UserController.getById] Error:', err.message);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  /**
   * Create a new user
   */
  async create(req, res) {
    try {
      const { full_name, email, phone, password, role = 'customer', status = 'active' } = req.body;
      
      if (!full_name || !email || !password) {
        return res.status(400).json({ message: 'full_name, email, password là bắt buộc' });
      }

      const existing = await UserModel.findByEmail(email);
      if (existing) {
        return res.status(409).json({ message: 'Email đã tồn tại' });
      }

      const password_hash = await bcrypt.hash(password, 10);
      const user = await UserModel.create({ full_name, email, phone, password_hash, role, status });

      // Assign default Customer role
      const [roleResult] = await db.query('SELECT id FROM Roles WHERE name = ?', [role === 'admin' ? 'Admin' : role === 'staff' ? 'Staff' : 'Customer']);
      
      if (roleResult.length > 0) {
        await db.query(
          'INSERT INTO User_Roles (user_id, role_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE role_id = ?',
          [user.user_id, roleResult[0].id, roleResult[0].id]
        );
      }

      return res.status(201).json({
        message: 'Tạo user thành công',
        user: {
          user_id: user.user_id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          status: user.status
        }
      });
    } catch (err) {
      console.error('[UserController.create] Error:', err.message);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  /**
   * Update a user
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const { password, ...rest } = req.body;

      const user = await UserModel.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy user' });
      }

      const dataToUpdate = { ...rest };

      if (password) {
        dataToUpdate.password_hash = await bcrypt.hash(password, 10);
      }

      const updated = await UserModel.update(id, dataToUpdate);
      
      return res.json({
        message: 'Cập nhật user thành công',
        user: updated
      });
    } catch (err) {
      console.error('[UserController.update] Error:', err.message);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  /**
   * Delete a user
   */
  async remove(req, res) {
    try {
      const { id } = req.params;
      const ok = await UserModel.remove(id);
      
      if (!ok) {
        return res.status(404).json({ message: 'Không tìm thấy user' });
      }
      
      return res.json({ message: 'Xóa user thành công' });
    } catch (err) {
      console.error('[UserController.remove] Error:', err.message);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  /**
   * Assign roles to a user (replaces existing roles)
   */
  async assignRoles(req, res) {
    try {
      const { id } = req.params;
      const { roleIds } = req.body;

      if (!Array.isArray(roleIds)) {
        return res.status(400).json({ message: 'roleIds phải là một mảng' });
      }

      // Check if user exists
      const user = await UserModel.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'User không tồn tại' });
      }

      // Validate role IDs
      if (roleIds.length > 0) {
        const [validRoles] = await db.query(
          'SELECT id FROM Roles WHERE id IN (?)',
          [roleIds]
        );

        if (validRoles.length !== roleIds.length) {
          return res.status(400).json({ message: 'Một hoặc nhiều role ID không hợp lệ' });
        }
      }

      // Start transaction
      const connection = await db.getConnection();

      try {
        await connection.beginTransaction();

        // Delete existing roles
        await connection.query('DELETE FROM User_Roles WHERE user_id = ?', [id]);

        // Insert new roles
        if (roleIds.length > 0) {
          const values = roleIds.map(rid => [id, rid]);
          await connection.query(
            'INSERT INTO User_Roles (user_id, role_id) VALUES ?',
            [values]
          );
        }

        await connection.commit();

        // Get updated roles
        const [roles] = await db.query(`
          SELECT r.id, r.name, r.description
          FROM Roles r
          JOIN User_Roles ur ON r.id = ur.role_id
          WHERE ur.user_id = ?
        `, [id]);

        // Get updated permissions
        const [permissions] = await db.query(`
          SELECT DISTINCT p.name
          FROM Permissions p
          JOIN Role_Permissions rp ON p.id = rp.permission_id
          JOIN User_Roles ur ON rp.role_id = ur.role_id
          WHERE ur.user_id = ?
        `, [id]);

        return res.json({
          message: 'Gán vai trò thành công',
          roles: roles.map(r => r.name),
          roleDetails: roles,
          permissions: permissions
        });
      } catch (err) {
        await connection.rollback();
        throw err;
      } finally {
        connection.release();
      }
    } catch (err) {
      console.error('[UserController.assignRoles] Error:', err.message);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  /**
   * Get user's current profile with roles and permissions
   */
  async getProfile(req, res) {
    try {
      const userId = req.user.user_id;
      
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User không tồn tại' });
      }

      // Get roles
      const [roles] = await db.query(`
        SELECT r.id, r.name, r.description
        FROM Roles r
        JOIN User_Roles ur ON r.id = ur.role_id
        WHERE ur.user_id = ?
      `, [userId]);

      // Get permissions
      const [permissions] = await db.query(`
        SELECT DISTINCT p.name
        FROM Permissions p
        JOIN Role_Permissions rp ON p.id = rp.permission_id
        JOIN User_Roles ur ON rp.role_id = ur.role_id
        WHERE ur.user_id = ?
      `, [userId]);

      return res.json({
        user: {
          user_id: user.user_id,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          status: user.status,
          roles: roles.map(r => r.name),
          roleDetails: roles,
          permissions: permissions.map(p => p.name)
        }
      });
    } catch (err) {
      console.error('[UserController.getProfile] Error:', err.message);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  }
};

module.exports = UserController;
