import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Structured API services
export const userService = {
  getAll: () => api.get('/users'),
  getTeachers: () => api.get('/users/teachers'),
  create: (data) => api.post('/users', data),
  delete: (id) => api.delete(`/users/${id}`),
};

export const groupService = {
  getAll: () => api.get('/groups'),
  getByTeacher: (teacherId) => api.get(`/groups?idGiangVien=${teacherId}`),
  getDetails: (id) => api.get(`/groups/${id}`),
  getMembers: (id) => api.get(`/groups/${id}/members`),
  create: (data) => api.post('/groups', data),
  assignTeacher: (groupId, teacherId) => api.patch(`/groups/${groupId}/assign`, { idGiangVien: teacherId }),
};

export const taskService = {
  getMine: () => api.get('/tasks/my-tasks'),
  updateStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),
  syncJira: (idNhom) => api.get(`/tasks/jira/sync/${idNhom}`),
};

export const reportService = {
  getProgress: (idNhom) => api.get(`/reports/${idNhom}/progress`),
  getHistory: (idNhom) => api.get(`/reports/${idNhom}/history`),
  getCommits: (idNhom) => api.get(`/reports/${idNhom}/commits`),
  getContributions: (idNhom) => api.get(`/reports/${idNhom}/contributions`),
  getPersonalHistory: (idSinhVien) => api.get(`/reports/personal/${idSinhVien}/history`),
};

export const configService = {
  saveJira: (idNhom, data) => api.post(`/config/${idNhom}/jira`, data),
  saveGithub: (idNhom, data) => api.post(`/config/${idNhom}/github`, data),
};

export default api;
