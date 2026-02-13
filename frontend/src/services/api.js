import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor pour ajouter le token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// TPE API
export const tpeAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/tpe/', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/tpe/${id}`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/tpe/', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/tpe/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    await api.delete(`/tpe/${id}`);
  },
  
  getStats: async () => {
    const response = await api.get('/tpe/stats/summary');
    return response.data;
  },
  
  exportExcel: async () => {
    const response = await api.get('/tpe/export/excel', {
      responseType: 'blob',
    });
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getAll: async () => {
    const response = await api.get('/users/');
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/users/', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    await api.delete(`/users/${id}`);
  },
};

export default api;
