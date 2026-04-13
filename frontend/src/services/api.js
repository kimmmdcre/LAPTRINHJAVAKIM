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
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getUnassigned: () => api.get('/users/unassigned'),
};

export const groupService = {
  getAll: () => api.get('/groups'),
  getByTeacher: (teacherId) => api.get(`/groups?idGiangVien=${teacherId}`),
  getDetails: (id) => api.get(`/groups/${id}`),
  getMembers: (id) => api.get(`/groups/${id}/members`),
  create: (data) => api.post('/groups', data),
  delete: (id) => api.delete(`/groups/${id}`),
  assignTeacher: (groupId, teacherId) => api.patch(`/groups/${groupId}/assign`, { idGiangVien: teacherId }),
  addMember: (groupId, studentId) => api.post(`/groups/${groupId}/members/${studentId}`),
  removeMember: (studentId) => api.delete(`/groups/members/${studentId}`),
};

export const taskService = {
  getGroupTasks: (idNhom) => api.get(`/tasks/${idNhom}`),
  updateStatus: (id, status) => api.patch(`/tasks/nhiem-vu/${id}/status`, { status }),
  assignMember: (id, memberId) => api.patch(`/tasks/nhiem-vu/${id}/assign`, { idSinhVien: memberId }),
  syncJira: (idNhom) => api.post(`/sync/${idNhom}/jira`),
  syncGithub: (idNhom) => api.post(`/sync/${idNhom}/github`),
  mapping: () => api.post('/sync/mapping'),
};

export const reportService = {
  getProgress: (idNhom) => api.get(`/reports/${idNhom}/progress`),
  getHistory: (idNhom) => api.get(`/reports/${idNhom}/history`),
  getCommits: (idNhom) => api.get(`/reports/${idNhom}/commits`),
  getCommitHistory: (idNhom) => api.get(`/reports/${idNhom}/commits/history`),
  getContributions: (idNhom) => api.get(`/reports/${idNhom}/contributions`),
  getPersonalHistory: (idSinhVien) => api.get(`/reports/personal/${idSinhVien}/history`),
  exportDocx: (idNhom) => api.get(`/reports/${idNhom}/export/docx`, { responseType: 'blob' }),
  exportPdf: (idNhom) => api.get(`/reports/${idNhom}/export/pdf`, { responseType: 'blob' }),
};

export const configService = {
  saveJira: (idNhom, data) => api.post(`/config/${idNhom}/jira`, data),
  saveGithub: (idNhom, data) => api.post(`/config/${idNhom}/github`, data),
  getConfig: (idNhom) => api.get(`/config/${idNhom}`),
  testJira: (data) => api.post('/config/test/jira', data),
  testGithub: (data) => api.post('/config/test/github', data),
};

export default api;
