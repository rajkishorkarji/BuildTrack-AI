import api from './api';

const taskService = {
  async list() {
    const response = await api.get('/tasks');
    return response.data?.data || [];
  },
  async listByProject(projectId) {
    const response = await api.get(`/tasks/project/${projectId}`);
    return response.data?.data || [];
  },
  async create(payload) {
    const response = await api.post('/tasks', payload);
    return response.data?.data;
  },
  async updateProgress(taskId, payload) {
    const response = await api.patch(`/tasks/${taskId}`, payload);
    return response.data?.data;
  },
  async assign(taskId, userId) {
    const response = await api.put(`/tasks/${taskId}/assignee/${userId}`);
    return response.data?.data;
  },
};

export default taskService;
