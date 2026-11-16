// Centralized API calls. Every function returns the unwrapped `data` payload.
import api from './client';

const unwrap = (res) => res.data?.data;

export const authApi = {
  me: () => api.get('/auth/me').then(unwrap),
  login: (payload) => api.post('/auth/login', payload).then(unwrap),
  logout: () => api.post('/auth/logout'),
  updateProfile: (payload) => api.patch('/auth/profile', payload).then(unwrap),
  changePassword: (payload) => api.post('/auth/change-password', payload).then((r) => r.data)
};

export const clientsApi = {
  list: (params) => api.get('/clients', { params }).then(unwrap),
  get: (id) => api.get(`/clients/${id}`).then(unwrap),
  create: (payload) => api.post('/clients', payload).then(unwrap),
  update: (id, payload) => api.put(`/clients/${id}`, payload).then(unwrap),
  remove: (id) => api.delete(`/clients/${id}`)
};

export const campaignsApi = {
  list: (params) => api.get('/campaigns', { params }).then(unwrap),
  create: (payload) => api.post('/campaigns', payload).then(unwrap),
  update: (id, payload) => api.put(`/campaigns/${id}`, payload).then(unwrap),
  remove: (id) => api.delete(`/campaigns/${id}`)
};

export const tasksApi = {
  list: (params) => api.get('/tasks', { params }).then(unwrap),
  create: (payload) => api.post('/tasks', payload).then(unwrap),
  update: (id, payload) => api.put(`/tasks/${id}`, payload).then(unwrap),
  remove: (id) => api.delete(`/tasks/${id}`)
};

export const employeesApi = {
  list: () => api.get('/employees').then(unwrap),
  create: (payload) => api.post('/employees', payload).then(unwrap),
  update: (id, payload) => api.put(`/employees/${id}`, payload).then(unwrap),
  remove: (id) => api.delete(`/employees/${id}`)
};

export const statsApi = {
  get: () => api.get('/stats').then(unwrap)
};
