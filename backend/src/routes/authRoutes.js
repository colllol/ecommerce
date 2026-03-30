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

module.exports = router;
