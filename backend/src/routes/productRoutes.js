const express = require('express');
const ProductController = require('../controllers/productController');
const { verifyToken, checkPermission } = require('../middlewares/authMiddleware');

const router = express.Router();

// public
router.get('/', ProductController.getAll);
router.get('/by-category/:categoryId', ProductController.getByCategory);
router.get('/:id', ProductController.getById);

// RBAC protected
router.post('/', verifyToken, checkPermission('CREATE_PRODUCT'), ProductController.create);
router.put('/:id', verifyToken, checkPermission('EDIT_PRODUCT'), ProductController.update);
router.delete('/:id', verifyToken, checkPermission('DELETE_PRODUCT'), ProductController.remove);

module.exports = router;

