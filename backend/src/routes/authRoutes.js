const express = require('express');
const AuthController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// POST /api/auth/register - Register new user
router.post('/register', AuthController.register);

// POST /api/auth/login - Login
router.post('/login', AuthController.login);

// GET /api/auth/profile - Get current user profile (requires auth)
router.get('/profile', verifyToken, AuthController.getProfile);

// POST /api/auth/unauthorized - Return 403 for frontend redirect
router.post('/unauthorized', (req, res) => {
  return res.status(403).json({ message: 'Bạn không có quyền truy cập trang này' });
});

module.exports = router;
