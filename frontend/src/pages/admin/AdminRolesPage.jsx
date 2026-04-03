import React, { useEffect, useState } from 'react';
import { rolesApi, permissionsApi } from '../../services/rbacApi';
import { useAuth } from '../../shared/AuthContext';

export default function AdminRolesPage() {
  const { hasPermission } = useAuth();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (hasPermission('VIEW_ROLES')) {
      loadRoles();
      loadPermissions();
    }
  }, [hasPermission]);

  const loadRoles = async () => {
    try {
      const res = await rolesApi.getAll();
      setRoles(res.data.roles || []);
    } catch {
      setMessage({ type: 'error', text: 'Không thể tải danh sách roles' });
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async () => {
    try {
      const res = await permissionsApi.getAll();
      setPermissions(res.data.permissions || []);
    } catch {
      setMessage({ type: 'error', text: 'Không thể tải danh sách permissions' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRole) {
        await rolesApi.update(editingRole.id, formData);
        setMessage({ type: 'success', text: 'Cập nhật role thành công' });
      } else {
        await rolesApi.create(formData);
        setMessage({ type: 'success', text: 'Tạo role thành công' });
      }
      setShowModal(false);
      setEditingRole(null);
      setFormData({ name: '', description: '' });
      loadRoles();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Có lỗi xảy ra' });
    }
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setFormData({ name: role.name, description: role.description || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa role này?')) return;
    
    try {
      await rolesApi.delete(id);
      setMessage({ type: 'success', text: 'Xóa role thành công' });
      loadRoles();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Có lỗi xảy ra' });
    }
  };

  const handleManagePermissions = async (role) => {
    setEditingRole(role);
    try {
      const res = await rolesApi.getById(role.id);
      const roleData = res.data.role;
      setSelectedPermissions(roleData.permissions?.map(p => p.id) || []);
      setShowPermissionsModal(true);
    } catch {
      setMessage({ type: 'error', text: 'Không thể tải permissions của role' });
    }
  };

  const handleAssignPermissions = async () => {
    try {
      await rolesApi.assignPermissions(editingRole.id, selectedPermissions);
      setMessage({ type: 'success', text: 'Gán permissions thành công' });
      setShowPermissionsModal(false);
      loadRoles();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Có lỗi xảy ra' });
    }
  };

  const togglePermission = (permissionId) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  if (!hasPermission('VIEW_ROLES')) {
    return <div className="access-denied">Bạn không có quyền truy cập trang này</div>;
  }

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className="admin-roles-page">
      <div className="page-header">
        <h1>Quản lý Vai trò (Roles)</h1>
        {hasPermission('CREATE_ROLE') && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Tạo Role mới
          </button>
        )}
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên Role</th>
              <th>Mô tả</th>
              <th>Số User</th>
              <th>Số Permissions</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {roles.map(role => (
              <tr key={role.id}>
                <td>{role.id}</td>
                <td><strong>{role.name}</strong></td>
                <td>{role.description || '-'}</td>
                <td>{role.user_count || 0}</td>
                <td>{role.permission_count || 0}</td>
                <td>
                  {hasPermission('EDIT_ROLE') && (
                    <>
                      <button 
                        className="btn btn-sm btn-secondary me-2"
                        onClick={() => handleEdit(role)}
                      >
                        Sửa
                      </button>
                      <button 
                        className="btn btn-sm btn-info me-2"
                        onClick={() => handleManagePermissions(role)}
                      >
                        Gán Permissions
                      </button>
                    </>
                  )}
                  {hasPermission('DELETE_ROLE') && (
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(role.id)}
                    >
                      Xóa
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Role Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{editingRole ? 'Sửa Role' : 'Tạo Role mới'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tên Role *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  className="form-control"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingRole ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Permissions Modal */}
      {showPermissionsModal && (
        <div className="modal-overlay" onClick={() => setShowPermissionsModal(false)}>
          <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
            <h2>Gán Permissions cho &quot;{editingRole?.name}&quot;</h2>
            <div className="permissions-grid">
              {permissions.map(perm => (
                <label key={perm.id} className="permission-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(perm.id)}
                    onChange={() => togglePermission(perm.id)}
                  />
                  <span>
                    <strong>{perm.name}</strong>
                    <small>{perm.description || ''}</small>
                  </span>
                </label>
              ))}
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowPermissionsModal(false)}>
                Hủy
              </button>
              <button type="button" className="btn btn-primary" onClick={handleAssignPermissions}>
                Lưu thay đổi
              </button>
            </div>
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
        .table-responsive {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
        .modal-large {
          max-width: 800px;
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
        .permissions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 10px;
          max-height: 400px;
          overflow-y: auto;
          margin: 20px 0;
        }
        .permission-checkbox {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 4px;
          cursor: pointer;
        }
        .permission-checkbox:hover {
          background: #e9ecef;
        }
        .permission-checkbox span {
          display: flex;
          flex-direction: column;
        }
        .permission-checkbox small {
          color: #666;
          font-size: 12px;
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
      `}</style>
    </div>
  );
}
