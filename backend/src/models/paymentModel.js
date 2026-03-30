const pool = require('../config/db');

const table = 'Payments';

const PaymentModel = {
  async findAll() {
    const [rows] = await pool.query(
      `SELECT p.*, o.order_code 
       FROM ${table} p
       JOIN Orders o ON p.order_id = o.order_id
       ORDER BY p.created_at DESC`
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT p.*, o.order_code 
       FROM ${table} p
       JOIN Orders o ON p.order_id = o.order_id
       WHERE p.payment_id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async findByOrder(orderId) {
    const [rows] = await pool.query(`SELECT * FROM ${table} WHERE order_id = ?`, [orderId]);
    return rows;
  },

  async create(data) {
    const {
      order_id,
      payment_method,
      transaction_ref = null,
      payment_status = 'pending',
      amount,
      paid_at = null,
      gateway_response = null,
    } = data;

    const [result] = await pool.query(
      `INSERT INTO ${table} (
        order_id, payment_method, transaction_ref,
        payment_status, amount, paid_at, gateway_response
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [order_id, payment_method, transaction_ref, payment_status, amount, paid_at, gateway_response]
    );

    return this.findById(result.insertId);
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    const allowed = ['payment_method', 'transaction_ref', 'payment_status', 'amount', 'paid_at', 'gateway_response'];

    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    await pool.query(`UPDATE ${table} SET ${fields.join(', ')} WHERE payment_id = ?`, values);
    return this.findById(id);
  },

  async remove(id) {
    const [result] = await pool.query(`DELETE FROM ${table} WHERE payment_id = ?`, [id]);
    return result.affectedRows > 0;
  },
};

module.exports = PaymentModel;

