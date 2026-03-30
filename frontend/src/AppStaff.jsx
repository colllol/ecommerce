import React from 'react';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './shared/AuthContext';
import StaffDashboardPage from './pages/staff/StaffDashboardPage';
import StaffIndexPage from './pages/staff/StaffIndexPage';
import StaffSalesHistoryPage from './pages/staff/StaffSalesHistoryPage';
import StaffPickProductPage from './pages/staff/StaffPickProductPage';

function StaffLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="staff-app">
      <header className="staff-header">
        <div className="staff-header-left">
          <h1 className="staff-logo">Staff Panel</h1>
          
            <Link to="/staff" className={`staff-nav-link ${location.pathname === '/staff' ? 'active' : ''}`}>
              Tổng quan
            </Link>
            <Link to="/staff/pick-products" className={`staff-nav-link ${location.pathname.startsWith('/staff/pick-products') ? 'active' : ''}`}>
              Xuất sản phẩm
            </Link>
            <Link to="/staff/sales-history" className={`staff-nav-link ${location.pathname.startsWith('/staff/sales-history') ? 'active' : ''}`}>
              Lịch sử bán hàng
            </Link>
          
        </div>
        <div className="staff-header-right">
          <span className="staff-user-info">
            {user?.full_name} ({user?.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'})
          </span>
          <button className="btn btn-logout" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </header>
      <main className="staff-main">
        {children}
      </main>

      <style>{`
        .staff-app {
          min-height: 100vh;
          background: #f3f4f6;
        }
        .staff-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #065f46;
          color: white;
          padding: 0 1.5rem;
          height: 64px;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .staff-header-left {
          display: flex;
          align-items: center;
          gap: 2rem;
        }
        .staff-logo {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0;
          color: #34d399;
        }
        .staff-nav {
          display: flex;
          gap: 0.5rem;
        }
        .staff-nav-link {
          padding: 0.5rem 1rem;
          color: #d1d5db;
          text-decoration: none;
          border-radius: 0.375rem;
          transition: all 0.2s;
        }
        .staff-nav-link:hover {
          background: #047857;
          color: white;
        }
        .staff-nav-link.active {
          background: #10b981;
          color: white;
        }
        .staff-header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .staff-user-info {
          color: #9ca3af;
          font-size: 0.875rem;
        }
        .btn-logout {
          padding: 0.5rem 1rem;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
          transition: background 0.2s;
        }
        .btn-logout:hover {
          background: #dc2626;
        }
        .staff-main {
          padding: 1.5rem;
          max-width: 1400px;
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
}

export default function StaffApp() {
  return (
    <StaffLayout>
      <Routes>
        <Route index element={<StaffDashboardPage />} />
        <Route path="pick-products" element={<StaffIndexPage />} />
        <Route path="pick-products/:id" element={<StaffPickProductPage />} />
        <Route path="sales-history" element={<StaffSalesHistoryPage />} />
      </Routes>
    </StaffLayout>
  );
}
