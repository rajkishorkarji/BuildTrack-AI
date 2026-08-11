import api, { realtimeBus } from './api';

export const dashboardService = {
  async getStats() {
    const res = await api.get('/dashboard/stats');
    return res.data?.data || {};
  },
  async getDailyActivities() {
    const res = await api.get('/dashboard/activities');
    return res.data?.data || [];
  },
  async getZones() {
    const res = await api.get('/dashboard/site-map');
    return res.data?.data || [];
  },
  async getProjectProgress() {
    const res = await api.get('/dashboard/progress');
    return res.data?.data || [];
  },
  async getAnalytics() {
    const res = await api.get('/dashboard/analytics');
    return res.data?.data || {};
  },
  subscribeToLiveFeed(callback) { return realtimeBus.subscribe('SERVER_UPDATE', e => e?.domain === 'activities' ? callback(e.payload) : undefined); },
  subscribeToSiteMap(callback) { return realtimeBus.subscribe('SERVER_UPDATE', e => e?.domain === 'sitemap' ? callback(e.payload) : undefined); },
  subscribeToStats(callback) { return realtimeBus.subscribe('SERVER_UPDATE', e => e?.domain === 'stats' ? callback(e.payload) : undefined); },
};

export default dashboardService;
