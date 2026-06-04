import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

export const activityService = {
  getAll: (params) => api.get('/activity', { params }),
  create: (data) => api.post('/activity', data),
  update: (id, data) => api.put(`/activity/${id}`, data),
  delete: (id) => api.delete(`/activity/${id}`)
};

export const sleepService = {
  getAll: (params) => api.get('/sleep', { params }),
  create: (data) => api.post('/sleep', data),
  update: (id, data) => api.put(`/sleep/${id}`, data),
  delete: (id) => api.delete(`/sleep/${id}`)
};

export const hydrationService = {
  getAll: (params) => api.get('/hydration', { params }),
  create: (data) => api.post('/hydration', data),
  delete: (id) => api.delete(`/hydration/${id}`)
};

export const wellnessService = {
  getScore: () => api.get('/wellness/score'),
  getHistory: (params) => api.get('/wellness/history', { params })
};

export const goalsService = {
  getAll: () => api.get('/goals'),
  create: (data) => api.post('/goals', data),
  update: (id, data) => api.put(`/goals/${id}`, data)
};

export const challengesService = {
  getAll: () => api.get('/challenges'),
  getOne: (id) => api.get(`/challenges/${id}`),
  create: (data) => api.post('/challenges', data),
  accept: (id) => api.patch(`/challenges/${id}/accept`),
  decline: (id) => api.patch(`/challenges/${id}/decline`)
};

export const notificationsService = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all')
};

export const historyService = {
  getAll: (params) => api.get('/history', { params })
};

export const progressService = {
  getAll: (params) => api.get('/progress', { params })
};

export const adminService = {
  getUsers: () => api.get('/admin/users'),
  updateUser: (id, data) => api.patch(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getStats: () => api.get('/admin/stats'),
  broadcastNotification: (data) => api.post('/admin/notify', data)
};
