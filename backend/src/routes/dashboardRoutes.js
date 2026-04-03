const express = require('express');
const DashboardController = require('../controllers/dashboardController');
const { verifyToken, checkPermission } = require('../middlewares/authMiddleware');

const router = express.Router();

// GET /api/dashboard/stats - Get dashboard statistics (role-aware)
router.get('/stats', verifyToken, checkPermission('VIEW_DASHBOARD'), DashboardController.getStats);

module.exports = router;
