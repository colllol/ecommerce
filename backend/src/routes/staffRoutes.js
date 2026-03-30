const express = require('express');
const router = express.Router();
const StaffController = require('../controllers/staffController');
const { authenticate, authorizeAdmin, authorizeStaff } = require('../middlewares/authMiddleware');

// Admin only routes
router.get('/', authenticate, authorizeAdmin, StaffController.getAllStaff);
router.post('/', authenticate, authorizeAdmin, StaffController.createStaff);
router.put('/:id', authenticate, authorizeAdmin, StaffController.updateStaff);
router.delete('/:id', authenticate, authorizeAdmin, StaffController.removeStaff);

// Reports (admin only)
router.get('/reports/overview', authenticate, authorizeAdmin, StaffController.getReports);

// Staff can view their own activity
router.get('/my-activity', authenticate, authorizeStaff, StaffController.getMyActivity);

module.exports = router;
