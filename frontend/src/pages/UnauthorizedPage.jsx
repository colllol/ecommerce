import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../shared/AuthContext';

export default function UnauthorizedPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (user) {
      // Redirect based on roles
      const roles = user.roles || [];
      if (roles.includes('Admin') || roles.includes('Manager')) {
        navigate('/admin');
      } else if (roles.includes('Staff')) {
        navigate('/staff');
      } else {
        navigate('/');
      }
    } else {
      navigate('/login');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="unauthorized-page" style={styles.container}>
      <div className="unauthorized-card" style={styles.card}>
        <div className="unauthorized-icon" style={styles.icon}>🔒</div>
        <h1 style={styles.title}>403 - Không có quyền truy cập</h1>
        <p style={styles.message}>
          Bạn không có quyền truy cập trang này. Vui lòng kiểm tra lại quyền hạn của tài khoản.
        </p>

        {user ? (
          <div style={styles.buttonGroup}>
            <button className="btn btn-primary" style={styles.btnPrimary} onClick={handleGoBack}>
              ← Quay lại trang chính
            </button>
            <button className="btn btn-secondary" style={styles.btnSecondary} onClick={handleLogout}>
              Đăng xuất
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn btn-primary" style={styles.btnPrimary}>
            Đăng nhập
          </Link>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '1rem',
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '3rem 2rem',
    maxWidth: '500px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  icon: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '1rem',
  },
  message: {
    fontSize: '1rem',
    color: '#6b7280',
    marginBottom: '2rem',
    lineHeight: '1.6',
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  btnPrimary: {
    padding: '0.75rem 1.5rem',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    textDecoration: 'none',
    display: 'inline-block',
  },
  btnSecondary: {
    padding: '0.75rem 1.5rem',
    background: 'white',
    color: '#ef4444',
    border: '2px solid #ef4444',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
  },
};
