const express = require('express');
const UserController = require('../controllers/userController');
const { verifyToken, checkPermission } = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// GET /api/users - Get all users
router.get('/', checkPermission('VIEW_USERS'), UserController.getAll);

// GET /api/users/:id - Get user by ID
router.get('/:id', checkPermission('VIEW_USERS'), UserController.getById);

// POST /api/users - Create new user
router.post('/', checkPermission('CREATE_USER'), UserController.create);

// PUT /api/users/:id - Update user
router.put('/:id', checkPermission('EDIT_USER'), UserController.update);

// DELETE /api/users/:id - Delete user
router.delete('/:id', checkPermission('DELETE_USER'), UserController.remove);

// POST /api/users/:id/roles - Assign roles to user
router.post('/:id/roles', checkPermission('EDIT_USER'), UserController.assignRoles);

// GET /api/users/profile - Get current user profile
router.get('/profile/me', UserController.getProfile);

module.exports = router;
