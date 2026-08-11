import api from './api';

const materialService = {
  async list(projectId) {
    const { data } = await api.get('/materials', {
      params: projectId ? { projectId } : undefined,
    });
    return data?.data || [];
  },
  async create(payload) {
    const { data } = await api.post('/materials', payload);
    return data?.data;
  },
  async receive(id, payload) {
    const { data } = await api.post(`/materials/${id}/receive`, payload);
    return data?.data;
  },
  async issue(id, payload) {
    const { data } = await api.post(`/materials/${id}/issue`, payload);
    return data?.data;
  },
  async history(id) {
    const { data } = await api.get(`/materials/${id}/history`);
    return data?.data || [];
  },
};

export default materialService;
