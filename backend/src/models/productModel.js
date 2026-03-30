const pool = require('../config/db');

const table = 'Products';

const ProductModel = {
  async findAll(filters = {}) {
    let sql = `SELECT p.*, c.category_name FROM ${table} p JOIN Categories c ON p.category_id = c.category_id WHERE 1=1`;
    const params = [];

    if (filters.q) {
      sql += ` AND (p.product_name LIKE ? OR p.sku LIKE ? OR p.short_description LIKE ?)`;
      const term = `%${filters.q}%`;
      params.push(term, term, term);
    }
    if (filters.categoryId) {
      sql += ` AND p.category_id = ?`;
      params.push(filters.categoryId);
    }
    if (filters.minPrice != null && filters.minPrice !== '') {
      sql += ` AND p.price >= ?`;
      params.push(Number(filters.minPrice));
    }
    if (filters.maxPrice != null && filters.maxPrice !== '') {
      sql += ` AND p.price <= ?`;
      params.push(Number(filters.maxPrice));
    }
    if (filters.isActive !== undefined) {
      sql += ` AND p.is_active = ?`;
      params.push(filters.isActive);
    }

    sql += ` ORDER BY p.product_id DESC`;
    const [rows] = await pool.query(sql, params);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT p.*, c.category_name, i.stock_quantity, i.available_quantity, i.reserved_quantity, i.warehouse_location
       FROM ${table} p
       JOIN Categories c ON p.category_id = c.category_id
       LEFT JOIN Inventory i ON p.product_id = i.product_id
       WHERE p.product_id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async findByCategory(categoryId) {
    const [rows] = await pool.query(
      `SELECT p.*, i.available_quantity
       FROM ${table} p
       LEFT JOIN Inventory i ON p.product_id = i.product_id
       WHERE p.category_id = ? AND p.is_active = 1`,
      [categoryId]
    );
    return rows;
  },

  async create(data) {
    const {
      category_id,
      product_name,
      slug,
      sku,
      short_description = null,
      description = null,
      price,
      discount_percent = 0,
      image_url = null,
      is_active = 1,
      initial_stock = 0,
      warehouse_location = null,
    } = data;

    const [result] = await pool.query(
      `INSERT INTO ${table} (
        category_id, product_name, slug, sku, short_description, description,
        price, discount_percent, image_url, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        category_id,
        product_name,
        slug,
        sku,
        short_description,
        description,
        price,
        discount_percent,
        image_url,
        is_active,
      ]
    );

    // Create inventory record if initial_stock is provided
    if (initial_stock > 0) {
      await pool.query(
        `INSERT INTO Inventory (product_id, stock_quantity, reserved_quantity, available_quantity, warehouse_location)
         VALUES (?, ?, ?, ?, ?)`,
        [result.insertId, initial_stock, 0, initial_stock, warehouse_location]
      );
    }

    return this.findById(result.insertId);
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    const allowed = [
      'category_id',
      'product_name',
      'slug',
      'sku',
      'short_description',
      'description',
      'price',
      'discount_percent',
      'image_url',
      'is_active',
    ];

    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    await pool.query(`UPDATE ${table} SET ${fields.join(', ')} WHERE product_id = ?`, values);
    return this.findById(id);
  },

  async remove(id) {
    const [result] = await pool.query(`DELETE FROM ${table} WHERE product_id = ?`, [id]);
    return result.affectedRows > 0;
  },
};

module.exports = ProductModel;

