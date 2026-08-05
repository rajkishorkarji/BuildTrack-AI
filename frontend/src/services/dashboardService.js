import api, { realtimeBus } from './api';
import { stats as initialStats, dailyActivities as initialActivities, zones as initialZones, projectProgress as initialProgress, analytics } from '../data/dashboardMockData';

// State buffers for real-time telemetry
let liveStats = [...initialStats];
let liveActivities = [...initialActivities];
let liveZones = [...initialZones];
let liveProgress = [...initialProgress];

// Real-time Event Simulation Generator for dev / offline state
if (typeof window !== 'undefined' && !window.__buildtrack_sim_running) {
  window.__buildtrack_sim_running = true;

  // Periodic Telemetry Simulator Ticks every 4 seconds
  setInterval(() => {
    // 1. Telemetry Activity Stream Event Generator
    const sampleWorkers = ['Rajesh Patel', 'Divya Krishnan', 'Amit Verma', 'Sanjay Gupta', 'Priya Sharma', 'Sunil Kumar'];
    const sampleActions = [
      'logged concrete pours on Floor 15',
      'checked in at Zone B via RFID',
      'completed rebar safety check',
      'submitted crane telemetry report',
      'passed electrical compliance check',
      'uploaded daily work log'
    ];
    const sampleTones = ['green', 'blue', 'amber', 'purple'];

    const randomWorker = sampleWorkers[Math.floor(Math.random() * sampleWorkers.length)];
    const randomAction = sampleActions[Math.floor(Math.random() * sampleActions.length)];
    const randomTone = sampleTones[Math.floor(Math.random() * sampleTones.length)];
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newActivity = {
      name: randomWorker,
      time: timeStr,
      detail: randomAction,
      status: randomTone,
    };

    liveActivities = [newActivity, ...liveActivities.slice(0, 19)];
    realtimeBus.emit('ACTIVITY_UPDATE', liveActivities);

    // 2. Zone Live Worker Movement Simulator Ticks
    const zoneIdx = Math.floor(Math.random() * liveZones.length);
    const delta = Math.floor(Math.random() * 5) - 2;
    liveZones[zoneIdx] = {
      ...liveZones[zoneIdx],
      count: Math.max(10, liveZones[zoneIdx].count + delta),
    };
    realtimeBus.emit('SITEMAP_UPDATE', liveZones);

    // 3. Dynamic Stats Updates
    const activeWorkers = liveZones.reduce((sum, z) => sum + z.count, 0);
    liveStats = liveStats.map((s) => {
      if (s.label === 'Workers Present') {
        return { ...s, value: String(activeWorkers) };
      }
      return s;
    });
    realtimeBus.emit('STATS_UPDATE', liveStats);

  }, 4500);
}

export const dashboardService = {
  async getStats() {
    try {
      const res = await api.get('/dashboard/stats');
      return res.data?.data || liveStats;
    } catch {
      return liveStats;
    }
  },

  async getDailyActivities() {
    try {
      const res = await api.get('/dashboard/activities');
      return res.data?.data || liveActivities;
    } catch {
      return liveActivities;
    }
  },

  async getZones() {
    try {
      const res = await api.get('/dashboard/site-map');
      return res.data?.data || liveZones;
    } catch {
      return liveZones;
    }
  },

  async getProjectProgress() {
    try {
      const res = await api.get('/dashboard/progress');
      return res.data?.data || liveProgress;
    } catch {
      return liveProgress;
    }
  },

  async getAnalytics() {
    try {
      const res = await api.get('/dashboard/analytics');
      return res.data?.data || analytics;
    } catch {
      return analytics;
    }
  },

  subscribeToLiveFeed(callback) {
    callback(liveActivities);
    return realtimeBus.subscribe('ACTIVITY_UPDATE', callback);
  },

  subscribeToSiteMap(callback) {
    callback(liveZones);
    return realtimeBus.subscribe('SITEMAP_UPDATE', callback);
  },

  subscribeToStats(callback) {
    callback(liveStats);
    return realtimeBus.subscribe('STATS_UPDATE', callback);
  },
};

export default dashboardService;
