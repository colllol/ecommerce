import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../shared/AuthContext';

export default function AdminDashboardPage() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    categories: 0,
    orders: 0,
    revenue: 0,
    completedOrders: 0,
    pendingOrders: 0,
  });
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [usersRes, productsRes, categoriesRes, ordersRes] = await Promise.all([
        axios.get('/api/users'),
        axios.get('/api/products'),
        axios.get('/api/categories'),
        axios.get('/api/orders'),
      ]);

      const orders = ordersRes.data ?? [];
      const completedOrders = orders.filter((o) => o.order_status === 'completed');
      const pendingOrders = orders.filter((o) => o.order_status === 'pending');
      
      const totalRevenue = completedOrders.reduce(
        (sum, ord) => sum + Number(ord.total_amount || 0),
        0
      );

      // Calculate revenue by day (last 7 days)
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push(date);
      }

      const dailyRevenue = last7Days.map((date) => {
        const dateStr = date.toISOString().split('T')[0];
        const dayOrders = orders.filter((o) => {
          const orderDate = new Date(o.created_at).toISOString().split('T')[0];
          return orderDate === dateStr && o.order_status === 'completed';
        });
        const revenue = dayOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
        return {
          date: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
          revenue,
        };
      });

      setStats({
        users: usersRes.data?.length ?? 0,
        products: productsRes.data?.length ?? 0,
        categories: categoriesRes.data?.length ?? 0,
        orders: orders.length,
        revenue: totalRevenue,
        completedOrders: completedOrders.length,
        pendingOrders: pendingOrders.length,
      });
      setRevenueData(dailyRevenue);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const cards = [
    { label: 'Người dùng', count: stats.users, path: '/admin/users', color: '#4f46e5' },
    { label: 'Danh mục', count: stats.categories, path: '/admin/categories', color: '#059669' },
    { label: 'Sản phẩm', count: stats.products, path: '/admin/products', color: '#dc2626' },
    { label: 'Đơn hàng', count: stats.orders, path: '/admin/orders', color: '#d97706' },
  ];

  const maxRevenue = Math.max(...revenueData.map((d) => d.revenue), 1);

  return (
    <div className="admin-page">
      <h2>Tổng quan quản trị</h2>

      {loading ? (
        <p className="admin-loading">Đang tải...</p>
      ) : (
        <>
          <div className="admin-revenue">
            <span className="admin-revenue-label">Doanh thu tổng</span>
            <span className="admin-revenue-value">{stats.revenue.toLocaleString('vi-VN')} đ</span>
          </div>

          {/* Revenue Chart */}
          <div className="revenue-chart-section">
            <h3>Biến động doanh thu (7 ngày qua)</h3>
            <div className="revenue-chart">
              {revenueData.map((item, index) => (
                <div key={index} className="chart-bar-container">
                  <div
                    className="chart-bar"
                    style={{
                      height: `${(item.revenue / maxRevenue) * 200}px`,
                      backgroundColor: item.revenue > 0 ? '#3b82f6' : '#e5e7eb',
                    }}
                  >
                    {item.revenue > 0 && (
                      <span className="chart-bar-value">
                        {(item.revenue / 1000000).toFixed(1)}M
                      </span>
                    )}
                  </div>
                  <span className="chart-bar-label">{item.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="quick-stats">
            <div className="stat-box">
              <span className="stat-label">Đơn hoàn thành</span>
              <span className="stat-value success">{stats.completedOrders}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Chờ xử lý</span>
              <span className="stat-value warning">{stats.pendingOrders}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Tổng đơn hàng</span>
              <span className="stat-value">{stats.orders}</span>
            </div>
          </div>

          <div className="admin-dashboard-cards">
            {cards.map((card) => (
              <Link key={card.path} to={card.path} className="admin-card">
                <span className="admin-card-count" style={{ backgroundColor: card.color }}>
                  {card.count}
                </span>
                <span className="admin-card-label">{card.label}</span>
              </Link>
            ))}
          </div>
        </>
      )}

      <style>{`
        .admin-page h2 {
          margin-bottom: 1.5rem;
          color: #333;
        }
        .admin-revenue {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 2rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .admin-revenue-label {
          font-size: 1rem;
          opacity: 0.9;
        }
        .admin-revenue-value {
          font-size: 2.5rem;
          font-weight: bold;
          margin-top: 0.5rem;
        }
        .revenue-chart-section {
          background: #fff;
          padding: 1.5rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .revenue-chart-section h3 {
          margin-bottom: 1.5rem;
          color: #333;
        }
        .revenue-chart {
          display: flex;
          justify-content: space-around;
          align-items: flex-end;
          height: 260px;
          padding: 20px 10px;
          background: #f9fafb;
          border-radius: 8px;
        }
        .chart-bar-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        .chart-bar {
          width: 60px;
          border-radius: 8px 8px 0 0;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 8px;
          transition: all 0.3s;
          position: relative;
        }
        .chart-bar:hover {
          opacity: 0.8;
          transform: translateY(-4px);
        }
        .chart-bar-value {
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          white-space: nowrap;
        }
        .chart-bar-label {
          font-size: 0.75rem;
          color: #6b7280;
          font-weight: 500;
        }
        .quick-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .stat-box {
          background: #fff;
          padding: 1.5rem;
          border-radius: 8px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .stat-label {
          display: block;
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 0.5rem;
        }
        .stat-value {
          display: block;
          font-size: 2rem;
          font-weight: bold;
          color: #3b82f6;
        }
        .stat-value.success {
          color: #10b981;
        }
        .stat-value.warning {
          color: #f59e0b;
        }
        .admin-dashboard-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }
        .admin-card {
          background: #fff;
          padding: 1.5rem;
          border-radius: 8px;
          text-align: center;
          text-decoration: none;
          color: inherit;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.2s;
        }
        .admin-card:hover {
          transform: translateY(-4px);
        }
        .admin-card-count {
          display: block;
          font-size: 2.5rem;
          font-weight: bold;
          color: white;
          padding: 0.5rem;
          border-radius: 8px;
          margin-bottom: 0.5rem;
        }
        .admin-card-label {
          font-size: 1rem;
          color: #6b7280;
        }
        .admin-loading {
          color: #6b7280;
          text-align: center;
          padding: 2rem;
        }
      `}</style>
    </div>
  );
}
