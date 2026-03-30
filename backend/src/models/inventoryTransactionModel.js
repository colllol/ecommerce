const pool = require('../config/db');

const table = 'InventoryTransactions';

const InventoryTransactionModel = {
  async findAll(limit = 100) {
    const [rows] = await pool.query(`
      SELECT t.*, p.product_name, p.sku, u.full_name AS staff_name
      FROM ${table} t
      JOIN Products p ON t.product_id = p.product_id
      JOIN Users u ON t.staff_id = u.user_id
      ORDER BY t.created_at DESC
      LIMIT ?
    `, [limit]);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query(`
      SELECT t.*, p.product_name, p.sku, u.full_name AS staff_name
      FROM ${table} t
      JOIN Products p ON t.product_id = p.product_id
      JOIN Users u ON t.staff_id = u.user_id
      WHERE t.transaction_id = ?
    `, [id]);
    return rows[0] || null;
  },

  async findByProduct(productId) {
    const [rows] = await pool.query(`
      SELECT t.*, p.product_name, p.sku, u.full_name AS staff_name
      FROM ${table} t
      JOIN Products p ON t.product_id = p.product_id
      JOIN Users u ON t.staff_id = u.user_id
      WHERE t.product_id = ?
      ORDER BY t.created_at DESC
    `, [productId]);
    return rows;
  },

  async findByStaff(staffId, limit = 100) {
    const [rows] = await pool.query(`
      SELECT t.*, p.product_name, p.sku, u.full_name AS staff_name
      FROM ${table} t
      JOIN Products p ON t.product_id = p.product_id
      JOIN Users u ON t.staff_id = u.user_id
      WHERE t.staff_id = ?
      ORDER BY t.created_at DESC
      LIMIT ?
    `, [staffId, limit]);
    return rows;
  },

  async findByType(transactionType, limit = 100) {
    const [rows] = await pool.query(`
      SELECT t.*, p.product_name, p.sku, u.full_name AS staff_name
      FROM ${table} t
      JOIN Products p ON t.product_id = p.product_id
      JOIN Users u ON t.staff_id = u.user_id
      WHERE t.transaction_type = ?
      ORDER BY t.created_at DESC
      LIMIT ?
    `, [transactionType, limit]);
    return rows;
  },

  async create(data) {
    const {
      inventory_id,
      product_id,
      transaction_type,
      quantity,
      reference_type = null,
      reference_id = null,
      staff_id,
      note = null,
    } = data;

    const [result] = await pool.query(
      `INSERT INTO ${table} (inventory_id, product_id, transaction_type, quantity, reference_type, reference_id, staff_id, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [inventory_id, product_id, transaction_type, quantity, reference_type, reference_id, staff_id, note]
    );
    return this.findById(result.insertId);
  },

  // Get sales history (only 'out' transactions)
  async getSalesHistory(limit = 100, startDate = null, endDate = null) {
    let sql = `
      SELECT t.*, p.product_name, p.sku, p.image_url, u.full_name AS staff_name
      FROM ${table} t
      JOIN Products p ON t.product_id = p.product_id
      JOIN Users u ON t.staff_id = u.user_id
      WHERE t.transaction_type = 'out'
    `;
    const params = [];

    if (startDate) {
      sql += ` AND t.created_at >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      sql += ` AND t.created_at <= ?`;
      params.push(endDate);
    }

    sql += ` ORDER BY t.created_at DESC LIMIT ?`;
    params.push(limit);

    const [rows] = await pool.query(sql, params);
    return rows;
  },

  // Get inventory summary for reports
  async getInventorySummary() {
    const [rows] = await pool.query(`
      SELECT 
        COUNT(DISTINCT i.product_id) AS total_products,
        SUM(i.stock_quantity) AS total_stock,
        SUM(i.available_quantity) AS total_available,
        SUM(i.reserved_quantity) AS total_reserved
      FROM ${table} i
    `);
    return rows[0] || null;
  },
};

module.exports = InventoryTransactionModel;
