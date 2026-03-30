const pool = require('../config/db');

const table = 'OrderItem';

const OrderItemModel = {
  async findByOrder(orderId) {
    const [rows] = await pool.query(
      `SELECT oi.*, p.product_name, p.image_url 
       FROM ${table} oi
       JOIN Products p ON oi.product_id = p.product_id
       WHERE oi.order_id = ?`,
      [orderId]
    );
    return rows;
  },

  async create(data) {
    const { order_id, product_id, quantity, unit_price, discount_percent = 0, line_total } = data;
    const [result] = await pool.query(
      `INSERT INTO ${table} (
        order_id, product_id, quantity, unit_price, discount_percent, line_total
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [order_id, product_id, quantity, unit_price, discount_percent, line_total]
    );

    const [rows] = await pool.query(`SELECT * FROM ${table} WHERE order_item_id = ?`, [result.insertId]);
    return rows[0];
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    const allowed = ['quantity', 'unit_price', 'discount_percent', 'line_total'];

    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) {
      const [rows] = await pool.query(`SELECT * FROM ${table} WHERE order_item_id = ?`, [id]);
      return rows[0] || null;
    }

    values.push(id);
    await pool.query(`UPDATE ${table} SET ${fields.join(', ')} WHERE order_item_id = ?`, values);
    const [rows] = await pool.query(`SELECT * FROM ${table} WHERE order_item_id = ?`, [id]);
    return rows[0] || null;
  },

  async remove(id) {
    const [result] = await pool.query(`DELETE FROM ${table} WHERE order_item_id = ?`, [id]);
    return result.affectedRows > 0;
  },
};

module.exports = OrderItemModel;

