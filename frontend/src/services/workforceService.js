import api from './api';

const workforceService = {
  async list() {
    const response = await api.get('/workforce');
    return response.data?.data || [];
  },
  async get(userId) {
    const response = await api.get(`/workforce/${userId}`);
    return response.data?.data;
  },
  async updateStatus(userId, enabled) {
    const response = await api.patch(`/workforce/${userId}/status`, { enabled });
    return response.data?.data;
  },
  async remove(userId) {
    const response = await api.delete(`/workforce/${userId}`);
    return response.data?.data;
  },
};

export default workforceService;
