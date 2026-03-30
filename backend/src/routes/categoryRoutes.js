const express = require('express');
const CategoryController = require('../controllers/categoryController');
const { authenticate, authorizeAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// public
router.get('/', CategoryController.getAll);
router.get('/:id', CategoryController.getById);

// admin
router.post('/', authenticate, authorizeAdmin, CategoryController.create);
router.put('/:id', authenticate, authorizeAdmin, CategoryController.update);
router.delete('/:id', authenticate, authorizeAdmin, CategoryController.remove);

module.exports = router;

