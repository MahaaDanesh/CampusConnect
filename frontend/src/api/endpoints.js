import api from './axios';

// Auth
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

// Users
export const userApi = {
  updateMe: (data) => api.put('/users/me', data),
  changePassword: (data) => api.put('/users/me/password', data),
  list: (params) => api.get('/users', { params }),
  get: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  remove: (id) => api.delete(`/users/${id}`),
};

// Announcements
export const announcementApi = {
  list: (params) => api.get('/announcements', { params }),
  get: (id) => api.get(`/announcements/${id}`),
  create: (data) => api.post('/announcements', data),
  update: (id, data) => api.put(`/announcements/${id}`, data),
  remove: (id) => api.delete(`/announcements/${id}`),
};

// Events
export const eventApi = {
  list: (params) => api.get('/events', { params }),
  get: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  remove: (id) => api.delete(`/events/${id}`),
  register: (id) => api.post(`/events/${id}/register`),
  cancelRegistration: (id) => api.delete(`/events/${id}/register`),
  attendees: (id) => api.get(`/events/${id}/attendees`),
};

// Clubs
export const clubApi = {
  list: (params) => api.get('/clubs', { params }),
  get: (id) => api.get(`/clubs/${id}`),
  create: (data) => api.post('/clubs', data),
  update: (id, data) => api.put(`/clubs/${id}`, data),
  remove: (id) => api.delete(`/clubs/${id}`),
  join: (id) => api.post(`/clubs/${id}/join`),
  leave: (id) => api.delete(`/clubs/${id}/leave`),
};

// Complaints
export const complaintApi = {
  list: (params) => api.get('/complaints', { params }),
  get: (id) => api.get(`/complaints/${id}`),
  create: (data) => api.post('/complaints', data),
  updateStatus: (id, data) => api.put(`/complaints/${id}/status`, data),
  addComment: (id, text) => api.post(`/complaints/${id}/comments`, { text }),
  remove: (id) => api.delete(`/complaints/${id}`),
};

// Lost & Found
export const lostFoundApi = {
  list: (params) => api.get('/lostfound', { params }),
  get: (id) => api.get(`/lostfound/${id}`),
  create: (data) => api.post('/lostfound', data),
  update: (id, data) => api.put(`/lostfound/${id}`, data),
  remove: (id) => api.delete(`/lostfound/${id}`),
};

// Notes
export const noteApi = {
  list: (params) => api.get('/notes', { params }),
  get: (id) => api.get(`/notes/${id}`),
  create: (data) => api.post('/notes', data),
  update: (id, data) => api.put(`/notes/${id}`, data),
  remove: (id) => api.delete(`/notes/${id}`),
  trackDownload: (id) => api.post(`/notes/${id}/download`),
};

// Notifications
export const notificationApi = {
  list: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  remove: (id) => api.delete(`/notifications/${id}`),
};

// Analytics
export const analyticsApi = {
  overview: () => api.get('/analytics/overview'),
};
