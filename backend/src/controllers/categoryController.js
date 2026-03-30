const CategoryModel = require('../models/categoryModel');

const CategoryController = {
  async getAll(req, res) {
    try {
      const categories = await CategoryModel.findAll();
      return res.json(categories);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const category = await CategoryModel.findById(id);
      if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
      return res.json(category);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  async create(req, res) {
    try {
      const category = await CategoryModel.create(req.body);
      return res.status(201).json(category);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const category = await CategoryModel.update(id, req.body);
      if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
      return res.json(category);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;
      const ok = await CategoryModel.remove(id);
      if (!ok) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
      return res.json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },
};

module.exports = CategoryController;

