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

// Response interceptor to handle account status
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      const message = error.response.data?.message || '';
      if (message.includes('khóa') || message.includes('vô hiệu hóa') || message.includes('kích hoạt')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = `/login?error=${encodeURIComponent(message)}`;
      }
    }
    return Promise.reject(error);
  }
);

// Structured API services
export const userService = {
  getAll: () => api.get('/users'),
  getTeachers: () => api.get('/users?role=TEACHER'),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  updateProfile: (data) => api.put('/users/profile', data),
  delete: (id) => api.delete(`/users/${id}`),
  getUnassigned: () => api.get('/users?status=UNASSIGNED'),
  getById: (id) => api.get(`/users/${id}`),
  assignRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
  updateStatus: (id, status) => api.patch(`/users/${id}/status`, { status }),
  bulkCreate: (data) => api.post('/users/bulk', data),
};

export const groupService = {
  getAll: () => api.get('/groups'),
  getByTeacher: (teacherId) => api.get(`/groups?teacherId=${teacherId}`),
  getDetails: (id) => api.get(`/groups/${id}`),
  getMembers: (id) => api.get(`/groups/${id}/members`),
  create: (data) => api.post('/groups', data),
  delete: (id) => api.delete(`/groups/${id}`),
  assignTeacher: (groupId, teacherId) => api.patch(`/groups/${groupId}/assign`, { teacherId }),
  addMember: (groupId, studentId) => api.post(`/groups/${groupId}/members/${studentId}`),
  removeMember: (groupId, studentId) => api.delete(`/groups/${groupId}/members/${studentId}`),
  setLeader: (groupId, leaderId) => api.patch(`/groups/${groupId}/leader`, { leaderId }),
};

export const taskService = {
  getGroupTasks: (groupId) => api.get(`/tasks?groupId=${groupId}`),
  getMine: (studentId) => api.get(`/tasks/personal?studentId=${studentId}`),
  updateStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),
  assignMember: (id, studentId) => api.patch(`/tasks/${id}/assign`, { studentId }),
  syncJira: (groupId) => api.post(`/sync/${groupId}/jira`),
  syncGithub: (groupId) => api.post(`/sync/${groupId}/github`),
  mapping: () => api.post('/sync/mapping'),
  syncFull: (groupId) => api.post(`/sync/${groupId}/full`),
};

export const reportService = {
  getProgress: (groupId) => api.get(`/reports/${groupId}/progress`),
  getHistory: (groupId) => api.get(`/reports/${groupId}/history`),
  getCommits: (groupId) => api.get(`/reports/${groupId}/commits`),
  getCommitHistory: (groupId) => api.get(`/reports/${groupId}/commits/history`),
  getDetailedCommits: (groupId) => api.get(`/reports/${groupId}/commits/detailed`),
  getContributions: (groupId) => api.get(`/reports/${groupId}/contributions`),
  getPersonalHistory: (studentId) => api.get(`/reports/personal/${studentId}/history`),
  exportPdf: (groupId) => api.get(`/reports/${groupId}/export/pdf`, { responseType: 'blob' }),
  exportSRS: (groupId) => api.get(`/reports/${groupId}/export/srs`, { responseType: 'blob' }),
};

export const configService = {
  saveConfig: (data) => api.post('/configs', data),
  getConfig: (groupId) => api.get(`/configs?groupId=${groupId}`),
  testConnection: (data) => api.post('/configs/test', data),
};

export const authService = {
  changePassword: (data) => api.post('/auth/change-password', data),
};

export default api;
