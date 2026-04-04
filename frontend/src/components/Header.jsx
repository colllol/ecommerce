import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../config/api';
import { useAuth } from '../shared/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [categories, setCategories] = useState([]);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    api.get('/api/categories').then((res) => setCategories(res.data));
  }, []);

  const isLoginPage = location.pathname === '/login';

  if (isLoginPage) return null;

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">Ecommerce</Link>
      </div>
      
      {/* Category Menu */}
      <div 
        className="category-menu-wrapper"
        onMouseEnter={() => setShowMenu(true)}
        onMouseLeave={() => setShowMenu(false)}
      >
        <button 
          className="category-menu-btn"
          onClick={() => setShowMenu(!showMenu)}
        >
          <span className="category-icon">☰</span>
          Danh mục
        </button>
        
        {showMenu && categories.length > 0 && (
          <div className="category-dropdown">
            {categories.map((c) => (
              <Link
                key={c.category_id}
                to={`/categories/${c.category_id}`}
                className="category-dropdown-item"
              >
                {c.category_name}
              </Link>
            ))}
          </div>
        )}
      </div>

      <nav className="nav">
        <Link to="/">Trang chủ</Link>
        <Link to="/cart">Giỏ hàng</Link>
        {user && <Link to="/profile">Tài khoản</Link>}
      </nav>
      
      <div className="auth">
        {user ? (
          <>
            <span>{user.full_name}</span>
            <button onClick={logout}>Đăng xuất</button>
          </>
        ) : (
          <Link to="/login">Đăng nhập</Link>
        )}
      </div>
    </header>
  );
}
