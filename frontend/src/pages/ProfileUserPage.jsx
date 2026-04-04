import React, { useEffect, useState } from 'react';
import api from '../config/api';
import { useAuth } from '../shared/AuthContext';

export default function ProfileUserPage() {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (user && token) {
      api.get('/api/orders/my')
        .then((ordersRes) => {
          const ordersData = ordersRes.data || [];
          setOrders(ordersData);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching orders:', err);
          setLoading(false);
        });
    }
  }, [user, token]);

  const handleDeleteOrder = async (orderId) => {
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;

    setDeletingId(orderId);
    try {
      await api.delete(`/api/orders/${orderId}`);
      alert('Đã hủy đơn hàng thành công');
      setOrders(orders.filter(o => o.order_id !== orderId));
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || 'Không thể hủy đơn hàng'));
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="container">Đang tải...</div>;

  const getStatusLabel = (status) => {
    const labels = {
      pending: { label: 'Chờ xác nhận', className: 'status-pending' },
      confirmed: { label: 'Đã xác nhận', className: 'status-confirmed' },
      shipping: { label: 'Đang giao', className: 'status-shipping' },
      completed: { label: 'Hoàn thành', className: 'status-completed' },
      cancelled: { label: 'Đã hủy', className: 'status-cancelled' },
    };
    return labels[status] || { label: status, className: '' };
  };

  return (
    <div className="container profile-page">
      <h1>Thông tin tài khoản</h1>

      <div className="profile-section">
        <h2>Thông tin cá nhân</h2>
        <div className="profile-info">
          <p><strong>Họ tên:</strong> {user?.full_name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Số điện thoại:</strong> {user?.phone || 'Chưa cập nhật'}</p>
          <p><strong>Vai trò:</strong> {user?.role === 'admin' ? 'Quản trị viên' : user?.role === 'staff' ? 'Nhân viên' : 'Khách hàng'}</p>
          <p><strong>Trạng thái:</strong> {user?.status === 'active' ? 'Hoạt động' : user?.status === 'inactive' ? 'Không hoạt động' : 'Bị khóa'}</p>
        </div>
      </div>

      <div className="orders-section">
        <h2>Lịch sử đơn hàng</h2>
        {orders.length === 0 ? (
          <p>Chưa có đơn hàng nào.</p>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const status = order.order_status || order.status || 'pending';
              const isPending = status === 'pending';
              const isDeleting = deletingId === order.order_id;

              return (
                <div key={order.order_id} className="order-card">
                  <div className="order-header">
                    <span className="order-code">#{order.order_code}</span>
                    <span className={`order-status ${getStatusLabel(status).className}`}>
                      {getStatusLabel(status).label}
                    </span>
                  </div>
                  <div className="order-body">
                    <p><strong>Ngày đặt:</strong> {new Date(order.created_at).toLocaleDateString('vi-VN')}</p>
                    <p><strong>Tổng tiền:</strong> {Number(order.total_amount).toLocaleString('vi-VN')}₫</p>
                    <p><strong>Địa chỉ giao:</strong> {order.shipping_address}</p>
                    <p><strong>SĐT nhận hàng:</strong> {order.shipping_phone}</p>
                    {order.note && <p><strong>Ghi chú:</strong> {order.note}</p>}

                    {isPending && (
                      <div className="order-actions">
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteOrder(order.order_id)}
                          disabled={isDeleting}
                        >
                          {isDeleting ? 'Đang hủy...' : 'Hủy đơn hàng'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .profile-page {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }
        .profile-page h1 {
          margin-bottom: 2rem;
          color: #333;
        }
        .profile-section, .orders-section {
          background: #fff;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .profile-section h2, .orders-section h2 {
          margin-bottom: 1rem;
          color: #333;
          border-bottom: 2px solid #007bff;
          padding-bottom: 0.5rem;
        }
        .profile-info p {
          margin: 0.5rem 0;
          color: #555;
        }
        .orders-list {
          display: grid;
          gap: 1rem;
        }
        .order-card {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 1rem;
          background: #fafafa;
        }
        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e0e0e0;
        }
        .order-code {
          font-weight: bold;
          color: #333;
        }
        .order-status {
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 500;
        }
        .status-pending {
          background: #fff3cd;
          color: #856404;
        }
        .status-confirmed {
          background: #d1ecf1;
          color: #0c5460;
        }
        .status-shipping {
          background: #cce5ff;
          color: #004085;
        }
        .status-completed {
          background: #d4edda;
          color: #155724;
        }
        .status-cancelled {
          background: #f8d7da;
          color: #721c24;
        }
        .order-body p {
          margin: 0.5rem 0;
          color: #555;
        }
        .order-actions {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e0e0e0;
        }
        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        .btn-danger {
          background: #ef4444;
          color: white;
        }
        .btn-danger:hover:not(:disabled) {
          background: #dc2626;
        }
        .btn-danger:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
        .btn-sm {
          padding: 0.375rem 0.75rem;
          font-size: 0.8125rem;
        }
      `}</style>
    </div>
  );
}
