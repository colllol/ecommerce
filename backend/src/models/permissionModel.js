const pool = require('../config/db');

const PermissionModel = {
  async findAll() {
    const [rows] = await pool.query(`
      SELECT p.*,
             COUNT(DISTINCT rp.role_id) as role_count
      FROM Permissions p
      LEFT JOIN Role_Permissions rp ON p.id = rp.permission_id
      GROUP BY p.id
      ORDER BY p.id
    `);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query(`
      SELECT p.*,
             COUNT(DISTINCT rp.role_id) as role_count
      FROM Permissions p
      LEFT JOIN Role_Permissions rp ON p.id = rp.permission_id
      WHERE p.id = ?
      GROUP BY p.id
    `, [id]);
    return rows[0] || null;
  },

  async findByName(name) {
    const [rows] = await pool.query('SELECT * FROM Permissions WHERE name = ?', [name]);
    return rows[0] || null;
  },

  async create(data) {
    const { name, description } = data;
    const [result] = await pool.query(
      'INSERT INTO Permissions (name, description) VALUES (?, ?)',
      [name, description || null]
    );
    return this.findById(result.insertId);
  },

  async update(id, data) {
    const fields = [];
    const values = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    await pool.query(`UPDATE Permissions SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.findById(id);
  },

  async remove(id) {
    const [result] = await pool.query('DELETE FROM Permissions WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  async getRoles(permissionId) {
    const [rows] = await pool.query(`
      SELECT r.*
      FROM Roles r
      JOIN Role_Permissions rp ON r.id = rp.role_id
      WHERE rp.permission_id = ?
      ORDER BY r.id
    `, [permissionId]);
    return rows;
  },
};

module.exports = PermissionModel;
