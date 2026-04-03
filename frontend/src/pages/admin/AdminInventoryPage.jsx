import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../shared/AuthContext';

export default function AdminInventoryPage() {
  const { token } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addStockData, setAddStockData] = useState({ productId: '', quantity: '', warehouseLocation: '', note: '' });

  const fetchInventory = useCallback(async () => {
    try {
      const res = await axios.get('/api/inventory', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInventory(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [token]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleAddStock = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/inventory/add-stock', addStockData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Nhập kho thành công');
      setShowAddModal(false);
      setAddStockData({ productId: '', quantity: '', warehouseLocation: '', note: '' });
      fetchInventory();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || 'Không thể nhập kho'));
    }
  };

  const handleUpdateInventory = async (inventoryId, field, value) => {
    try {
      await axios.put(`/api/inventory/${inventoryId}`, { [field]: value }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Cập nhật thành công');
      fetchInventory();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || 'Không thể cập nhật'));
    }
  };

  if (loading) return <div className="admin-page">Đang tải...</div>;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Quản lý kho</h1>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          + Nhập kho
        </button>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Sản phẩm</th>
              <th>SKU</th>
              <th>Tổng số lượng</th>
              <th>Khả dụng</th>
              <th>Đã đặt</th>
              <th>Vị trí</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.inventory_id}>
                <td>{item.inventory_id}</td>
                <td>{item.product_name}</td>
                <td>{item.sku}</td>
                <td>{item.stock_quantity}</td>
                <td>{item.available_quantity}</td>
                <td>{item.reserved_quantity}</td>
                <td>
                  <input
                    type="text"
                    value={item.warehouse_location || ''}
                    onChange={(e) => handleUpdateInventory(item.inventory_id, 'warehouse_location', e.target.value)}
                    placeholder="Nhập vị trí"
                    style={{ width: '100px' }}
                  />
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => handleUpdateInventory(item.inventory_id, 'stock_quantity', item.stock_quantity + 1)}
                  >
                    +1
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Nhập kho</h2>
            <form onSubmit={handleAddStock}>
              <div className="form-group">
                <label>ID Sản phẩm</label>
                <input
                  type="number"
                  value={addStockData.productId}
                  onChange={(e) => setAddStockData({ ...addStockData, productId: e.target.value })}
                  required
                  placeholder="Nhập product_id"
                />
              </div>
              <div className="form-group">
                <label>Số lượng</label>
                <input
                  type="number"
                  value={addStockData.quantity}
                  onChange={(e) => setAddStockData({ ...addStockData, quantity: e.target.value })}
                  required
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>Vị trí kho</label>
                <input
                  type="text"
                  value={addStockData.warehouseLocation}
                  onChange={(e) => setAddStockData({ ...addStockData, warehouseLocation: e.target.value })}
                  placeholder="Kho A, Kho B..."
                />
              </div>
              <div className="form-group">
                <label>Ghi chú</label>
                <textarea
                  value={addStockData.note}
                  onChange={(e) => setAddStockData({ ...addStockData, note: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  Nhập kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .admin-page {
          padding: 1.5rem;
        }
        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
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
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: #fff;
          padding: 2rem;
          border-radius: 8px;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
        }
        .form-group {
          margin-bottom: 1rem;
        }
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        .form-group input, .form-group textarea {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
          margin-top: 1.5rem;
        }
      `}</style>
    </div>
  );
}
