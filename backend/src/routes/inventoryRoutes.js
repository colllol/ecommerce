const express = require('express');
const router = express.Router();
const InventoryController = require('../controllers/inventoryController');
const { authenticate, authorizeAdmin, authorizeStaff } = require('../middlewares/authMiddleware');

// Public routes (for staff to view inventory)
router.get('/', authenticate, authorizeStaff, InventoryController.getAll);
router.get('/transactions', authenticate, authorizeStaff, InventoryController.getTransactions);
router.get('/summary', authenticate, authorizeStaff, InventoryController.getSummary);
router.get('/sales-history', authenticate, authorizeStaff, InventoryController.getSalesHistory);

// Admin only routes
router.get('/:id', authenticate, authorizeAdmin, InventoryController.getById);
router.put('/:id', authenticate, authorizeAdmin, InventoryController.update);
router.post('/add-stock', authenticate, authorizeAdmin, InventoryController.addStock);

// Staff can pick products
router.post('/pick-product', authenticate, authorizeStaff, InventoryController.pickProduct);

module.exports = router;
