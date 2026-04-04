import { useEffect, useState, useCallback } from 'react';
import api from '../../config/api';
import { useAuth } from '../../shared/AuthContext';

export default function AdminReportsPage() {
  const { token } = useAuth();
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  const fetchReports = useCallback(async () => {
    try {
      const params = {};
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;

      const res = await api.get('/api/staff/reports/overview', { params });
      setReports(res.data);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, [dateRange.startDate, dateRange.endDate]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleApplyFilter = () => {
    fetchReports();
  };

  if (loading) return <div className="admin-page">Đang tải...</div>;

  return (
    <div className="admin-page">
      <h1>Báo cáo tổng quan</h1>

      <div className="filter-section">
        <div className="filter-group">
          <label>Từ ngày</label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
          />
        </div>
        <div className="filter-group">
          <label>Đến ngày</label>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
          />
        </div>
        <button className="btn btn-primary" onClick={handleApplyFilter}>
          Lọc
        </button>
      </div>

      {reports && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Tổng sản phẩm</h3>
              <p className="stat-value">{reports.inventory?.total_products || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Tổng tồn kho</h3>
              <p className="stat-value">{reports.inventory?.total_stock || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Sẵn sàng bán</h3>
              <p className="stat-value">{reports.inventory?.total_available || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Đã đặt hàng</h3>
              <p className="stat-value">{reports.inventory?.total_reserved || 0}</p>
            </div>
          </div>

          <div className="reports-section">
            <h2>Thống kê đơn hàng</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Tổng đơn hàng</h3>
                <p className="stat-value">{reports.orders?.total_orders || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Đơn hoàn thành</h3>
                <p className="stat-value">{reports.orders?.completed_orders || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Doanh thu</h3>
                <p className="stat-value">
                  {Number(reports.orders?.total_revenue || 0).toLocaleString('vi-VN')}₫
                </p>
              </div>
            </div>
          </div>

          <div className="reports-section">
            <h2>Thống kê xuất kho</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Tổng giao dịch</h3>
                <p className="stat-value">{reports.sales?.total_transactions || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Tổng số lượng xuất</h3>
                <p className="stat-value">{reports.sales?.total_quantity || 0}</p>
              </div>
            </div>

            {reports.sales?.by_product && reports.sales.by_product.length > 0 && (
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th>Số lượng xuất</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.sales.by_product.map((item) => (
                      <tr key={item.product_id}>
                        <td>{item.product_name}</td>
                        <td>{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      <style>{`
        .admin-page {
          padding: 1.5rem;
        }
        .admin-page h1 {
          margin-bottom: 1.5rem;
        }
        .filter-section {
          display: flex;
          gap: 1rem;
          align-items: flex-end;
          margin-bottom: 2rem;
          background: #fff;
          padding: 1rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .filter-group label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #555;
        }
        .filter-group input {
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .stat-card {
          background: #fff;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .stat-card h3 {
          font-size: 0.875rem;
          color: #666;
          margin-bottom: 0.5rem;
        }
        .stat-value {
          font-size: 1.75rem;
          font-weight: bold;
          color: #007bff;
        }
        .reports-section {
          margin-bottom: 2rem;
        }
        .reports-section h2 {
          margin-bottom: 1rem;
          color: #333;
        }
        .table-container {
          background: #fff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
        }
        .admin-table th, .admin-table td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid #e0e0e0;
        }
        .admin-table th {
          background: #f5f5f5;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
