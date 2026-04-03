import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './shared/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminInventoryPage from './pages/admin/AdminInventoryPage';
import AdminStaffPage from './pages/admin/AdminStaffPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminRolesPage from './pages/admin/AdminRolesPage';
import AdminPermissionsPage from './pages/admin/AdminPermissionsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';

function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-app">
      <header className="admin-header">
        <div className="admin-header-left">
          <h1 className="admin-logo">Admin Panel</h1>

          {user?.permissions?.includes('VIEW_USERS') && (
            <Link to="/admin/users" className={`admin-nav-link ${location.pathname.startsWith('/admin/users') ? 'active' : ''}`}>
              Người dùng
            </Link>
          )}
          {user?.permissions?.includes('VIEW_PRODUCTS') && (
            <Link to="/admin/products" className={`admin-nav-link ${location.pathname.startsWith('/admin/products') ? 'active' : ''}`}>
              Sản phẩm
            </Link>
          )}
          {user?.permissions?.includes('VIEW_PRODUCTS') && (
            <Link to="/admin/categories" className={`admin-nav-link ${location.pathname.startsWith('/admin/categories') ? 'active' : ''}`}>
              Danh mục
            </Link>
          )}
          {user?.permissions?.includes('VIEW_ORDERS') && (
            <Link to="/admin/orders" className={`admin-nav-link ${location.pathname.startsWith('/admin/orders') ? 'active' : ''}`}>
              Đơn hàng
            </Link>
          )}
          {user?.permissions?.includes('VIEW_INVENTORY') && (
            <Link to="/admin/inventory" className={`admin-nav-link ${location.pathname.startsWith('/admin/inventory') ? 'active' : ''}`}>
              Quản lý kho
            </Link>
          )}
          {user?.permissions?.includes('VIEW_USERS') && (
            <Link to="/admin/staff" className={`admin-nav-link ${location.pathname.startsWith('/admin/staff') ? 'active' : ''}`}>
              Quản lý nhân sự
            </Link>
          )}
          {user?.permissions?.includes('VIEW_DASHBOARD') && (
            <Link to="/admin/reports" className={`admin-nav-link ${location.pathname.startsWith('/admin/reports') ? 'active' : ''}`}>
              Báo cáo
            </Link>
          )}
          {user?.permissions?.includes('VIEW_ROLES') && (
            <Link to="/admin/roles" className={`admin-nav-link ${location.pathname.startsWith('/admin/roles') ? 'active' : ''}`}>
              🔐 Vai trò & Quyền
            </Link>
          )}
          {user?.permissions?.includes('VIEW_PERMISSIONS') && (
            <Link to="/admin/permissions" className={`admin-nav-link ${location.pathname.startsWith('/admin/permissions') ? 'active' : ''}`}>
              🔑 Danh sách quyền
            </Link>
          )}

        </div>
        <div className="admin-header-right">
          <Link to="/admin" className={`admin-nav-link ${location.pathname === '/admin' ? 'active' : ''}`}>
            Tổng quan
          </Link>
          <span className="admin-user-info">
            {user?.full_name}
          </span>
          <button className="btn btn-logout" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </header>
      <main className="admin-main">
        {children}
      </main>

      <style>{`
        .admin-app {
          min-height: 100vh;
          background: #f3f4f6;
        }
        .admin-header {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          background: #1f2937;
          color: white;
          padding: 0.75rem 1rem;
          min-height: 64px;
          position: sticky;
          top: 0;
          z-index: 100;
          gap: 0.5rem;
        }
        .admin-header-left {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.5rem;
          flex: 1 1 auto;
          min-width: 0;
        }
        .admin-logo {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0;
          color: #60a5fa;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .admin-nav {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.25rem;
        }
        .admin-nav-link {
          padding: 0.5rem 0.75rem;
          color: #e5e7eb;
          text-decoration: none;
          border-radius: 0.375rem;
          transition: all 0.2s;
          white-space: nowrap;
          font-size: 0.85rem;
          font-weight: 500;
          flex-shrink: 0;
        }
        .admin-nav-link:hover {
          background: #374151;
          color: white;
        }
        .admin-nav-link.active {
          background: #3b82f6;
          color: white;
        }
        .admin-header-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }
        .admin-header-right .admin-nav-link {
          padding: 0.5rem 0.75rem;
          color: #e5e7eb;
          text-decoration: none;
          border-radius: 0.375rem;
          transition: all 0.2s;
          white-space: nowrap;
          font-size: 0.85rem;
          font-weight: 500;
        }
        .admin-header-right .admin-nav-link:hover {
          background: #374151;
          color: white;
        }
        .admin-header-right .admin-nav-link.active {
          background: #3b82f6;
          color: white;
        }
        .admin-user-info {
          color: #d1d5db;
          font-size: 0.85rem;
          padding: 0 0.75rem;
          border-left: 1px solid #4b5563;
          white-space: nowrap;
        }
        .btn-logout {
          padding: 0.5rem 1rem;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.85rem;
          transition: background 0.2s;
          white-space: nowrap;
          font-weight: 500;
          flex-shrink: 0;
        }
        .btn-logout:hover {
          background: #dc2626;
        }
        .admin-main {
          padding: 1.5rem;
          max-width: 1400px;
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
}

export default function AdminApp() {
  return (
    <AdminLayout>
      <Routes>
        <Route index element={<AdminDashboardPage />} />
        <Route path="users" element={
          <ProtectedRoute permission="VIEW_USERS">
            <AdminUsersPage />
          </ProtectedRoute>
        } />
        <Route path="products" element={
          <ProtectedRoute permission="VIEW_PRODUCTS">
            <AdminProductsPage />
          </ProtectedRoute>
        } />
        <Route path="categories" element={
          <ProtectedRoute permission="VIEW_PRODUCTS">
            <AdminCategoriesPage />
          </ProtectedRoute>
        } />
        <Route path="orders" element={
          <ProtectedRoute permission="VIEW_ORDERS">
            <AdminOrdersPage />
          </ProtectedRoute>
        } />
        <Route path="inventory" element={
          <ProtectedRoute permission="VIEW_INVENTORY">
            <AdminInventoryPage />
          </ProtectedRoute>
        } />
        <Route path="staff" element={
          <ProtectedRoute permission="VIEW_USERS">
            <AdminStaffPage />
          </ProtectedRoute>
        } />
        <Route path="reports" element={
          <ProtectedRoute permission="VIEW_DASHBOARD">
            <AdminReportsPage />
          </ProtectedRoute>
        } />
        <Route path="roles" element={
          <ProtectedRoute permission="VIEW_ROLES">
            <AdminRolesPage />
          </ProtectedRoute>
        } />
        <Route path="permissions" element={
          <ProtectedRoute permission="VIEW_PERMISSIONS">
            <AdminPermissionsPage />
          </ProtectedRoute>
        } />
      </Routes>
    </AdminLayout>
  );
}
