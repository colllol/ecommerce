const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

/**
 * Verify JWT token from Authorization header
 * Attaches user info to req.user
 */
async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      message: 'Unauthorized - Token không được cung cấp' 
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('[verifyToken] Token validation error:', err.message);
    return res.status(401).json({ 
      message: 'Unauthorized - Token không hợp lệ hoặc đã hết hạn' 
    });
  }
}

/**
 * Get user roles from database
 * @param {number} userId - User ID
 * @returns {Promise<Array>} - Array of role names
 */
async function getUserRoles(userId) {
  try {
    const [rows] = await db.query(`
      SELECT r.name 
      FROM Roles r
      JOIN User_Roles ur ON r.id = ur.role_id
      WHERE ur.user_id = ?
    `, [userId]);
    return rows.map(r => r.name);
  } catch (err) {
    console.error('[getUserRoles] Error:', err.message);
    return [];
  }
}

/**
 * Get user permissions from database
 * @param {number} userId - User ID
 * @returns {Promise<Array>} - Array of permission names
 */
async function getUserPermissions(userId) {
  try {
    const [rows] = await db.query(`
      SELECT DISTINCT p.name 
      FROM Permissions p
      JOIN Role_Permissions rp ON p.id = rp.permission_id
      JOIN User_Roles ur ON rp.role_id = ur.role_id
      WHERE ur.user_id = ?
    `, [userId]);
    return rows.map(p => p.name);
  } catch (err) {
    console.error('[getUserPermissions] Error:', err.message);
    return [];
  }
}

/**
 * Enrich user object with roles and permissions
 * @param {Object} user - User object with user_id
 * @returns {Promise<Object>} - User with roles and permissions
 */
async function enrichUserWithRBAC(user) {
  if (!user || !user.user_id) {
    return user;
  }

  const [roles, permissions] = await Promise.all([
    getUserRoles(user.user_id),
    getUserPermissions(user.user_id)
  ]);

  return {
    ...user,
    roles,
    permissions
  };
}

/**
 * Check if user has ANY of the specified roles
 * @param  {...string} roles - Role names to check
 * @returns {Function} - Middleware function
 */
function checkRole(...roles) {
  return async (req, res, next) => {
    if (!req.user || !req.user.user_id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userRoles = await getUserRoles(req.user.user_id);
    
    const hasRole = roles.some(role => userRoles.includes(role));
    
    if (!hasRole) {
      return res.status(403).json({ 
        message: `Forbidden - Yêu cầu một trong các vai trò: ${roles.join(', ')}` 
      });
    }

    next();
  };
}

/**
 * Check if user has ANY of the specified permissions
 * @param  {...string} permissions - Permission names to check
 * @returns {Function} - Middleware function
 */
function checkPermission(...permissions) {
  return async (req, res, next) => {
    if (!req.user || !req.user.user_id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userPermissions = await getUserPermissions(req.user.user_id);
    
    const hasPermission = permissions.some(perm => userPermissions.includes(perm));
    
    if (!hasPermission) {
      return res.status(403).json({ 
        message: `Forbidden - Yêu cầu một trong các quyền: ${permissions.join(', ')}` 
      });
    }

    next();
  };
}

/**
 * Check if user has ALL of the specified permissions
 * @param  {...string} permissions - Permission names to check
 * @returns {Function} - Middleware function
 */
function checkAllPermissions(...permissions) {
  return async (req, res, next) => {
    if (!req.user || !req.user.user_id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userPermissions = await getUserPermissions(req.user.user_id);
    
    const hasAllPermissions = permissions.every(perm => userPermissions.includes(perm));
    
    if (!hasAllPermissions) {
      const missing = permissions.filter(p => !userPermissions.includes(p));
      return res.status(403).json({ 
        message: `Forbidden - Thiếu quyền: ${missing.join(', ')}` 
      });
    }

    next();
  };
}

// Legacy middleware for backward compatibility
function authenticate(req, res, next) {
  return verifyToken(req, res, next);
}

async function authorizeAdmin(req, res, next) {
  if (!req.user || !req.user.user_id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userRoles = await getUserRoles(req.user.user_id);
  
  if (!userRoles.includes('Admin')) {
    return res.status(403).json({ message: 'Forbidden - Admin only' });
  }
  
  next();
}

async function authorizeStaff(req, res, next) {
  if (!req.user || !req.user.user_id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userRoles = await getUserRoles(req.user.user_id);
  
  if (!userRoles.includes('Staff') && !userRoles.includes('Admin')) {
    return res.status(403).json({ message: 'Forbidden - Staff only' });
  }
  
  next();
}

async function authorizeAdminOrStaff(req, res, next) {
  if (!req.user || !req.user.user_id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userRoles = await getUserRoles(req.user.user_id);
  
  if (!userRoles.includes('Admin') && !userRoles.includes('Staff')) {
    return res.status(403).json({ message: 'Forbidden - Admin or Staff only' });
  }
  
  next();
}

module.exports = {
  verifyToken,
  authenticate,
  checkRole,
  checkPermission,
  checkAllPermissions,
  getUserRoles,
  getUserPermissions,
  enrichUserWithRBAC,
  authorizeAdmin,
  authorizeStaff,
  authorizeAdminOrStaff,
};
