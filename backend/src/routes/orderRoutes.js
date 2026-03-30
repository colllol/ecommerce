const express = require('express');
const OrderController = require('../controllers/orderController');
const { authenticate, authorizeAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// khách hàng xem đơn của mình
router.get('/my', authenticate, OrderController.getByCurrentUser);
router.post('/', authenticate, OrderController.create);
// khách hàng có thể xóa đơn của mình (chỉ khi pending)
router.delete('/:id', authenticate, OrderController.remove);

// admin quản lý tất cả đơn
router.get('/', authenticate, authorizeAdmin, OrderController.getAll);
router.get('/:id', authenticate, authorizeAdmin, OrderController.getById);
router.put('/:id', authenticate, authorizeAdmin, OrderController.update);

module.exports = router;

