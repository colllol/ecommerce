import React, { useMemo, useState } from 'react';
import api from '../config/api';
import { useAuth } from '../shared/AuthContext';
import { useCart } from '../shared/CartContext';
import { Link } from 'react-router-dom';

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, totals, clearCart } = useCart();
  const [form, setForm] = useState({
    shipping_name: user?.full_name || '',
    shipping_phone: '',
    shipping_address: '',
    note: '',
    payment_method: 'cod',
  });
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const orderItems = useMemo(() => {
    return items.map((i) => {
      const unit_price = Number(i.price) || 0;
      const discount_percent = Number(i.discount_percent) || 0;
      const quantity = Number(i.quantity) || 1;
      const line_total = Math.max(0, Math.round(unit_price * quantity * (1 - discount_percent / 100)));
      return { product_id: i.product_id, quantity, unit_price, discount_percent, line_total };
    });
  }, [items]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (items.length === 0) {
      setMessage('Giỏ hàng đang trống.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/api/orders', {
        ...form,
        items: orderItems,
        shipping_fee: 0,
        discount_amount: 0,
      });

      if (form.payment_method === 'cod') {
        setMessage(`Đặt hàng thành công (COD). Mã đơn: ${res.data.order.order_code}`);
        clearCart();
      } else {
        // demo: không gọi /api/payments (endpoint hiện đang dành cho admin),
        // chỉ tạo đơn và hiển thị hướng dẫn thanh toán.
        setMessage(`Đơn hàng đã tạo. Tiếp tục thanh toán online (${form.payment_method}) (demo). Mã đơn: ${res.data.order.order_code}`);
        clearCart();
      }
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || 'Đặt hàng thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Đặt hàng</h2>
      {items.length === 0 && (
        <div className="card">
          <p>Giỏ hàng đang trống.</p>
          <Link className="btn" to="/">
            Quay lại mua hàng
          </Link>
        </div>
      )}
      {items.length > 0 && (
      <form className="card" onSubmit={handleSubmit}>
        <div>
          <b>Tạm tính:</b> {Number(totals.subtotal).toLocaleString()} đ
        </div>
        <label>
          Họ tên nhận hàng
          <input
            name="shipping_name"
            value={form.shipping_name}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Số điện thoại
          <input name="shipping_phone" value={form.shipping_phone} onChange={handleChange} required />
        </label>
        <label>
          Địa chỉ
          <input
            name="shipping_address"
            value={form.shipping_address}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Ghi chú
          <textarea name="note" value={form.note} onChange={handleChange} />
        </label>
        <label>
          Hình thức thanh toán
          <select name="payment_method" value={form.payment_method} onChange={handleChange}>
            <option value="cod">Tiền mặt (COD)</option>
            <option value="momo">Momo (demo)</option>
            <option value="vnpay">VNPay (demo)</option>
          </select>
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
        </button>
      </form>
      )}
      {message && <p className="info">{message}</p>}
    </div>
  );
}

