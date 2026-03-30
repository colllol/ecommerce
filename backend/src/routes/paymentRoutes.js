const express = require('express');
const PaymentController = require('../controllers/paymentController');
const { authenticate, authorizeAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// admin quản lý thanh toán
router.get('/', authenticate, authorizeAdmin, PaymentController.getAll);
router.get('/:id', authenticate, authorizeAdmin, PaymentController.getById);
router.get('/by-order/:orderId', authenticate, authorizeAdmin, PaymentController.getByOrder);
router.post('/', authenticate, authorizeAdmin, PaymentController.create);
router.put('/:id', authenticate, authorizeAdmin, PaymentController.update);
router.delete('/:id', authenticate, authorizeAdmin, PaymentController.remove);

module.exports = router;

