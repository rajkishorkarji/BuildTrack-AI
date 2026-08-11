import api from './api';

const issueService = {
  async list() {
    const { data } = await api.get('/issues');
    return data?.data || [];
  },
  async create(payload) {
    const { data } = await api.post('/issues', payload);
    return data?.data;
  },
  async updateStatus(id, status) {
    const { data } = await api.patch(`/issues/${id}/status`, { status });
    return data?.data;
  },
};

export default issueService;
