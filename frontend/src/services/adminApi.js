import axios from 'axios';

// Dùng axios mặc định để kế thừa token từ AuthContext
const api = axios;
const base = '/api';

// Users
export const usersApi = {
  getAll: () => api.get(`${base}/users`),
  getById: (id) => api.get(`${base}/users/${id}`),
  create: (data) => api.post(`${base}/users`, data),
  update: (id, data) => api.put(`${base}/users/${id}`, data),
  delete: (id) => api.delete(`${base}/users/${id}`),
};

// Categories
export const categoriesApi = {
  getAll: () => api.get(`${base}/categories`),
  getById: (id) => api.get(`${base}/categories/${id}`),
  create: (data) => api.post(`${base}/categories`, data),
  update: (id, data) => api.put(`${base}/categories/${id}`, data),
  delete: (id) => api.delete(`${base}/categories/${id}`),
};

// Products
export const productsApi = {
  getAll: () => api.get(`${base}/products`),
  getById: (id) => api.get(`${base}/products/${id}`),
  create: (data) => api.post(`${base}/products`, data),
  update: (id, data) => api.put(`${base}/products/${id}`, data),
  delete: (id) => api.delete(`${base}/products/${id}`),
};

// Orders
export const ordersApi = {
  getAll: () => api.get(`${base}/orders`),
  getById: (id) => api.get(`${base}/orders/${id}`),
  update: (id, data) => api.put(`${base}/orders/${id}`, data),
  delete: (id) => api.delete(`${base}/orders/${id}`),
};
