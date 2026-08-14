import api, { realtimeBus } from './api';

let current = [];
const subscribers = new Set();

async function getNotifications() {
  const response = await api.get('/notifications');
  current = response.data?.data || [];
  subscribers.forEach(fn => fn(current));
  return current;
}

const notificationService = {
  getNotifications,
  async getAll() { return getNotifications(); },
  async markAsRead(id) {
    const response = await api.put(`/notifications/${id}/read`);
    await getNotifications();
    return response.data?.data;
  },
  async markAllAsRead() {
    const response = await api.put('/notifications/mark-read');
    await getNotifications();
    return response.data?.data;
  },
  async broadcast(payload) {
    const response = await api.post('/notifications', payload);
    await getNotifications();
    return response.data?.data;
  },
  subscribeToNotifications(callback) {
    subscribers.add(callback);
    getNotifications().catch(() => callback(current));
    const unsubscribeRealtime = realtimeBus.subscribe('SERVER_UPDATE', () => {
      getNotifications().catch(() => {});
    });
    return () => { subscribers.delete(callback); unsubscribeRealtime(); };
  },
  async pushAlert(alert) {
    if (!alert?.title || !alert?.message || !alert?.targetRole) return null;
    return notificationService.broadcast(alert);
  },
};

export default notificationService;
