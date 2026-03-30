const UserModel = require('../models/userModel');
const InventoryTransactionModel = require('../models/inventoryTransactionModel');
const OrderModel = require('../models/orderModel');

const StaffController = {
  // Admin: Get all staff members
  async getAllStaff(req, res) {
    try {
      const users = await UserModel.findAll();
      const staff = users.filter(u => u.role === 'staff' || u.role === 'admin');
      return res.json(staff);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // Admin: Create staff member
  async createStaff(req, res) {
    try {
      const { full_name, email, phone, password, role = 'staff', status = 'active' } = req.body;
      if (!full_name || !email || !password) {
        return res.status(400).json({ message: 'full_name, email, password là bắt buộc' });
      }

      const existing = await UserModel.findByEmail(email);
      if (existing) {
        return res.status(409).json({ message: 'Email đã tồn tại' });
      }

      const bcrypt = require('bcryptjs');
      const password_hash = await bcrypt.hash(password, 10);
      const user = await UserModel.create({ full_name, email, phone, password_hash, role, status });
      return res.status(201).json(user);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // Admin: Update staff member
  async updateStaff(req, res) {
    try {
      const { id } = req.params;
      const { password, ...rest } = req.body;

      const user = await UserModel.findById(id);
      if (!user) return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
      if (user.role !== 'staff' && user.role !== 'admin') {
        return res.status(400).json({ message: 'Chỉ có thể cập nhật nhân viên hoặc admin' });
      }

      const dataToUpdate = { ...rest };
      if (password) {
        const bcrypt = require('bcryptjs');
        dataToUpdate.password_hash = await bcrypt.hash(password, 10);
      }

      const updated = await UserModel.update(id, dataToUpdate);
      return res.json(updated);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // Admin: Remove staff member
  async removeStaff(req, res) {
    try {
      const { id } = req.params;
      const user = await UserModel.findById(id);
      if (!user) return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
      if (user.role !== 'staff') {
        return res.status(400).json({ message: 'Chỉ có thể xóa nhân viên' });
      }

      const ok = await UserModel.remove(id);
      if (!ok) return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
      return res.json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // Get staff's own activity history
  async getMyActivity(req, res) {
    try {
      const staffId = req.user.user_id;
      const { limit = 100 } = req.query;
      const activities = await InventoryTransactionModel.findByStaff(staffId, parseInt(limit));
      return res.json(activities);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // Get reports for admin
  async getReports(req, res) {
    try {
      const { startDate, endDate, type } = req.query;
      
      // Inventory summary
      const inventorySummary = await InventoryTransactionModel.getInventorySummary();
      
      // Sales history in date range
      const salesHistory = await InventoryTransactionModel.getSalesHistory(
        1000,
        startDate || null,
        endDate || null
      );

      // Calculate total sales value
      let totalSalesValue = 0;
      const productSales = {};
      
      for (const sale of salesHistory) {
        const qty = Math.abs(sale.quantity);
        totalSalesValue += qty * 0; // Would need product price for actual value
        if (!productSales[sale.product_id]) {
          productSales[sale.product_id] = {
            product_id: sale.product_id,
            product_name: sale.product_name,
            quantity: 0,
          };
        }
        productSales[sale.product_id].quantity += Math.abs(qty);
      }

      // Order statistics
      const [orders] = await require('../config/db').query(`
        SELECT 
          COUNT(*) AS total_orders,
          SUM(total_amount) AS total_revenue,
          order_status,
          COUNT(CASE WHEN order_status = 'completed' THEN 1 END) AS completed_orders
        FROM Orders
        ${startDate && endDate ? 'WHERE created_at BETWEEN ? AND ?' : ''}
      `, startDate && endDate ? [startDate, endDate] : []);

      return res.json({
        inventory: inventorySummary,
        sales: {
          total_transactions: salesHistory.length,
          total_quantity: salesHistory.reduce((sum, s) => sum + Math.abs(s.quantity), 0),
          by_product: Object.values(productSales),
        },
        orders: orders[0] || {},
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },
};

module.exports = StaffController;
