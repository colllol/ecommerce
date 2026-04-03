const express = require('express');
const router = express.Router();
const StaffController = require('../controllers/staffController');
const { verifyToken, checkPermission } = require('../middlewares/authMiddleware');

// RBAC protected - Staff management
router.get('/', verifyToken, checkPermission('VIEW_USERS'), StaffController.getAllStaff);
router.post('/', verifyToken, checkPermission('CREATE_USER'), StaffController.createStaff);
router.put('/:id', verifyToken, checkPermission('EDIT_USER'), StaffController.updateStaff);
router.delete('/:id', verifyToken, checkPermission('DELETE_USER'), StaffController.removeStaff);

// RBAC protected - Reports (admin/manager)
router.get('/reports/overview', verifyToken, checkPermission('VIEW_DASHBOARD'), StaffController.getReports);

// RBAC protected - Staff can view their own activity
router.get('/my-activity', verifyToken, StaffController.getMyActivity);

module.exports = router;
