import { createContext, useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const interceptorRef = useRef(null);

  // Load auth from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.token && parsed.user) {
          setUser(parsed.user);
          setToken(parsed.token);
          axios.defaults.headers.common.Authorization = `Bearer ${parsed.token}`;
        } else {
          localStorage.removeItem('auth');
        }
      } catch {
        localStorage.removeItem('auth');
      }
    }
    setLoading(false);
  }, []);

  // Register 401 interceptor once on mount
  useEffect(() => {
    interceptorRef.current = axios.interceptors.response.use(
      (res) => res,
      (err) => {
        // Only handle 401s for requests that had an auth token
        const config = err.config || {};
        const hadAuth = config.headers?.Authorization || axios.defaults.headers.common.Authorization;
        if (err.response?.status === 401 && hadAuth) {
          localStorage.removeItem('auth');
          delete axios.defaults.headers.common.Authorization;
          setUser(null);
          setToken(null);
          window.location.href = '/login';
        }
        return Promise.reject(err);
      }
    );
    return () => {
      if (interceptorRef.current !== null) {
        axios.interceptors.response.eject(interceptorRef.current);
      }
    };
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

  const hasRole = (roleName) => {
    if (!user) return false;
    const userRoles = user.roles || [];
    return userRoles.includes(roleName);
  };

  const hasAnyRole = (roleNames) => {
    if (!user) return false;
    const userRoles = user.roles || [];
    return roleNames.some(role => userRoles.includes(role));
  };

  const hasPermission = (permissionName) => {
    if (!user) return false;
    const userPermissions = user.permissions || [];
    return userPermissions.includes(permissionName);
  };

  const hasAnyPermission = (permissionNames) => {
    if (!user) return false;
    const userPermissions = user.permissions || [];
    return permissionNames.some(perm => userPermissions.includes(perm));
  };

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
