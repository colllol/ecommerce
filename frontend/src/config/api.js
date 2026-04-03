import axios from 'axios';

// API base URL - from env variable or relative path
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
});

export default api;
