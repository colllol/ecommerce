const OrderModel = require('../models/orderModel');
const OrderItemModel = require('../models/orderItemModel');
const PaymentModel = require('../models/paymentModel');

const OrderController = {
  async getAll(req, res) {
    try {
      const orders = await OrderModel.findAll();
      return res.json(orders);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const order = await OrderModel.findById(id);
      if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
      const [items, payments] = await Promise.all([
        OrderItemModel.findByOrder(id),
        PaymentModel.findByOrder(id),
      ]);
      return res.json({ ...order, items, payments });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  async getByCurrentUser(req, res) {
    try {
      const userId = req.user.user_id;
      const orders = await OrderModel.findByUser(userId);
      return res.json(orders);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // tạo đơn hàng từ giỏ hàng (client gửi các item)
  async create(req, res) {
    try {
      const userId = req.user.user_id;
      const { shipping_name, shipping_phone, shipping_address, note, items, shipping_fee = 0, discount_amount = 0 } =
        req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Thiếu danh sách sản phẩm' });
      }

      const orderCode = `ORD-${Date.now()}`;

      // Tạm tính tiền từ client gửi lên
      let subtotal = 0;
      for (const item of items) {
        const line = item.line_total || item.unit_price * item.quantity;
        subtotal += line;
      }
      const total = subtotal + Number(shipping_fee) - Number(discount_amount);

      const order = await OrderModel.create({
        user_id: userId,
        order_code: orderCode,
        shipping_name,
        shipping_phone,
        shipping_address,
        note,
        subtotal_amount: subtotal,
        shipping_fee,
        discount_amount,
        total_amount: total,
      });

      // tạo từng OrderItem
      const createdItems = [];
      for (const item of items) {
        const line_total = item.line_total || item.unit_price * item.quantity;
        const created = await OrderItemModel.create({
          order_id: order.order_id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_percent: item.discount_percent || 0,
          line_total,
        });
        createdItems.push(created);
      }

      return res.status(201).json({ order, items: createdItems });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const order = await OrderModel.update(id, req.body);
      if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
      return res.json(order);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;

      // Check if order exists and belongs to current user (for non-admin)
      const order = await OrderModel.findById(id);
      if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

      // If not admin, check if user owns this order
      if (!req.user?.roles?.includes('Admin') && order.user_id !== req.user.user_id) {
        return res.status(403).json({ message: 'Bạn không có quyền xóa đơn hàng này' });
      }

      // Check if order status is pending (only pending orders can be cancelled by user)
      if (!req.user?.roles?.includes('Admin') && order.order_status !== 'pending') {
        return res.status(400).json({ message: 'Chỉ có thể hủy đơn hàng ở trạng thái "Chờ xác nhận"' });
      }

      const ok = await OrderModel.remove(id);
      if (!ok) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
      return res.json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  /**
   * Admin delete order (with DELETE_ORDER permission)
   */
  async removeAdmin(req, res) {
    try {
      const { id } = req.params;

      const order = await OrderModel.findById(id);
      if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

      const ok = await OrderModel.remove(id);
      if (!ok) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
      return res.json({ success: true, message: 'Xóa đơn hàng thành công' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },
};

module.exports = OrderController;

