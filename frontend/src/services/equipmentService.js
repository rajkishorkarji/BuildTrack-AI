import api from './api';

const equipmentService = {
  async list() {
    const { data } = await api.get('/equipment');
    return data?.data || [];
  },
  async create(payload) {
    const { data } = await api.post('/equipment', payload);
    return data?.data;
  },
  async updateStatus(id, status) {
    const { data } = await api.patch(`/equipment/${id}/status`, { status });
    return data?.data;
  },
  async assign(id, userId) {
    const { data } = await api.patch(`/equipment/${id}/assignment`, { userId });
    return data?.data;
  },
  async assignProject(id, projectId) {
    const { data } = await api.patch(`/equipment/${id}/project`, { projectId });
    return data?.data;
  },
  async assignTask(id, taskId) {
    const { data } = await api.patch(`/equipment/${id}/task`, { taskId });
    return data?.data;
  },
  async maintenance(id) {
    const { data } = await api.get(`/equipment/${id}/maintenance`);
    return data?.data || [];
  },
  async scheduleMaintenance(id, payload) {
    const { data } = await api.post(`/equipment/${id}/maintenance`, payload);
    return data?.data;
  },
};

export default equipmentService;
