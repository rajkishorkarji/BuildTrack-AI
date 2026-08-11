import api from './api';
export const dailyLogService = {
  list: async (projectId) => (await api.get('/daily-logs', { params: projectId ? { projectId } : {} })).data.data || [],
  create: async (payload) => (await api.post('/daily-logs', payload)).data.data,
  approve: async (id) => (await api.patch(`/daily-logs/${id}/approve`)).data.data,
  reject: async (id) => (await api.patch(`/daily-logs/${id}/reject`)).data.data,
};
