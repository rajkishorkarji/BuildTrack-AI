import api from './api';

const aiInsightService = {
  async list(projectId) {
    const { data } = await api.get('/ai-insights', {
      params: projectId ? { projectId } : undefined,
    });
    return data?.data || [];
  },

  async diagnose(projectId) {
    const { data } = await api.post(`/ai-insights/projects/${projectId}/diagnostics`);
    return data?.data;
  },

  async runInference(payload) {
    const { data } = await api.post('/ai-insights/run-inference', payload);
    return data?.data;
  },

  async workerMatches(projectId, skill) {
    const { data } = await api.get(`/ai-insights/projects/${projectId}/worker-matches`, {
      params: { skill },
    });
    return data?.data || [];
  },
};

export default aiInsightService;
