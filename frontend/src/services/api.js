import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://smart-habit-tracker-backend-4.onrender.com';
const API = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token from localStorage if exists
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Global Error Handler
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized (401), trigger logout or redirect
    if (error.response && error.response.status === 401) {
      // Clear token only if it was present (prevents loop on wrong credentials during login)
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => API.post('/auth/login', credentials),
  register: (userDetails) => API.post('/auth/register', userDetails),
};

export const habitAPI = {
  getAll: () => API.get('/habits'),
  getById: (id) => API.get(`/habits/${id}`),
  create: (habit) => API.post('/habits', habit),
  update: (id, habit) => API.put(`/habits/${id}`, habit),
  delete: (id) => API.delete(`/habits/${id}`),
  logCompletion: (id, logData) => API.post(`/habits/${id}/log`, logData),
  deleteCompletion: (id, dateStr) => {
    const url = dateStr ? `/habits/${id}/log?date=${dateStr}` : `/habits/${id}/log`;
    return API.delete(url);
  },
};

export const suggestionAPI = {
  getAll: () => API.get('/suggestions'),
  markAsRead: (id) => API.put(`/suggestions/${id}/read`),
  regenerate: () => API.post('/suggestions/regenerate'),
};

export const tinyHabitAPI = {
  getAll: () => API.get('/tiny-habits'),
  accept: (id) => API.post(`/tiny-habits/${id}/accept`),
  dismiss: (id) => API.post(`/tiny-habits/${id}/dismiss`),
};

export const habitStackAPI = {
  getAll: () => API.get('/habit-stacks'),
  create: (stackData) => API.post('/habit-stacks', stackData),
  delete: (id) => API.delete(`/habit-stacks/${id}`),
};

export const heatmapAPI = {
  get: (startDate, endDate) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return API.get('/heatmap', { params });
  },
};

export const notificationAPI = {
  getAll: () => API.get('/notifications'),
  getUnread: () => API.get('/notifications/unread'),
  markAsRead: (id) => API.put(`/notifications/${id}/read`),
  markAllAsRead: () => API.put('/notifications/read-all'),
  delete: (id) => API.delete(`/notifications/${id}`),
};

export const analyticsAPI = {
  get: () => API.get('/analytics'),
};

export const dashboardAPI = {
  getSummary: () => API.get('/dashboard'),
};

export const settingsAPI = {
  get: () => API.get('/settings'),
  update: (settings) => API.put('/settings', settings),
  seed: () => API.post('/settings/seed'),
};

export const intelligenceAPI = {
  getDna: (force = false) => API.get(`/intelligence/dna?forceRecalculate=${force}`),
  regenerateDna: () => API.post('/intelligence/dna/regenerate'),
  getProjections: (force = false) => API.get(`/intelligence/projections?forceRecalculate=${force}`),
  getFailures: (force = false) => API.get(`/intelligence/failures?forceRecalculate=${force}`),
  logMood: (moodData) => API.post('/intelligence/mood', moodData),
  getMoodCorrelations: () => API.get('/intelligence/mood'),
  getLifeBalance: (force = false) => API.get(`/intelligence/balance?forceRecalculate=${force}`),
};

export default API;
