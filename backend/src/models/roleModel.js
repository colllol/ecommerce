const pool = require('../config/db');

const RoleModel = {
  async findAll() {
    const [rows] = await pool.query(`
      SELECT r.*,
             COUNT(DISTINCT rp.permission_id) as permission_count,
             COUNT(DISTINCT ur.user_id) as user_count
      FROM Roles r
      LEFT JOIN Role_Permissions rp ON r.id = rp.role_id
      LEFT JOIN User_Roles ur ON r.id = ur.role_id
      GROUP BY r.id
      ORDER BY r.id
    `);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query(`
      SELECT r.*,
             COUNT(DISTINCT rp.permission_id) as permission_count,
             COUNT(DISTINCT ur.user_id) as user_count
      FROM Roles r
      LEFT JOIN Role_Permissions rp ON r.id = rp.role_id
      LEFT JOIN User_Roles ur ON r.id = ur.role_id
      WHERE r.id = ?
      GROUP BY r.id
    `, [id]);
    return rows[0] || null;
  },

  async findByName(name) {
    const [rows] = await pool.query('SELECT * FROM Roles WHERE name = ?', [name]);
    return rows[0] || null;
  },

  async create(data) {
    const { name, description } = data;
    const [result] = await pool.query(
      'INSERT INTO Roles (name, description) VALUES (?, ?)',
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
    await pool.query(`UPDATE Roles SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.findById(id);
  },

  async remove(id) {
    const [result] = await pool.query('DELETE FROM Roles WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  async getPermissions(roleId) {
    const [rows] = await pool.query(`
      SELECT p.*
      FROM Permissions p
      JOIN Role_Permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = ?
      ORDER BY p.id
    `, [roleId]);
    return rows;
  },

  async assignPermissions(roleId, permissionIds) {
    // Delete existing permissions
    await pool.query('DELETE FROM Role_Permissions WHERE role_id = ?', [roleId]);

    // Insert new ones
    if (permissionIds && permissionIds.length > 0) {
      const values = permissionIds.map(pid => `(${roleId}, ${pid})`).join(', ');
      await pool.query(`INSERT INTO Role_Permissions (role_id, permission_id) VALUES ${values}`);
    }

    return this.getPermissions(roleId);
  },
};

module.exports = RoleModel;
