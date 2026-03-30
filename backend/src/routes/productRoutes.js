const express = require('express');
const ProductController = require('../controllers/productController');
const { authenticate, authorizeAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// public
router.get('/', ProductController.getAll);
router.get('/by-category/:categoryId', ProductController.getByCategory);
router.get('/:id', ProductController.getById);

// admin
router.post('/', authenticate, authorizeAdmin, ProductController.create);
router.put('/:id', authenticate, authorizeAdmin, ProductController.update);
router.delete('/:id', authenticate, authorizeAdmin, ProductController.remove);

module.exports = router;

