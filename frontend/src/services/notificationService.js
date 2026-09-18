import api, { realtimeBus } from './api';

let current = [];
const subscribers = new Set();

function emitCurrent() {
  const snapshot = current.map(n => ({
    ...n,
    read: Boolean(n.read || n.isRead),
    isRead: Boolean(n.read || n.isRead),
  }));
  subscribers.forEach(fn => fn(snapshot));
}

async function getNotifications() {
  const response = await api.get('/notifications');
  const items = response.data?.data || [];
  current = items.map(n => ({
    ...n,
    read: Boolean(n.read || n.isRead),
    isRead: Boolean(n.read || n.isRead),
  }));
  emitCurrent();
  return current;
}

const notificationService = {
  getNotifications,
  async getAll() { return getNotifications(); },
  async markAsRead(id) {
    current = current.map(n => (n.id === id ? { ...n, read: true, isRead: true } : n));
    emitCurrent();
    try {
      const response = await api.put(`/notifications/${id}/read`);
      return response.data?.data;
    } catch (e) {
      console.error('Failed to mark notification as read:', e);
    }
  },
  async markAllAsRead() {
    current = current.map(n => ({ ...n, read: true, isRead: true }));
    emitCurrent();
    try {
      const response = await api.put('/notifications/mark-read');
      return response.data?.data;
    } catch (e) {
      console.error('Failed to mark all notifications as read:', e);
    }
  },
  async broadcast(payload) {
    const response = await api.post('/notifications', payload);
    await getNotifications();
    return response.data?.data;
  },
  subscribeToNotifications(callback) {
    subscribers.add(callback);
    getNotifications().catch(() => callback(current));
    let timer = null;
    const unsubscribeRealtime = realtimeBus.subscribe('SERVER_UPDATE', (evt) => {
      if (evt?.domain === 'notifications' && (evt?.action === 'read' || evt?.action === 'read_all' || evt?.action === 'deleted')) {
        return;
      }
      clearTimeout(timer);
      timer = setTimeout(() => {
        getNotifications().catch(() => {});
      }, 300);
    });
    return () => {
      clearTimeout(timer);
      subscribers.delete(callback);
      unsubscribeRealtime();
    };
  },
  async deleteNotification(id) {
    current = current.filter(n => n.id !== id);
    emitCurrent();
    try {
      const response = await api.delete(`/notifications/${id}`);
      return response.data?.data;
    } catch (e) {
      console.error('Failed to delete notification:', e);
    }
  },
  async deleteNotifications(ids) {
    if (!ids || !ids.length) return;
    const idSet = new Set(ids);
    current = current.filter(n => !idSet.has(n.id));
    emitCurrent();
    try {
      const response = await api.post('/notifications/batch-delete', { ids });
      return response.data?.data;
    } catch (e) {
      console.error('Failed to delete notifications:', e);
    }
  },
  async deleteAll() {
    current = [];
    emitCurrent();
    try {
      const response = await api.delete('/notifications/all');
      return response.data?.data;
    } catch (e) {
      console.error('Failed to delete all notifications:', e);
    }
  },
  async pushAlert(alert) {
    if (!alert?.title || !alert?.message || !alert?.targetRole) return null;
    return notificationService.broadcast(alert);
  },
};

export default notificationService;
