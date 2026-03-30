const InventoryModel = require('../models/inventoryModel');
const InventoryTransactionModel = require('../models/inventoryTransactionModel');
const ProductModel = require('../models/productModel');

const InventoryController = {
  // Admin: Get all inventory
  async getAll(req, res) {
    try {
      const inventory = await InventoryModel.findAll();
      return res.json(inventory);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // Admin: Get inventory by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const inventory = await InventoryModel.findById(id);
      if (!inventory) return res.status(404).json({ message: 'Không tìm thấy bản ghi kho' });
      return res.json(inventory);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // Admin: Update inventory
  async update(req, res) {
    try {
      const { id } = req.params;
      const inventory = await InventoryModel.update(id, req.body);
      if (!inventory) return res.status(404).json({ message: 'Không tìm thấy bản ghi kho' });
      return res.json(inventory);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // Admin: Add stock (nhập kho)
  async addStock(req, res) {
    try {
      const { productId, quantity, warehouseLocation, note } = req.body;
      const staffId = req.user.user_id;

      if (!productId || !quantity || quantity <= 0) {
        return res.status(400).json({ message: 'product_id và quantity (dương) là bắt buộc' });
      }

      const inventory = await InventoryModel.addStock(productId, quantity, staffId, note, warehouseLocation);
      return res.json(inventory);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // Staff: Pick product (xuất kho - lấy sản phẩm)
  async pickProduct(req, res) {
    try {
      const { productId, quantity, note } = req.body;
      const staffId = req.user.user_id;

      if (!productId || !quantity || quantity <= 0) {
        return res.status(400).json({ message: 'product_id và quantity (dương) là bắt buộc' });
      }

      const inventory = await InventoryModel.adjustStock(productId, quantity, staffId, note, 'staff_pick');
      return res.json(inventory);
    } catch (err) {
      console.error(err);
      if (err.message === 'Không tìm thấy kho của sản phẩm') {
        return res.status(404).json({ message: err.message });
      }
      if (err.message === 'Số lượng trong kho không đủ') {
        return res.status(400).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // Get sales history (for staff and admin)
  async getSalesHistory(req, res) {
    try {
      const { limit = 100, startDate, endDate } = req.query;
      const history = await InventoryTransactionModel.getSalesHistory(
        parseInt(limit),
        startDate || null,
        endDate || null
      );
      return res.json(history);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // Get inventory transactions
  async getTransactions(req, res) {
    try {
      const { limit = 100, type, productId, staffId } = req.query;
      let transactions;

      if (productId) {
        transactions = await InventoryTransactionModel.findByProduct(productId);
      } else if (staffId) {
        transactions = await InventoryTransactionModel.findByStaff(staffId, parseInt(limit));
      } else if (type) {
        transactions = await InventoryTransactionModel.findByType(type, parseInt(limit));
      } else {
        transactions = await InventoryTransactionModel.findAll(parseInt(limit));
      }

      return res.json(transactions);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // Get inventory summary for reports
  async getSummary(req, res) {
    try {
      const summary = await InventoryTransactionModel.getInventorySummary();
      return res.json(summary);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },
};

module.exports = InventoryController;
