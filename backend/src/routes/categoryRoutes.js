const express = require('express');
const CategoryController = require('../controllers/categoryController');
const { verifyToken, checkPermission } = require('../middlewares/authMiddleware');

const router = express.Router();

// public
router.get('/', CategoryController.getAll);
router.get('/:id', CategoryController.getById);

// RBAC protected
router.post('/', verifyToken, checkPermission('CREATE_PRODUCT'), CategoryController.create);
router.put('/:id', verifyToken, checkPermission('EDIT_PRODUCT'), CategoryController.update);
router.delete('/:id', verifyToken, checkPermission('DELETE_PRODUCT'), CategoryController.remove);

module.exports = router;

