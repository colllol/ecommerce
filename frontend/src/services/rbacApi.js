import axios from 'axios';

const base = '/api';

// Roles API
export const rolesApi = {
  getAll: () => axios.get(`${base}/roles`),
  getById: (id) => axios.get(`${base}/roles/${id}`),
  create: (data) => axios.post(`${base}/roles`, data),
  update: (id, data) => axios.put(`${base}/roles/${id}`, data),
  delete: (id) => axios.delete(`${base}/roles/${id}`),
  assignPermissions: (roleId, permissionIds) => 
    axios.post(`${base}/roles/${roleId}/permissions`, { permissionIds }),
  getPermissionsList: () => axios.get(`${base}/roles/permissions/list`),
};

// Permissions API
export const permissionsApi = {
  getAll: () => axios.get(`${base}/permissions`),
  getById: (id) => axios.get(`${base}/permissions/${id}`),
  create: (data) => axios.post(`${base}/permissions`, data),
  update: (id, data) => axios.put(`${base}/permissions/${id}`, data),
  delete: (id) => axios.delete(`${base}/permissions/${id}`),
};

// Users API (extended for RBAC)
export const usersApi = {
  getAll: () => axios.get(`${base}/users`),
  getById: (id) => axios.get(`${base}/users/${id}`),
  create: (data) => axios.post(`${base}/users`, data),
  update: (id, data) => axios.put(`${base}/users/${id}`, data),
  delete: (id) => axios.delete(`${base}/users/${id}`),
  assignRoles: (userId, roleIds) => 
    axios.post(`${base}/users/${userId}/roles`, { roleIds }),
  getProfile: () => axios.get(`${base}/users/profile/me`),
};
