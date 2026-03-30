import React, { useEffect, useState } from 'react';
import { usersApi, rolesApi } from '../../services/rbacApi';
import { useAuth } from '../../shared/AuthContext';

export default function AdminUsersPage() {
  const { hasPermission, hasRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    roleIds: [],
    status: 'active',
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await usersApi.getAll();
      setUsers(res.data.users || []);
    } catch (e) {
      setMessage({ type: 'error', text: e.response?.data?.message || 'Lỗi tải dữ liệu' });
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const res = await rolesApi.getAll();
      setRoles(res.data.roles || []);
    } catch (e) {
      console.error('Failed to load roles:', e);
    }
  };

  useEffect(() => {
    if (hasPermission('VIEW_USERS')) {
      loadUsers();
      loadRoles();
    }
  }, []);

  const openCreate = () => {
    setForm({ full_name: '', email: '', phone: '', password: '', roleIds: [], status: 'active' });
    setError('');
    setModal('create');
  };

  const openEdit = (user) => {
    setForm({
      full_name: user.full_name,
      email: user.email,
      phone: user.phone || '',
      password: '',
      roleIds: user.roleDetails?.map(r => r.id) || [],
      status: user.status,
    });
    setError('');
    setModal({ type: 'edit', user });
  };

  const openDelete = (user) => {
    setModal({ type: 'delete', user });
  };

  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.full_name || !form.email || !form.password) {
      setError('Họ tên, email và mật khẩu là bắt buộc');
      return;
    }
    try {
      const data = {
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        status: form.status,
      };
      await usersApi.create(data);
      setMessage({ type: 'success', text: 'Tạo người dùng thành công' });
      setModal(null);
      loadUsers();
    } catch (e) {
      setError(e.response?.data?.message || 'Lỗi tạo người dùng');
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.full_name || !form.email) {
      setError('Họ tên và email là bắt buộc');
      return;
    }
    try {
      const data = { 
        full_name: form.full_name, 
        email: form.email, 
        phone: form.phone, 
        status: form.status 
      };
      if (form.password) data.password = form.password;
      await usersApi.update(modal.user.user_id, data);
      
      // Assign roles if changed
      if (form.roleIds.length > 0) {
        await usersApi.assignRoles(modal.user.user_id, form.roleIds);
      }
      
      setMessage({ type: 'success', text: 'Cập nhật người dùng thành công' });
      setModal(null);
      loadUsers();
    } catch (e) {
      setError(e.response?.data?.message || 'Lỗi cập nhật');
    }
  };

  const handleDelete = async () => {
    try {
      await usersApi.delete(modal.user.user_id);
      setMessage({ type: 'success', text: 'Xóa người dùng thành công' });
      setModal(null);
      loadUsers();
    } catch (e) {
      setError(e.response?.data?.message || 'Lỗi xóa');
    }
  };

  const toggleRole = (roleId) => {
    setForm(prev => ({
      ...prev,
      roleIds: prev.roleIds.includes(roleId)
        ? prev.roleIds.filter(id => id !== roleId)
        : [...prev.roleIds, roleId]
    }));
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch = !search || [u.full_name, u.email, u.phone].some(
      (v) => v && String(v).toLowerCase().includes(search.toLowerCase())
    );
    const matchRole = !filterRole || u.role === filterRole;
    const matchStatus = !filterStatus || u.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  if (!hasPermission('VIEW_USERS')) {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>Bạn không có quyền truy cập trang này</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2>Quản lý người dùng</h2>
        {hasPermission('CREATE_USER') && (
          <button className="btn btn-primary" onClick={openCreate}>
            Thêm người dùng
          </button>
        )}
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      <div className="admin-search-filter">
        <input
          type="text"
          placeholder="Tìm theo tên, email, SĐT..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
          <option value="">Tất cả vai trò</option>
          {roles.map(r => (
            <option key={r.id} value={r.name}>{r.name}</option>
          ))}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="inactive">Tạm khóa</option>
          <option value="blocked">Bị chặn</option>
        </select>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>SĐT</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.user_id}>
                <td>{u.user_id}</td>
                <td>{u.full_name}</td>
                <td>{u.email}</td>
                <td>{u.phone || '-'}</td>
                <td>
                  {u.roleDetails && u.roleDetails.length > 0 ? (
                    u.roleDetails.map(r => (
                      <span key={r.id} className="badge badge-primary">{r.name}</span>
                    ))
                  ) : (
                    '-'
                  )}
                </td>
                <td>
                  <span className={`badge badge-${u.status === 'active' ? 'success' : u.status === 'blocked' ? 'danger' : 'warning'}`}>
                    {u.status}
                  </span>
                </td>
                <td>
                  {hasPermission('EDIT_USER') && (
                    <>
                      <button className="btn-small btn-edit" onClick={() => openEdit(u)}>Sửa</button>
                      <button className="btn-small btn-info" onClick={() => openEdit(u)}>Gán vai trò</button>
                    </>
                  )}
                  {hasPermission('DELETE_USER') && (
                    <button className="btn-small btn-danger" onClick={() => openDelete(u)}>Xóa</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modal === 'create' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Thêm người dùng</h3>
            <form onSubmit={handleSubmitCreate} className="form-grid">
              <label>
                Họ tên <span className="required">*</span>
                <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
              </label>
              <label>
                Email <span className="required">*</span>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </label>
              <label>
                Số điện thoại
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </label>
              <label>
                Mật khẩu <span className="required">*</span>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              </label>
              <label>
                Trạng thái
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Tạm khóa</option>
                </select>
              </label>
              {error && <p className="error form-full">{error}</p>}
              <div className="form-actions form-full">
                <button type="submit" className="btn btn-primary">Tạo</button>
                <button type="button" className="btn" onClick={() => setModal(null)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal?.type === 'edit' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <h3>Sửa người dùng</h3>
            <form onSubmit={handleSubmitEdit} className="form-grid">
              <label>
                Họ tên <span className="required">*</span>
                <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
              </label>
              <label>
                Email <span className="required">*</span>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </label>
              <label>
                Số điện thoại
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </label>
              <label>
                Mật khẩu mới (để trống nếu không đổi)
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </label>
              <label>
                Trạng thái
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Tạm khóa</option>
                </select>
              </label>
              <div className="form-full">
                <label>Vai trò</label>
                <div className="role-checkboxes">
                  {roles.map(role => (
                    <label key={role.id} className="role-checkbox">
                      <input
                        type="checkbox"
                        checked={form.roleIds.includes(role.id)}
                        onChange={() => toggleRole(role.id)}
                      />
                      <span>
                        <strong>{role.name}</strong>
                        <small>{role.description || ''}</small>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              {error && <p className="error form-full">{error}</p>}
              <div className="form-actions form-full">
                <button type="submit" className="btn btn-primary">Cập nhật</button>
                <button type="button" className="btn" onClick={() => setModal(null)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal?.type === 'delete' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal modal-confirm" onClick={(e) => e.stopPropagation()}>
            <h3>Xóa người dùng</h3>
            <p>Bạn có chắc muốn xóa <strong>{modal.user.full_name}</strong> ({modal.user.email})?</p>
            {error && <p className="error">{error}</p>}
            <div className="form-actions">
              <button className="btn btn-danger" onClick={handleDelete}>Xóa</button>
              <button className="btn" onClick={() => setModal(null)}>Hủy</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-page {
          padding: 20px;
          background: #f5f5f5;
          min-height: 100vh;
        }
        .admin-page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .admin-page-header h2 {
          margin: 0;
          color: #333;
        }
        .admin-search-filter {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          background: white;
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .admin-search-filter input,
        .admin-search-filter select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        .admin-search-filter input {
          flex: 1;
        }
        .table {
          width: 100%;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .table th,
        .table td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        .table th {
          background: #f8f9fa;
          font-weight: 600;
          color: #333;
        }
        .table tr:hover {
          background: #f8f9fa;
        }
        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }
        .btn-primary {
          background: #007bff;
          color: white;
        }
        .btn-primary:hover {
          background: #0056b3;
        }
        .btn-info {
          background: #17a2b8;
          color: white;
        }
        .btn-info:hover {
          background: #117a8b;
        }
        .btn-danger {
          background: #dc3545;
          color: white;
        }
        .btn-danger:hover {
          background: #c82333;
        }
        .btn-small {
          padding: 4px 8px;
          font-size: 12px;
          margin-right: 5px;
        }
        .btn-edit {
          background: #28a745;
          color: white;
        }
        .btn-edit:hover {
          background: #218838;
        }
        .badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          margin-right: 4px;
          margin-bottom: 4px;
        }
        .badge-primary {
          background: #007bff;
          color: white;
        }
        .badge-success {
          background: #28a745;
          color: white;
        }
        .badge-warning {
          background: #ffc107;
          color: #333;
        }
        .badge-danger {
          background: #dc3545;
          color: white;
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
        .modal {
          background: white;
          padding: 30px;
          border-radius: 8px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }
        .modal-large {
          max-width: 700px;
        }
        .modal h3 {
          margin-top: 0;
          margin-bottom: 20px;
          color: #333;
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        .form-grid label {
          display: flex;
          flex-direction: column;
          font-size: 14px;
        }
        .form-grid input,
        .form-grid select {
          margin-top: 5px;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        .form-full {
          grid-column: 1 / -1;
        }
        .required {
          color: #dc3545;
        }
        .error {
          color: #dc3545;
          font-size: 14px;
        }
        .form-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          margin-top: 10px;
        }
        .role-checkboxes {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 10px;
          margin-top: 10px;
        }
        .role-checkbox {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 4px;
          cursor: pointer;
        }
        .role-checkbox:hover {
          background: #e9ecef;
        }
        .role-checkbox span {
          display: flex;
          flex-direction: column;
        }
        .role-checkbox small {
          color: #666;
          font-size: 11px;
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
        }
        .access-denied h2 {
          margin-bottom: 10px;
        }
      `}</style>
    </div>
  );
}
