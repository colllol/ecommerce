const PaymentModel = require('../models/paymentModel');

const PaymentController = {
  async getAll(req, res) {
    try {
      const payments = await PaymentModel.findAll();
      return res.json(payments);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const payment = await PaymentModel.findById(id);
      if (!payment) return res.status(404).json({ message: 'Không tìm thấy thanh toán' });
      return res.json(payment);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  async getByOrder(req, res) {
    try {
      const { orderId } = req.params;
      const payments = await PaymentModel.findByOrder(orderId);
      return res.json(payments);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // tạo bản ghi thanh toán online (giả lập)
  async create(req, res) {
    try {
      const payment = await PaymentModel.create(req.body);
      return res.status(201).json(payment);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const payment = await PaymentModel.update(id, req.body);
      if (!payment) return res.status(404).json({ message: 'Không tìm thấy thanh toán' });
      return res.json(payment);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;
      const ok = await PaymentModel.remove(id);
      if (!ok) return res.status(404).json({ message: 'Không tìm thấy thanh toán' });
      return res.json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },
};

module.exports = PaymentController;

