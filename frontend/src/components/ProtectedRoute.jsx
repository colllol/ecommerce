import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../shared/AuthContext';

/**
 * ProtectedRoute component for route protection based on authentication and permissions
 * 
 * @param {React.ReactNode} children - Child components to render
 * @param {string|string[]} permission - Single permission or array of permissions (any one grants access)
 * @param {string|string[]} allPermissions - Array of permissions (all required to grant access)
 * @param {string|string[]} role - Single role or array of roles
 * @param {boolean} requireAll - If true with permission array, requires all permissions
 */
export default function ProtectedRoute({ 
  children, 
  permission, 
  allPermissions,
  role,
  requireAll = false 
}) {
  const { user, loading, hasPermission, hasAnyPermission, hasAllPermissions, hasRole, hasAnyRole } = useAuth();

  if (loading) {
    return (
      <div className="loading-container" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Đang tải...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check roles if specified
  if (role) {
    const requiredRoles = Array.isArray(role) ? role : [role];
    if (!hasAnyRole(requiredRoles)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Check allPermissions if specified (requires ALL permissions)
  if (allPermissions) {
    const requiredPermissions = Array.isArray(allPermissions) ? allPermissions : [allPermissions];
    if (!hasAllPermissions(requiredPermissions)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Check permission if specified (requires ANY permission by default)
  if (permission) {
    const requiredPermissions = Array.isArray(permission) ? permission : [permission];
    
    if (requireAll) {
      if (!hasAllPermissions(requiredPermissions)) {
        return <Navigate to="/unauthorized" replace />;
      }
    } else {
      if (!hasAnyPermission(requiredPermissions)) {
        return <Navigate to="/unauthorized" replace />;
      }
    }
  }

  return children;
}
