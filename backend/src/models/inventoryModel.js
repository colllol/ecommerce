const pool = require('../config/db');

const table = 'Inventory';

const InventoryModel = {
  async findAll() {
    const [rows] = await pool.query(`
      SELECT i.*, p.product_name, p.sku, p.image_url
      FROM ${table} i
      JOIN Products p ON i.product_id = p.product_id
      ORDER BY i.inventory_id DESC
    `);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query(`
      SELECT i.*, p.product_name, p.sku, p.image_url
      FROM ${table} i
      JOIN Products p ON i.product_id = p.product_id
      WHERE i.inventory_id = ?
    `, [id]);
    return rows[0] || null;
  },

  async findByProductId(productId) {
    const [rows] = await pool.query(`
      SELECT i.*, p.product_name, p.sku, p.image_url
      FROM ${table} i
      JOIN Products p ON i.product_id = p.product_id
      WHERE i.product_id = ?
    `, [productId]);
    return rows[0] || null;
  },

  async create(data) {
    const {
      product_id,
      stock_quantity = 0,
      reserved_quantity = 0,
      available_quantity = 0,
      warehouse_location = null,
    } = data;

    const [result] = await pool.query(
      `INSERT INTO ${table} (product_id, stock_quantity, reserved_quantity, available_quantity, warehouse_location)
       VALUES (?, ?, ?, ?, ?)`,
      [product_id, stock_quantity, reserved_quantity, available_quantity, warehouse_location]
    );
    return this.findById(result.insertId);
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    const allowed = ['stock_quantity', 'reserved_quantity', 'available_quantity', 'warehouse_location'];

    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    await pool.query(`UPDATE ${table} SET ${fields.join(', ')} WHERE inventory_id = ?`, values);
    return this.findById(id);
  },

  async updateByProductId(productId, data) {
    const inventory = await this.findByProductId(productId);
    if (inventory) {
      return this.update(inventory.inventory_id, data);
    }
    return this.create({ ...data, product_id: productId });
  },

  async remove(id) {
    const [result] = await pool.query(`DELETE FROM ${table} WHERE inventory_id = ?`, [id]);
    return result.affectedRows > 0;
  },

  // Adjust stock when product is picked by staff
  async adjustStock(productId, quantity, staffId, note = null, referenceType = null, referenceId = null) {
    const inventory = await this.findByProductId(productId);
    if (!inventory) {
      throw new Error('Không tìm thấy kho của sản phẩm');
    }

    if (inventory.available_quantity < quantity) {
      throw new Error('Số lượng trong kho không đủ');
    }

    const newStock = inventory.stock_quantity - quantity;
    const newAvailable = inventory.available_quantity - quantity;

    await pool.query(
      `UPDATE ${table} SET stock_quantity = ?, available_quantity = ? WHERE inventory_id = ?`,
      [newStock, newAvailable, inventory.inventory_id]
    );

    // Record transaction
    await pool.query(
      `INSERT INTO InventoryTransactions (inventory_id, product_id, transaction_type, quantity, reference_type, reference_id, staff_id, note)
       VALUES (?, ?, 'out', ?, ?, ?, ?, ?)`,
      [inventory.inventory_id, productId, -quantity, referenceType, referenceId, staffId, note]
    );

    return this.findByProductId(productId);
  },

  // Add stock (nhập kho)
  async addStock(productId, quantity, staffId, note = null, warehouseLocation = null) {
    let inventory = await this.findByProductId(productId);
    
    if (!inventory) {
      return this.create({
        product_id: productId,
        stock_quantity: quantity,
        reserved_quantity: 0,
        available_quantity: quantity,
        warehouse_location: warehouseLocation,
      });
    }

    const newStock = inventory.stock_quantity + quantity;
    const newAvailable = inventory.available_quantity + quantity;

    await pool.query(
      `UPDATE ${table} SET stock_quantity = ?, available_quantity = ? WHERE inventory_id = ?`,
      [newStock, newAvailable, inventory.inventory_id]
    );

    // Record transaction
    await pool.query(
      `INSERT INTO InventoryTransactions (inventory_id, product_id, transaction_type, quantity, staff_id, note)
       VALUES (?, ?, 'in', ?, ?, ?)`,
      [inventory.inventory_id, productId, quantity, staffId, note]
    );

    return this.findByProductId(productId);
  },
};

module.exports = InventoryModel;
