import api from '../config/api';

// Roles API
export const rolesApi = {
  getAll: () => api.get('/api/roles'),
  getById: (id) => api.get(`/api/roles/${id}`),
  create: (data) => api.post('/api/roles', data),
  update: (id, data) => api.put(`/api/roles/${id}`, data),
  delete: (id) => api.delete(`/api/roles/${id}`),
  assignPermissions: (roleId, permissionIds) =>
    api.post(`/api/roles/${roleId}/permissions`, { permissionIds }),
  getPermissionsList: () => api.get('/api/roles/permissions/list'),
};

// Permissions API
export const permissionsApi = {
  getAll: () => api.get('/api/permissions'),
  getById: (id) => api.get(`/api/permissions/${id}`),
  create: (data) => api.post('/api/permissions', data),
  update: (id, data) => api.put(`/api/permissions/${id}`, data),
  delete: (id) => api.delete(`/api/permissions/${id}`),
};

// Users API (extended for RBAC)
export const usersApi = {
  getAll: () => api.get('/api/users'),
  getById: (id) => api.get(`/api/users/${id}`),
  create: (data) => api.post('/api/users', data),
  update: (id, data) => api.put(`/api/users/${id}`, data),
  delete: (id) => api.delete(`/api/users/${id}`),
  assignRoles: (userId, roleIds) =>
    api.post(`/api/users/${userId}/roles`, { roleIds }),
  getProfile: () => api.get('/api/users/profile/me'),
};
