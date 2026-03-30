const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { verifyToken, checkPermission } = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(verifyToken);

// GET /api/roles - Get all roles
router.get('/', checkPermission('VIEW_ROLES'), roleController.getAllRoles);

// GET /api/roles/:id - Get role by ID
router.get('/:id', checkPermission('VIEW_ROLES'), roleController.getRoleById);

// POST /api/roles - Create new role
router.post('/', checkPermission('CREATE_ROLE'), roleController.createRole);

// PUT /api/roles/:id - Update role
router.put('/:id', checkPermission('EDIT_ROLE'), roleController.updateRole);

// DELETE /api/roles/:id - Delete role
router.delete('/:id', checkPermission('DELETE_ROLE'), roleController.deleteRole);

// POST /api/roles/:id/permissions - Assign permissions to role
router.post('/:id/permissions', checkPermission('EDIT_ROLE'), roleController.assignPermissions);

// GET /api/roles/permissions/list - Get all permissions (for dropdowns)
router.get('/permissions/list', roleController.getAllPermissions);

module.exports = router;
