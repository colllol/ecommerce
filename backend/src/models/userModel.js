const pool = require('../config/db');

const table = 'Users';

const UserModel = {
  async findAll() {
    const [rows] = await pool.query(`SELECT user_id, full_name, email, phone, role, status, created_at, updated_at FROM ${table}`);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query(`SELECT user_id, full_name, email, phone, role, status, created_at, updated_at FROM ${table} WHERE user_id = ?`, [id]);
    return rows[0] || null;
  },

  async findByEmail(email) {
    const [rows] = await pool.query(`SELECT * FROM ${table} WHERE email = ?`, [email]);
    return rows[0] || null;
  },

  async findByEmailAndPassword(email, password) {
    const [rows] = await pool.query(
      `SELECT * FROM ${table} WHERE email = ? AND password_hash = ?`,
      [email, password]
    );
    return rows[0] || null;
  },

  async create(data) {
    const { full_name, email, phone, password_hash, role = 'customer', status = 'active' } = data;
    const [result] = await pool.query(
      `INSERT INTO ${table} (full_name, email, phone, password_hash, role, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [full_name, email, phone, password_hash, role, status]
    );
    return this.findById(result.insertId);
  },

  async update(id, data) {
    const fields = [];
    const values = [];

    const allowed = ['full_name', 'email', 'phone', 'password_hash', 'role', 'status'];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    await pool.query(`UPDATE ${table} SET ${fields.join(', ')} WHERE user_id = ?`, values);
    return this.findById(id);
  },

  async remove(id) {
    const [result] = await pool.query(`DELETE FROM ${table} WHERE user_id = ?`, [id]);
    return result.affectedRows > 0;
  },
};

module.exports = UserModel;

