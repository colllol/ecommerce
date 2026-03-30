const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');
const { verifyToken, checkPermission } = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(verifyToken);

// GET /api/permissions - Get all permissions
router.get('/', checkPermission('VIEW_PERMISSIONS'), permissionController.getAllPermissions);

// GET /api/permissions/:id - Get permission by ID
router.get('/:id', checkPermission('VIEW_PERMISSIONS'), permissionController.getPermissionById);

// POST /api/permissions - Create new permission
router.post('/', checkPermission('CREATE_PERMISSION'), permissionController.createPermission);

// PUT /api/permissions/:id - Update permission
router.put('/:id', checkPermission('EDIT_PERMISSION'), permissionController.updatePermission);

// DELETE /api/permissions/:id - Delete permission
router.delete('/:id', checkPermission('DELETE_PERMISSION'), permissionController.deletePermission);

module.exports = router;
