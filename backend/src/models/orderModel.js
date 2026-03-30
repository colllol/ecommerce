const pool = require('../config/db');

const table = 'Orders';

const OrderModel = {
  async findAll() {
    const [rows] = await pool.query(
      `SELECT o.*, u.full_name, u.email
       FROM ${table} o
       JOIN Users u ON o.user_id = u.user_id
       ORDER BY o.created_at DESC`
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT o.*, u.full_name, u.email
       FROM ${table} o
       JOIN Users u ON o.user_id = u.user_id
       WHERE o.order_id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async findByUser(userId) {
    const [rows] = await pool.query(
      `SELECT * FROM ${table} WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );
    return rows;
  },

  async create(data) {
    const {
      user_id,
      order_code,
      order_status = 'pending',
      shipping_name,
      shipping_phone,
      shipping_address,
      note = null,
      subtotal_amount,
      shipping_fee = 0,
      discount_amount = 0,
      total_amount,
    } = data;

    const [result] = await pool.query(
      `INSERT INTO ${table} (
        user_id, order_code, order_status,
        shipping_name, shipping_phone, shipping_address, note,
        subtotal_amount, shipping_fee, discount_amount, total_amount
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        order_code,
        order_status,
        shipping_name,
        shipping_phone,
        shipping_address,
        note,
        subtotal_amount,
        shipping_fee,
        discount_amount,
        total_amount,
      ]
    );

    return this.findById(result.insertId);
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    const allowed = [
      'order_status',
      'shipping_name',
      'shipping_phone',
      'shipping_address',
      'note',
      'subtotal_amount',
      'shipping_fee',
      'discount_amount',
      'total_amount',
    ];

    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    await pool.query(`UPDATE ${table} SET ${fields.join(', ')} WHERE order_id = ?`, values);
    return this.findById(id);
  },

  async remove(id) {
    const [result] = await pool.query(`DELETE FROM ${table} WHERE order_id = ?`, [id]);
    return result.affectedRows > 0;
  },
};

module.exports = OrderModel;

