import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const menuItems = [
  { path: '/staff', label: 'Tổng quan', exact: true },
  { path: '/staff/pick-products', label: 'Xuất sản phẩm', exact: true },
  { path: '/staff/sales-history', label: 'Lịch sử bán hàng', exact: false },
];

export default function StaffLayout() {
  const location = useLocation();

  return (
    <div className="staff-layout">
      <aside className="staff-sidebar">
        <h3 className="staff-sidebar-title">Nhân viên</h3>
        <nav className="staff-nav">
          {menuItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`staff-nav-link ${isActive ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="staff-content">
        <Outlet />
      </div>
    </div>
  );
}
