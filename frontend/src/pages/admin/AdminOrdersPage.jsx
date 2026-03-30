import React, { useEffect, useState } from 'react';
import { ordersApi } from '../../services/adminApi';

// Khớp ENUM order_status trong Orders: pending, confirmed, shipping, completed, cancelled
const ORDER_STATUS_OPTIONS = [
  { value: 'pending', label: 'Chờ xử lý' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'shipping', label: 'Đang giao' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' },
];

// Khớp ENUM payment_method trong Payments
const PAYMENT_METHOD_LABELS = {
  cod: 'Thanh toán khi nhận hàng (COD)',
  bank_transfer: 'Chuyển khoản',
  momo: 'Ví MoMo',
  vnpay: 'VNPay',
  zalopay: 'ZaloPay',
  paypal: 'PayPal',
  stripe: 'Stripe',
};

// Khớp ENUM payment_status trong Payments
const PAYMENT_STATUS_LABELS = {
  pending: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  failed: 'Thất bại',
  refunded: 'Đã hoàn tiền',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [detailOrder, setDetailOrder] = useState(null);
  const [modal, setModal] = useState(null); // 'edit' | 'delete'
  const [form, setForm] = useState({ order_status: '' });
  const [error, setError] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await ordersApi.getAll();
      setOrders(res.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const openDetail = async (order) => {
    try {
      const res = await ordersApi.getById(order.order_id);
      setDetailOrder(res.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Lỗi tải chi tiết');
    }
  };

  const openEdit = (order) => {
    setForm({ order_status: order.order_status });
    setError('');
    setModal({ type: 'edit', order });
  };

  const openDelete = (order) => {
    setModal({ type: 'delete', order });
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await ordersApi.update(modal.order.order_id, { order_status: form.order_status });
      setModal(null);
      setDetailOrder(null);
      loadOrders();
    } catch (e) {
      setError(e.response?.data?.message || 'Lỗi cập nhật');
    }
  };

  const handleDelete = async () => {
    try {
      await ordersApi.delete(modal.order.order_id);
      setModal(null);
      setDetailOrder(null);
      loadOrders();
    } catch (e) {
      setError(e.response?.data?.message || 'Lỗi xóa');
    }
  };

  const getStatusLabel = (status) => ORDER_STATUS_OPTIONS.find((o) => o.value === status)?.label || status;

  const filteredOrders = orders.filter((o) => {
    const matchSearch = !search || [o.order_code, o.full_name, o.email, String(o.user_id)].some(
      (v) => v && String(v).toLowerCase().includes(search.toLowerCase())
    );
    const matchStatus = !filterStatus || o.order_status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2>Quản lý đơn hàng</h2>
      </div>

      <div className="admin-search-filter">
        <input
          type="text"
          placeholder="Tìm theo mã đơn, khách hàng..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          {ORDER_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Trạng thái</th>
              <th>Tổng tiền</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((o) => (
              <tr key={o.order_id}>
                <td>{o.order_id}</td>
                <td>{o.order_code}</td>
                <td>{o.full_name || o.email || o.user_id}</td>
                <td>{getStatusLabel(o.order_status)}</td>
                <td>{Number(o.total_amount).toLocaleString()} đ</td>
                <td>
                  <button className="btn-small btn-edit" onClick={() => openDetail(o)}>Chi tiết</button>
                  <button className="btn-small btn-edit" onClick={() => openEdit(o)}>Sửa trạng thái</button>
                  <button className="btn-small btn-danger" onClick={() => openDelete(o)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {detailOrder && (
        <div className="modal-overlay" onClick={() => setDetailOrder(null)}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <h3>Chi tiết đơn hàng #{detailOrder.order_code}</h3>
            <div className="order-detail">
              <p><strong>Khách hàng:</strong> {detailOrder.full_name} ({detailOrder.email})</p>
              <p><strong>Giao đến:</strong> {detailOrder.shipping_name}, {detailOrder.shipping_phone}</p>
              <p><strong>Địa chỉ:</strong> {detailOrder.shipping_address}</p>
              <p><strong>Trạng thái:</strong> {getStatusLabel(detailOrder.order_status)}</p>
              {detailOrder.note && <p><strong>Ghi chú:</strong> {detailOrder.note}</p>}

              {(detailOrder.payments?.length ?? 0) > 0 && (
                <>
                  <hr />
                  <h4>Thanh toán (Payments)</h4>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Phương thức</th>
                        <th>Trạng thái</th>
                        <th>Số tiền</th>
                        <th>Mã giao dịch</th>
                        <th>Ngày thanh toán</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailOrder.payments.map((p) => (
                        <tr key={p.payment_id}>
                          <td>{PAYMENT_METHOD_LABELS[p.payment_method] ?? p.payment_method}</td>
                          <td>{PAYMENT_STATUS_LABELS[p.payment_status] ?? p.payment_status}</td>
                          <td>{Number(p.amount).toLocaleString('vi-VN')} đ</td>
                          <td>{p.transaction_ref || '-'}</td>
                          <td>{p.paid_at ? new Date(p.paid_at).toLocaleString('vi-VN') : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              <hr />
              <h4>Sản phẩm</h4>
              <table className="table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>SL</th>
                    <th>Đơn giá</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {(detailOrder.items || []).map((item, i) => (
                    <tr key={i}>
                      <td>ID: {item.product_id}</td>
                      <td>{item.quantity}</td>
                      <td>{Number(item.unit_price).toLocaleString()} đ</td>
                      <td>{Number(item.line_total).toLocaleString()} đ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p><strong>Tổng:</strong> {Number(detailOrder.total_amount).toLocaleString()} đ</p>
            </div>
            <button className="btn" onClick={() => setDetailOrder(null)}>Đóng</button>
          </div>
        </div>
      )}

      {modal?.type === 'edit' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Cập nhật trạng thái đơn #{modal.order.order_code}</h3>
            <form onSubmit={handleSubmitEdit}>
              <label>
                Trạng thái
                <select value={form.order_status} onChange={(e) => setForm({ order_status: e.target.value })}>
                  {ORDER_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </label>
              {error && <p className="error">{error}</p>}
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Cập nhật</button>
                <button type="button" className="btn" onClick={() => setModal(null)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal?.type === 'delete' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal modal-confirm" onClick={(e) => e.stopPropagation()}>
            <h3>Xóa đơn hàng</h3>
            <p>Bạn có chắc muốn xóa đơn <strong>{modal.order.order_code}</strong>?</p>
            {error && <p className="error">{error}</p>}
            <div className="form-actions">
              <button className="btn btn-danger" onClick={handleDelete}>Xóa</button>
              <button className="btn" onClick={() => setModal(null)}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
