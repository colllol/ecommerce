const express = require('express');
const PaymentController = require('../controllers/paymentController');
const { verifyToken, checkPermission } = require('../middlewares/authMiddleware');

const router = express.Router();

// RBAC protected - admin quản lý thanh toán
router.get('/', verifyToken, checkPermission('VIEW_ORDERS'), PaymentController.getAll);
router.get('/:id', verifyToken, checkPermission('VIEW_ORDERS'), PaymentController.getById);
router.get('/by-order/:orderId', verifyToken, checkPermission('VIEW_ORDERS'), PaymentController.getByOrder);
router.post('/', verifyToken, checkPermission('EDIT_ORDER'), PaymentController.create);
router.put('/:id', verifyToken, checkPermission('EDIT_ORDER'), PaymentController.update);
router.delete('/:id', verifyToken, checkPermission('DELETE_ORDER'), PaymentController.remove);

module.exports = router;

