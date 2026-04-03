const db = require('../config/db');

const DashboardController = {
  /**
   * Get dashboard statistics
   * Returns different data based on user role
   */
  async getStats(req, res) {
    try {
      const userRoles = req.user?.roles || [];
      const isAdmin = userRoles.includes('Admin');
      const isManager = userRoles.includes('Manager');
      const isStaff = userRoles.includes('Staff');

      const stats = { roles: userRoles };

      // All logged-in users can see basic product stats
      const [productStats] = await db.query(`
        SELECT
          COUNT(*) as total_products,
          SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_products
        FROM Products
      `);
      stats.products = productStats[0];

      // Admin, Manager, Staff can see more
      if (isAdmin || isManager || isStaff) {
        const [orderStats] = await db.query(`
          SELECT
            COUNT(*) as total_orders,
            COUNT(CASE WHEN order_status = 'pending' THEN 1 END) as pending_orders,
            COUNT(CASE WHEN order_status = 'confirmed' THEN 1 END) as confirmed_orders,
            COUNT(CASE WHEN order_status = 'shipping' THEN 1 END) as shipping_orders,
            COUNT(CASE WHEN order_status = 'completed' THEN 1 END) as completed_orders,
            COUNT(CASE WHEN order_status = 'cancelled' THEN 1 END) as cancelled_orders
          FROM Orders
        `);
        stats.orders = orderStats[0];

        const [userStats] = await db.query(`
          SELECT
            COUNT(*) as total_users,
            COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users,
            COUNT(CASE WHEN role = 'customer' THEN 1 END) as customer_users,
            COUNT(CASE WHEN role = 'staff' THEN 1 END) as staff_users,
            COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users
          FROM Users
        `);
        stats.users = userStats[0];

        const [inventoryStats] = await db.query(`
          SELECT
            COUNT(*) as total_items,
            SUM(stock_quantity) as total_stock,
            SUM(CASE WHEN stock_quantity < 10 THEN 1 ELSE 0 END) as low_stock_items
          FROM Inventory
        `);
        stats.inventory = inventoryStats[0];
      }

      // Admin and Manager can see revenue
      if (isAdmin || isManager) {
        const [revenueStats] = await db.query(`
          SELECT
            COALESCE(SUM(total_amount), 0) as total_revenue,
            COALESCE(SUM(CASE WHEN order_status = 'completed' THEN total_amount ELSE 0 END), 0) as completed_revenue,
            COALESCE(SUM(CASE WHEN order_status = 'pending' THEN total_amount ELSE 0 END), 0) as pending_revenue
          FROM Orders
          WHERE order_status != 'cancelled'
        `);
        stats.revenue = revenueStats[0];

        // Last 7 days orders
        const [recentOrders] = await db.query(`
          SELECT DATE(created_at) as date, COUNT(*) as order_count, SUM(total_amount) as daily_total
          FROM Orders
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
          GROUP BY DATE(created_at)
          ORDER BY date DESC
          LIMIT 7
        `);
        stats.recentOrders = recentOrders;
      }

      return res.json({ stats });
    } catch (err) {
      console.error('[DashboardController.getStats] Error:', err.message);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },
};

module.exports = DashboardController;
