import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('auth');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed.user);
      setToken(parsed.token);
      axios.defaults.headers.common.Authorization = `Bearer ${parsed.token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    const { token: jwt, user: userData } = res.data;
    
    setUser(userData);
    setToken(jwt);
    
    const authData = { user: userData, token: jwt };
    localStorage.setItem('auth', JSON.stringify(authData));
    axios.defaults.headers.common.Authorization = `Bearer ${jwt}`;
    
    return res.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth');
    delete axios.defaults.headers.common.Authorization;
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    const stored = localStorage.getItem('auth');
    if (stored) {
      const parsed = JSON.parse(stored);
      const authData = { user: updatedUser, token: parsed.token };
      localStorage.setItem('auth', JSON.stringify(authData));
    }
  };

  /**
   * Check if user has a specific role
   * @param {string} roleName - Role name to check
   * @returns {boolean} - True if user has the role
   */
  const hasRole = (roleName) => {
    if (!user) return false;
    const userRoles = user.roles || [];
    return userRoles.includes(roleName);
  };

  /**
   * Check if user has any of the specified roles
   * @param {string[]} roleNames - Array of role names to check
   * @returns {boolean} - True if user has any of the roles
   */
  const hasAnyRole = (roleNames) => {
    if (!user) return false;
    const userRoles = user.roles || [];
    return roleNames.some(role => userRoles.includes(role));
  };

  /**
   * Check if user has a specific permission
   * @param {string} permissionName - Permission name to check
   * @returns {boolean} - True if user has the permission
   */
  const hasPermission = (permissionName) => {
    if (!user) return false;
    const userPermissions = user.permissions || [];
    return userPermissions.includes(permissionName);
  };

  /**
   * Check if user has any of the specified permissions
   * @param {string[]} permissionNames - Array of permission names to check
   * @returns {boolean} - True if user has any of the permissions
   */
  const hasAnyPermission = (permissionNames) => {
    if (!user) return false;
    const userPermissions = user.permissions || [];
    return permissionNames.some(perm => userPermissions.includes(perm));
  };

  /**
   * Check if user has all of the specified permissions
   * @param {string[]} permissionNames - Array of permission names to check
   * @returns {boolean} - True if user has all the permissions
   */
  const hasAllPermissions = (permissionNames) => {
    if (!user) return false;
    const userPermissions = user.permissions || [];
    return permissionNames.every(perm => userPermissions.includes(perm));
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      updateUser,
      hasRole,
      hasAnyRole,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
