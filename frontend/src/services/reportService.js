import api from './api';
export const reportService = {
  list: async (projectId) => (await api.get('/reports', { params: projectId ? { projectId } : {} })).data.data || [],
  generate: async (payload) => (await api.post('/reports', payload)).data.data,
};
