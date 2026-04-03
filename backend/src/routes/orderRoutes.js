const express = require('express');
const OrderController = require('../controllers/orderController');
const { verifyToken, checkPermission } = require('../middlewares/authMiddleware');

const router = express.Router();

// khách hàng xem đơn của mình
router.get('/my', verifyToken, OrderController.getByCurrentUser);
router.post('/', verifyToken, OrderController.create);
// khách hàng có thể xóa đơn của mình (chỉ khi pending)
router.delete('/:id', verifyToken, OrderController.remove);

// RBAC protected - admin quản lý tất cả đơn
router.get('/', verifyToken, checkPermission('VIEW_ORDERS'), OrderController.getAll);
router.get('/:id', verifyToken, checkPermission('VIEW_ORDERS'), OrderController.getById);
router.put('/:id', verifyToken, checkPermission('EDIT_ORDER'), OrderController.update);
router.delete('/admin/:id', verifyToken, checkPermission('DELETE_ORDER'), OrderController.removeAdmin);

module.exports = router;

