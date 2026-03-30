import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const menuItems = [
  { path: '/admin', label: 'Tổng quan', exact: true },
  { path: '/admin/users', label: 'Người dùng' },
  { path: '/admin/categories', label: 'Danh mục' },
  { path: '/admin/products', label: 'Sản phẩm' },
  { path: '/admin/orders', label: 'Đơn hàng' },
  { path: '/admin/inventory', label: 'Quản lý kho' },
  { path: '/admin/staff', label: 'Quản lý nhân sự' },
  { path: '/admin/reports', label: 'Báo cáo' },
];

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h3 className="admin-sidebar-title">Quản trị</h3>
        <nav className="admin-nav">
          {menuItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`admin-nav-link ${isActive ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}
