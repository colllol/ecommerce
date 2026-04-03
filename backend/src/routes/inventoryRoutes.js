const express = require('express');
const router = express.Router();
const InventoryController = require('../controllers/inventoryController');
const { verifyToken, checkPermission } = require('../middlewares/authMiddleware');

// RBAC protected - Staff & Admin: VIEW_INVENTORY
router.get('/', verifyToken, checkPermission('VIEW_INVENTORY'), InventoryController.getAll);
router.get('/transactions', verifyToken, checkPermission('VIEW_INVENTORY'), InventoryController.getTransactions);
router.get('/summary', verifyToken, checkPermission('VIEW_INVENTORY'), InventoryController.getSummary);
router.get('/sales-history', verifyToken, checkPermission('VIEW_INVENTORY'), InventoryController.getSalesHistory);

// RBAC protected - Admin/Manager: Full inventory management
router.get('/:id', verifyToken, checkPermission('VIEW_INVENTORY'), InventoryController.getById);
router.put('/:id', verifyToken, checkPermission('EDIT_INVENTORY'), InventoryController.update);
router.post('/add-stock', verifyToken, checkPermission('EDIT_INVENTORY'), InventoryController.addStock);

// RBAC protected - Staff: pick products
router.post('/pick-product', verifyToken, checkPermission('EDIT_INVENTORY'), InventoryController.pickProduct);

module.exports = router;
