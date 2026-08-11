import api from './api';

const projectService = {
  async getProjects() {
    const { data } = await api.get('/projects');
    return data?.data || [];
  },
  async list() {
    const { data } = await api.get('/projects');
    return data?.data || [];
  },
  async get(id) {
    const { data } = await api.get(`/projects/${id}`);
    return data?.data;
  },
  async create(payload) {
    const { data } = await api.post('/projects', payload);
    return data?.data;
  },
  async update(id, payload) {
    const { data } = await api.put(`/projects/${id}`, payload);
    return data?.data;
  },
  async remove(id) {
    await api.delete(`/projects/${id}`);
  },
  async assignments(id) {
    const { data } = await api.get(`/projects/${id}/assignments`);
    return data?.data || [];
  },
  async eligibleUsers(role) {
    const { data } = await api.get('/projects/eligible-users', { params: { role } });
    return data?.data || [];
  },
  async assign(id, userId, role) {
    const { data } = await api.post(`/projects/${id}/assignments`, { userId, role });
    return data?.data;
  },
  async unassign(id, userId) {
    await api.delete(`/projects/${id}/assignments/${userId}`);
  },
  async updateStatus(id, status) {
    const { data } = await api.patch(`/projects/${id}/status`, { status });
    return data?.data;
  },
};

export default projectService;
