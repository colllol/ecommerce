import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';
import { useAuth } from '../../shared/AuthContext';

export default function StaffDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/api/dashboard/stats');
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

  return (
    <div className="staff-dashboard-page">
      <h1 style={styles.heading}>📊 Bảng điều khiển - Nhân viên</h1>
      <p style={styles.welcome}>Chào mừng, {user?.full_name}!</p>

      {stats && (
        <div style={styles.grid}>
          {stats.products && (
            <div style={styles.card}>
              <div style={styles.cardIcon}>📦</div>
              <h3 style={styles.cardTitle}>Sản phẩm</h3>
              <div style={styles.cardValue}>{stats.products.total_products}</div>
              <div style={styles.cardSub}>{stats.products.active_products} đang bán</div>
            </div>
          )}

          {stats.orders && (
            <div style={styles.card}>
              <div style={styles.cardIcon}>🛒</div>
              <h3 style={styles.cardTitle}>Đơn hàng</h3>
              <div style={styles.cardValue}>{stats.orders.total_orders}</div>
              <div style={styles.cardSub}>{stats.orders.pending_orders} chờ xử lý</div>
            </div>
          )}

          {stats.inventory && (
            <div style={styles.card}>
              <div style={styles.cardIcon}>🏭</div>
              <h3 style={styles.cardTitle}>Kho hàng</h3>
              <div style={styles.cardValue}>{stats.inventory.total_stock?.toLocaleString()}</div>
              <div style={{ ...styles.cardSub, color: stats.inventory.low_stock_items > 0 ? '#ef4444' : '#6b7280' }}>
                {stats.inventory.low_stock_items} sản phẩm sắp hết
              </div>
            </div>
          )}

          {stats.users && (
            <div style={styles.card}>
              <div style={styles.cardIcon}>👥</div>
              <h3 style={styles.cardTitle}>Người dùng</h3>
              <div style={styles.cardValue}>{stats.users.total_users}</div>
              <div style={styles.cardSub}>{stats.users.active_users} đang hoạt động</div>
            </div>
          )}
        </div>
      )}

      {/* Quick Links */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>🔗 Thao tác nhanh</h2>
        <div style={styles.quickLinks}>
          <Link to="/staff/pick-products" style={styles.quickLink}>
            📤 Xuất sản phẩm
          </Link>
          <Link to="/staff/sales-history" style={styles.quickLink}>
            📋 Lịch sử bán hàng
          </Link>
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
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' },
  card: { background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' },
  cardIcon: { fontSize: '2.5rem', marginBottom: '0.5rem' },
  cardTitle: { fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' },
  cardValue: { fontSize: '2rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.25rem' },
  cardSub: { fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' },
  section: { background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  sectionTitle: { fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' },
  quickLinks: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' },
  quickLink: { display: 'block', padding: '1rem', background: '#f3f4f6', borderRadius: '8px', textAlign: 'center', textDecoration: 'none', color: '#1f2937', fontWeight: '500' },
};
