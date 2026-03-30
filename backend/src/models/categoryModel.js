const pool = require('../config/db');

const table = 'Categories';

const CategoryModel = {
  async findAll() {
    const [rows] = await pool.query(`SELECT * FROM ${table}`);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query(`SELECT * FROM ${table} WHERE category_id = ?`, [id]);
    return rows[0] || null;
  },

  async create(data) {
    const { category_name, slug, parent_category_id = null, description = null, is_active = 1 } = data;
    const [result] = await pool.query(
      `INSERT INTO ${table} (category_name, slug, parent_category_id, description, is_active) VALUES (?, ?, ?, ?, ?)`,
      [category_name, slug, parent_category_id, description, is_active]
    );
    const [rows] = await pool.query(`SELECT * FROM ${table} WHERE category_id = ?`, [result.insertId]);
    return rows[0];
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    const allowed = ['category_name', 'slug', 'parent_category_id', 'description', 'is_active'];

    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    await pool.query(`UPDATE ${table} SET ${fields.join(', ')} WHERE category_id = ?`, values);
    return this.findById(id);
  },

  async remove(id) {
    const [result] = await pool.query(`DELETE FROM ${table} WHERE category_id = ?`, [id]);
    return result.affectedRows > 0;
  },
};

module.exports = CategoryModel;

