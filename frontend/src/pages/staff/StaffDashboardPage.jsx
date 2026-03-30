import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../shared/AuthContext';

export default function StaffDashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    myTransactionsToday: 0,
    totalTransactionsToday: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const [inventoryRes, transactionsRes, myActivityRes] = await Promise.all([
        axios.get('/api/inventory', config),
        axios.get('/api/inventory/transactions?limit=10', config),
        axios.get('/api/staff/my-activity?limit=5', config),
      ]);

      const inventory = inventoryRes.data || [];
      const transactions = transactionsRes.data || [];
      const myActivity = myActivityRes.data || [];

      // Count low stock products (available < 10)
      const lowStock = inventory.filter((item) => item.available_quantity < 10);

      // Count today's transactions
      const today = new Date().toISOString().split('T')[0];
      const todayTransactions = transactions.filter(
        (t) => new Date(t.created_at).toISOString().split('T')[0] === today
      );
      const myTodayTransactions = myActivity.filter(
        (t) => new Date(t.created_at).toISOString().split('T')[0] === today
      );

      setStats({
        totalProducts: inventory.length,
        lowStockProducts: lowStock.length,
        myTransactionsToday: myTodayTransactions.length,
        totalTransactionsToday: todayTransactions.length,
      });

      setRecentTransactions(transactions.slice(0, 10));
      setLowStockItems(lowStock.slice(0, 5));
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      in: 'Nhập kho',
      out: 'Xuất kho',
      adjustment: 'Điều chỉnh',
      return: 'Trả hàng',
    };
    return labels[type] || type;
  };

  const getTypeClass = (type) => {
    const classes = {
      in: 'type-in',
      out: 'type-out',
      adjustment: 'type-adjustment',
      return: 'type-return',
    };
    return classes[type] || '';
  };

  if (loading) return <div className="staff-page">Đang tải...</div>;

  return (
    <div className="staff-dashboard">
      <h2>Tổng quan nhân viên</h2>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Tổng sản phẩm</h3>
          <p className="stat-value">{stats.totalProducts}</p>
        </div>
        <div className="stat-card warning">
          <h3>Sắp hết hàng</h3>
          <p className="stat-value">{stats.lowStockProducts}</p>
        </div>
        <div className="stat-card success">
          <h3>Xuất kho hôm nay</h3>
          <p className="stat-value">{stats.myTransactionsToday}</p>
        </div>
        <div className="stat-card">
          <h3>Tổng giao dịch hôm nay</h3>
          <p className="stat-value">{stats.totalTransactionsToday}</p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="dashboard-section">
        <h3>Giao dịch gần đây</h3>
        {recentTransactions.length === 0 ? (
          <p className="no-data">Chưa có giao dịch nào</p>
        ) : (
          <table className="staff-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Sản phẩm</th>
                <th>Loại</th>
                <th>Số lượng</th>
                <th>Nhân viên</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((t) => (
                <tr key={t.transaction_id}>
                  <td>{new Date(t.created_at).toLocaleString('vi-VN')}</td>
                  <td>{t.product_name}</td>
                  <td>
                    <span className={`type-badge ${getTypeClass(t.transaction_type)}`}>
                      {getTypeLabel(t.transaction_type)}
                    </span>
                  </td>
                  <td>
                    <span className={t.quantity < 0 ? 'qty-negative' : 'qty-positive'}>
                      {t.quantity > 0 ? '+' : ''}{t.quantity}
                    </span>
                  </td>
                  <td>{t.staff_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="dashboard-section">
          <h3>Cảnh báo sắp hết hàng</h3>
          <table className="staff-table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>SKU</th>
                <th>Còn lại</th>
                <th>Vị trí</th>
              </tr>
            </thead>
            <tbody>
              {lowStockItems.map((item) => (
                <tr key={item.inventory_id}>
                  <td>{item.product_name}</td>
                  <td>{item.sku}</td>
                  <td>
                    <span className="qty-negative">{item.available_quantity}</span>
                  </td>
                  <td>{item.warehouse_location || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .staff-dashboard h2 {
          margin-bottom: 1.5rem;
          color: #333;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .stat-card {
          background: #fff;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .stat-card h3 {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 0.5rem;
        }
        .stat-value {
          font-size: 2rem;
          font-weight: bold;
          color: #3b82f6;
        }
        .stat-card.warning .stat-value {
          color: #f59e0b;
        }
        .stat-card.success .stat-value {
          color: #10b981;
        }
        .dashboard-section {
          background: #fff;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .dashboard-section h3 {
          margin-bottom: 1rem;
          color: #333;
        }
        .no-data {
          color: #999;
          text-align: center;
          padding: 2rem;
        }
        .staff-table {
          width: 100%;
          border-collapse: collapse;
        }
        .staff-table th, .staff-table td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid #e0e0e0;
        }
        .staff-table th {
          background: #f5f5f5;
          font-weight: 600;
          color: #555;
        }
        .type-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .type-in {
          background: #d4edda;
          color: #155724;
        }
        .type-out {
          background: #f8d7da;
          color: #721c24;
        }
        .type-adjustment {
          background: #fff3cd;
          color: #856404;
        }
        .type-return {
          background: #d1ecf1;
          color: #0c5460;
        }
        .qty-negative {
          color: #dc3545;
          font-weight: 600;
        }
        .qty-positive {
          color: #28a745;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
