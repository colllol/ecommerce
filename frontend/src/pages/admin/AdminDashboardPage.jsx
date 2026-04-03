import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../shared/AuthContext';
import axios from 'axios';

export default function AdminDashboardPage() {
  const { user, hasPermission } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/dashboard/stats');
        setStats(res.data.stats);
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  const canManageUsers = hasPermission('VIEW_USERS');
  const canManageProducts = hasPermission('VIEW_PRODUCTS');
  const canManageOrders = hasPermission('VIEW_ORDERS');
  const canManageInventory = hasPermission('VIEW_INVENTORY');
  const canManageRoles = hasPermission('VIEW_ROLES');
  const canManagePermissions = hasPermission('VIEW_PERMISSIONS');
  const canViewReports = hasPermission('VIEW_DASHBOARD');

  return (
    <div className="admin-dashboard-page">
      <h1 style={styles.heading}>📊 Bảng điều khiển - Admin</h1>
      <p style={styles.welcome}>Chào mừng, {user?.full_name}!</p>

      {stats && (
        <div style={styles.grid}>
          {canViewReports && stats.users && (
            <div style={styles.card}>
              <div style={styles.cardIcon}>👥</div>
              <h3 style={styles.cardTitle}>Người dùng</h3>
              <div style={styles.cardValue}>{stats.users.total_users}</div>
              <div style={styles.cardSub}>{stats.users.active_users} đang hoạt động</div>
              {canManageUsers && (
                <Link to="/admin/users" style={styles.cardLink}>Quản lý →</Link>
              )}
            </div>
          )}

          {canManageProducts && stats.products && (
            <div style={styles.card}>
              <div style={styles.cardIcon}>📦</div>
              <h3 style={styles.cardTitle}>Sản phẩm</h3>
              <div style={styles.cardValue}>{stats.products.total_products}</div>
              <div style={styles.cardSub}>{stats.products.active_products} đang bán</div>
              <Link to="/admin/products" style={styles.cardLink}>Quản lý →</Link>
            </div>
          )}

          {canManageOrders && stats.orders && (
            <div style={styles.card}>
              <div style={styles.cardIcon}>🛒</div>
              <h3 style={styles.cardTitle}>Đơn hàng</h3>
              <div style={styles.cardValue}>{stats.orders.total_orders}</div>
              <div style={styles.cardSub}>{stats.orders.pending_orders} chờ xử lý</div>
              <Link to="/admin/orders" style={styles.cardLink}>Quản lý →</Link>
            </div>
          )}

          {canManageInventory && stats.inventory && (
            <div style={styles.card}>
              <div style={styles.cardIcon}>🏭</div>
              <h3 style={styles.cardTitle}>Kho hàng</h3>
              <div style={styles.cardValue}>{stats.inventory.total_stock?.toLocaleString()}</div>
              <div style={styles.cardSub}>{stats.inventory.low_stock_items} sắp hết</div>
              <Link to="/admin/inventory" style={styles.cardLink}>Quản lý →</Link>
            </div>
          )}

          {canViewReports && stats.revenue && (
            <div style={{ ...styles.card, ...styles.cardWide }}>
              <div style={styles.cardIcon}>💰</div>
              <h3 style={styles.cardTitle}>Doanh thu</h3>
              <div style={styles.cardValue}>{stats.revenue.total_revenue?.toLocaleString('vi-VN')} ₫</div>
              <div style={styles.cardSub}>
                Hoàn thành: {stats.revenue.completed_revenue?.toLocaleString('vi-VN')} ₫ |
                Chờ: {stats.revenue.pending_revenue?.toLocaleString('vi-VN')} ₫
              </div>
              <Link to="/admin/reports" style={styles.cardLink}>Xem báo cáo →</Link>
            </div>
          )}
        </div>
      )}

      {/* Quick Links Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>🔗 Truy cập nhanh</h2>
        <div style={styles.quickLinks}>
          {canManageUsers && (
            <Link to="/admin/users" style={styles.quickLink}>
              👥 Quản lý người dùng
            </Link>
          )}
          {canManageProducts && (
            <Link to="/admin/products" style={styles.quickLink}>
              📦 Quản lý sản phẩm
            </Link>
          )}
          {canManageOrders && (
            <Link to="/admin/orders" style={styles.quickLink}>
              🛒 Quản lý đơn hàng
            </Link>
          )}
          {canManageInventory && (
            <Link to="/admin/inventory" style={styles.quickLink}>
              🏭 Quản lý kho
            </Link>
          )}
          {canManageRoles && (
            <Link to="/admin/roles" style={styles.quickLink}>
              🔐 Quản lý vai trò
            </Link>
          )}
          {canManagePermissions && (
            <Link to="/admin/permissions" style={styles.quickLink}>
              🔑 Quản lý quyền
            </Link>
          )}
        </div>
      </div>

      <style>{`
        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 300px;
          font-size: 1.2rem;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
}

const styles = {
  heading: { fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem', color: '#1f2937' },
  welcome: { fontSize: '1rem', color: '#6b7280', marginBottom: '2rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' },
  card: { background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' },
  cardWide: { gridColumn: '1 / -1' },
  cardIcon: { fontSize: '2.5rem', marginBottom: '0.5rem' },
  cardTitle: { fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' },
  cardValue: { fontSize: '2rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.25rem' },
  cardSub: { fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' },
  cardLink: { color: '#3b82f6', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' },
  section: { background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  sectionTitle: { fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' },
  quickLinks: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' },
  quickLink: { display: 'block', padding: '1rem', background: '#f3f4f6', borderRadius: '8px', textAlign: 'center', textDecoration: 'none', color: '#1f2937', fontWeight: '500', transition: 'all 0.2s' },
};
