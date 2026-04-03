import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../shared/AuthContext';

export default function AdminStaffPage() {
  const { token } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    role: 'staff',
    status: 'active',
  });

  const fetchStaff = useCallback(async () => {
    try {
      const res = await axios.get('/api/staff', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaff(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [token]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStaff) {
        await axios.put(`/api/staff/${editingStaff.user_id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('Cập nhật nhân viên thành công');
      } else {
        await axios.post('/api/staff', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('Thêm nhân viên thành công');
      }
      setShowModal(false);
      setFormData({ full_name: '', email: '', phone: '', password: '', role: 'staff', status: 'active' });
      setEditingStaff(null);
      fetchStaff();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || 'Không thể lưu'));
    }
  };

  const handleEdit = (staffMember) => {
    setEditingStaff(staffMember);
    setFormData({
      full_name: staffMember.full_name,
      email: staffMember.email,
      phone: staffMember.phone || '',
      password: '',
      role: staffMember.role,
      status: staffMember.status,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa nhân viên này?')) return;
    try {
      await axios.delete(`/api/staff/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Xóa thành công');
      fetchStaff();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || 'Không thể xóa'));
    }
  };

  if (loading) return <div className="admin-page">Đang tải...</div>;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Quản lý nhân sự</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Thêm nhân viên
        </button>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>SĐT</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.user_id}>
                <td>{s.user_id}</td>
                <td>{s.full_name}</td>
                <td>{s.email}</td>
                <td>{s.phone || '-'}</td>
                <td>
                  <span className={`role-badge ${s.role}`}>
                    {s.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${s.status}`}>
                    {s.status === 'active' ? 'Hoạt động' : s.status === 'inactive' ? 'Không hoạt động' : 'Bị khóa'}
                  </span>
                </td>
                <td>{new Date(s.created_at).toLocaleDateString('vi-VN')}</td>
                <td>
                  <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(s)}>
                    Sửa
                  </button>
                  {' '}
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(s.user_id)}>
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingStaff ? 'Sửa nhân viên' : 'Thêm nhân viên'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Họ tên</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>SĐT</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>{editingStaff ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu'}</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingStaff}
                />
              </div>
              <div className="form-group">
                <label>Vai trò</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="staff">Nhân viên</option>
                  <option value="admin">Quản trị viên</option>
                </select>
              </div>
              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                  <option value="blocked">Bị khóa</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingStaff ? 'Cập nhật' : 'Thêm'}
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
        .role-badge, .status-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .role-badge.admin {
          background: #6f42c1;
          color: #fff;
        }
        .role-badge.staff {
          background: #17a2b8;
          color: #fff;
        }
        .status-badge.active {
          background: #28a745;
          color: #fff;
        }
        .status-badge.inactive {
          background: #6c757d;
          color: #fff;
        }
        .status-badge.blocked {
          background: #dc3545;
          color: #fff;
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
        .form-group input, .form-group select {
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
