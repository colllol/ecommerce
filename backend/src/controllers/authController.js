const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();
const UserModel = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

const AuthController = {
  async register(req, res) {
    try {
      const { full_name, email, phone, password } = req.body;

      if (!full_name || !email || !password) {
        return res.status(400).json({ message: 'full_name, email, password là bắt buộc' });
      }

      const existing = await UserModel.findByEmail(email);
      if (existing) {
        return res.status(409).json({ message: 'Email đã tồn tại' });
      }

      const password_hash = await bcrypt.hash(password, 10);
      const user = await UserModel.create({
        full_name,
        email,
        phone,
        password_hash,
        role: 'customer',
      });

      // Assign default Customer role
      const [roleResult] = await db.query('SELECT id FROM Roles WHERE name = ?', ['Customer']);
      
      if (roleResult.length > 0) {
        await db.query(
          'INSERT INTO User_Roles (user_id, role_id) VALUES (?, ?)',
          [user.user_id, roleResult[0].id]
        );
      }

      return res.status(201).json({
        message: 'Đăng ký thành công',
        user: {
          user_id: user.user_id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          status: user.status,
        },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'email và password là bắt buộc' });
      }

      const emailInput = String(email).trim();
      const passwordInput = String(password).trim();

      const user = await UserModel.findByEmail(emailInput);
      if (!user) {
        return res.status(401).json({ message: 'Email không tồn tại' });
      }

      if (user.status === 'inactive') {
        return res.status(403).json({ message: 'Tài khoản chưa được kích hoạt' });
      }
      if (user.status === 'blocked') {
        return res.status(403).json({ message: 'Tài khoản đã bị khóa' });
      }

      const storedRaw = user.password_hash ?? '';
      const stored = typeof storedRaw === 'string' ? storedRaw.trim() : String(storedRaw || '').trim();

      if (!stored) {
        console.error('[auth/login] user có email nhưng không có password_hash trong DB', { email: user.email });
        return res.status(500).json({ message: 'Cấu hình tài khoản lỗi, liên hệ admin' });
      }

      const looksLikeBcrypt = stored.startsWith('$2');
      let ok = false;
      if (looksLikeBcrypt) {
        ok = await bcrypt.compare(passwordInput, stored);
      } else {
        ok = passwordInput === stored;
      }

      if (!ok) {
        if (process.env.NODE_ENV !== 'production') {
          console.log('[auth/login] password mismatch', { email: user.email, role: user.role });
        }
        return res.status(401).json({ message: 'Mật khẩu không đúng' });
      }

      // Get user roles
      const [roles] = await db.query(`
        SELECT r.name 
        FROM Roles r
        JOIN User_Roles ur ON r.id = ur.role_id
        WHERE ur.user_id = ?
      `, [user.user_id]);

      // Get user permissions
      const [permissions] = await db.query(`
        SELECT DISTINCT p.name 
        FROM Permissions p
        JOIN Role_Permissions rp ON p.id = rp.permission_id
        JOIN User_Roles ur ON rp.role_id = ur.role_id
        WHERE ur.user_id = ?
      `, [user.user_id]);

      const roleNames = roles.map(r => r.name);
      const permissionNames = permissions.map(p => p.name);

      const payload = {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        roles: roleNames,
        permissions: permissionNames,
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      return res.json({
        token,
        user: {
          user_id: user.user_id,
          full_name: user.full_name,
          email: user.email,
          roles: roleNames,
          permissions: permissionNames,
        },
      });
    } catch (err) {
      console.error('[auth/login] error:', err?.message || err);
      const code = err?.code || err?.errno;
      if (code === 'ECONNREFUSED' || code === 'ENOTFOUND' || code === 'ER_ACCESS_DENIED_ERROR' || code === 'ETIMEDOUT') {
        return res.status(503).json({ message: 'Không kết nối được cơ sở dữ liệu. Kiểm tra MySQL và file .env' });
      }
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  /**
   * Get current user profile
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
        SELECT r.name 
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
          permissions: permissions.map(p => p.name),
        },
      });
    } catch (err) {
      console.error('[AuthController.getProfile] Error:', err.message);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },
};

module.exports = AuthController;
