import React, { useEffect, useState } from 'react';
import { permissionsApi } from '../../services/rbacApi';
import { useAuth } from '../../shared/AuthContext';

export default function AdminPermissionsPage() {
  const { hasPermission } = useAuth();
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (hasPermission('VIEW_PERMISSIONS')) {
      loadPermissions();
    }
  }, [hasPermission]);

  const loadPermissions = async () => {
    try {
      const res = await permissionsApi.getAll();
      setPermissions(res.data.permissions || []);
    } catch {
      setMessage({ type: 'error', text: 'Không thể tải danh sách permissions' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPermission) {
        await permissionsApi.update(editingPermission.id, formData);
        setMessage({ type: 'success', text: 'Cập nhật permission thành công' });
      } else {
        await permissionsApi.create(formData);
        setMessage({ type: 'success', text: 'Tạo permission thành công' });
      }
      setShowModal(false);
      setEditingPermission(null);
      setFormData({ name: '', description: '' });
      loadPermissions();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Có lỗi xảy ra' });
    }
  };

  const handleEdit = (permission) => {
    setEditingPermission(permission);
    setFormData({ name: permission.name, description: permission.description || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa permission này?')) return;
    
    try {
      await permissionsApi.delete(id);
      setMessage({ type: 'success', text: 'Xóa permission thành công' });
      loadPermissions();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Có lỗi xảy ra' });
    }
  };

  // Group permissions by category
  const groupedPermissions = permissions.reduce((acc, perm) => {
    const category = perm.name.split('_')[0] || 'OTHER';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(perm);
    return acc;
  }, {});

  const categoryColors = {
    VIEW: 'info',
    CREATE: 'success',
    EDIT: 'warning',
    DELETE: 'danger',
    DASHBOARD: 'primary',
    USERS: 'secondary',
    ROLES: 'dark',
    PERMISSIONS: 'light',
    PRODUCTS: 'success',
    ORDERS: 'warning',
    INVENTORY: 'info',
  };

  if (!hasPermission('VIEW_PERMISSIONS')) {
    return <div className="access-denied">Bạn không có quyền truy cập trang này</div>;
  }

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className="admin-permissions-page">
      <div className="page-header">
        <h1>Quản lý Quyền (Permissions)</h1>
        {hasPermission('CREATE_PERMISSION') && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Tạo Permission mới
          </button>
        )}
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      <div className="permissions-by-category">
        {Object.entries(groupedPermissions).map(([category, perms]) => (
          <div key={category} className="permission-category">
            <h3 className="category-title">
              <span className={`badge badge-${categoryColors[category] || 'secondary'}`}>
                {category}
              </span>
            </h3>
            <div className="permission-grid">
              {perms.map(perm => (
                <div key={perm.id} className="permission-card">
                  <div className="permission-header">
                    <strong>{perm.name}</strong>
                    <span className={`badge badge-${categoryColors[category] || 'secondary'}`}>
                      {perm.role_count || 0} roles
                    </span>
                  </div>
                  <p className="permission-description">{perm.description || 'Không có mô tả'}</p>
                  <div className="permission-actions">
                    {hasPermission('EDIT_PERMISSION') && (
                      <button 
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleEdit(perm)}
                      >
                        Sửa
                      </button>
                    )}
                    {hasPermission('DELETE_PERMISSION') && (
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(perm.id)}
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Permission Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{editingPermission ? 'Sửa Permission' : 'Tạo Permission mới'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tên Permission *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                  placeholder="VD: VIEW_USERS, CREATE_PRODUCT"
                  required
                />
                <small className="form-text">Tên permission sẽ được tự động chuyển thành chữ HOA và thay khoảng trắng bằng dấu gạch dưới</small>
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  className="form-control"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  placeholder="Mô tả chức năng của permission này"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingPermission ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .permissions-by-category {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }
        .permission-category {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .category-title {
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 2px solid #eee;
        }
        .badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .badge-primary { background: #007bff; color: white; }
        .badge-secondary { background: #6c757d; color: white; }
        .badge-success { background: #28a745; color: white; }
        .badge-info { background: #17a2b8; color: white; }
        .badge-warning { background: #ffc107; color: #333; }
        .badge-danger { background: #dc3545; color: white; }
        .badge-dark { background: #343a40; color: white; }
        .badge-light { background: #f8f9fa; color: #333; border: 1px solid #ddd; }
        .permission-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 15px;
        }
        .permission-card {
          background: #f8f9fa;
          border-radius: 6px;
          padding: 15px;
          border: 1px solid #e9ecef;
          transition: transform 0.2s;
        }
        .permission-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .permission-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .permission-header strong {
          font-size: 14px;
          color: #333;
        }
        .permission-description {
          font-size: 13px;
          color: #666;
          margin: 10px 0;
        }
        .permission-actions {
          display: flex;
          gap: 8px;
          margin-top: 10px;
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal-content {
          background: white;
          padding: 30px;
          border-radius: 8px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }
        .form-group {
          margin-bottom: 15px;
        }
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }
        .form-control {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .form-text {
          display: block;
          margin-top: 5px;
          font-size: 12px;
          color: #666;
        }
        .alert {
          padding: 12px 16px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        .alert-success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }
        .alert-error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
        .access-denied {
          text-align: center;
          padding: 50px;
          color: #dc3545;
          font-size: 18px;
        }
      `}</style>
    </div>
  );
}
