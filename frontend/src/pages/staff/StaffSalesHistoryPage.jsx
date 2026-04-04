import { useEffect, useState, useCallback } from 'react';
import api from '../../config/api';
import { useAuth } from '../../shared/AuthContext';

export default function StaffSalesHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  const fetchHistory = useCallback(async () => {
    try {
      const params = {};
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;

      const res = await api.get('/api/inventory/sales-history', { params });
      setHistory(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [dateRange.startDate, dateRange.endDate]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleApplyFilter = () => {
    fetchHistory();
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
    <div className="staff-page">
      <h1>Lịch sử bán hàng / Xuất kho</h1>

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

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Sản phẩm</th>
              <th>SKU</th>
              <th>Loại</th>
              <th>Số lượng</th>
              <th>Nhân viên</th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                  Chưa có giao dịch nào
                </td>
              </tr>
            ) : (
              history.map((item) => (
                <tr key={item.transaction_id}>
                  <td>{new Date(item.created_at).toLocaleString('vi-VN')}</td>
                  <td>{item.product_name}</td>
                  <td>{item.sku}</td>
                  <td>
                    <span className={`type-badge ${getTypeClass(item.transaction_type)}`}>
                      {getTypeLabel(item.transaction_type)}
                    </span>
                  </td>
                  <td>
                    <span className={item.quantity < 0 ? 'quantity-negative' : 'quantity-positive'}>
                      {item.quantity > 0 ? '+' : ''}{item.quantity}
                    </span>
                  </td>
                  <td>{item.staff_name}</td>
                  <td>{item.note || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .staff-page {
          padding: 1.5rem;
        }
        .staff-page h1 {
          margin-bottom: 1.5rem;
          color: #333;
        }
        .filter-section {
          display: flex;
          gap: 1rem;
          align-items: flex-end;
          margin-bottom: 1.5rem;
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
        .quantity-negative {
          color: #dc3545;
          font-weight: 600;
        }
        .quantity-positive {
          color: #28a745;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
