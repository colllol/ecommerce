const ProductModel = require('../models/productModel');

const ProductController = {
  async getAll(req, res) {
    try {
      const { q, categoryId, minPrice, maxPrice } = req.query;
      const filters = {};
      if (q) filters.q = q;
      if (categoryId) filters.categoryId = categoryId;
      if (minPrice !== undefined && minPrice !== '') filters.minPrice = minPrice;
      if (maxPrice !== undefined && maxPrice !== '') filters.maxPrice = maxPrice;
      filters.isActive = 1; // public chỉ xem sản phẩm đang bán
      const products = await ProductModel.findAll(filters);
      return res.json(products);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const product = await ProductModel.findById(id);
      if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
      return res.json(product);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  async getByCategory(req, res) {
    try {
      const { categoryId } = req.params;
      const products = await ProductModel.findByCategory(categoryId);
      return res.json(products);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  async create(req, res) {
    try {
      const product = await ProductModel.create(req.body);
      return res.status(201).json(product);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const product = await ProductModel.update(id, req.body);
      if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
      return res.json(product);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;
      const ok = await ProductModel.remove(id);
      if (!ok) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
      return res.json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },
};

module.exports = ProductController;

