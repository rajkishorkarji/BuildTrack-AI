import api, { realtimeBus } from './api';

let notifications = [];

export const notificationService = {
  async getNotifications() {
    try {
      const res = await api.get('/notifications');
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        notifications = res.data.data.map((n) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          type: n.type || 'INFO',
          time: n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
          read: n.read || false,
        }));
      }
    } catch (err) {
      // Local store fallback
    }
    realtimeBus.emit('NOTIFICATION_UPDATE', notifications);
    return notifications;
  },

  async markAllAsRead() {
    notifications = notifications.map((n) => ({ ...n, read: true }));
    try {
      await api.put('/notifications/mark-read');
    } catch (err) {
      // Local fallback
    }
    realtimeBus.emit('NOTIFICATION_UPDATE', notifications);
    return notifications;
  },

  async markAsRead(id) {
    notifications = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    try {
      await api.put(`/notifications/${id}/read`);
    } catch (err) {
      // Local fallback
    }
    realtimeBus.emit('NOTIFICATION_UPDATE', notifications);
    return notifications;
  },

  async pushAlert(alert) {
    const newAlert = {
      id: Date.now(),
      title: alert.title,
      message: alert.message,
      type: alert.type || 'INFO',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    notifications = [newAlert, ...notifications];
    realtimeBus.emit('NOTIFICATION_UPDATE', notifications);

    try {
      await api.post('/notifications', { title: alert.title, message: alert.message, type: alert.type });
    } catch (err) {
      // Local fallback
    }
    return newAlert;
  },

  subscribeToNotifications(callback) {
    callback(notifications);
    return realtimeBus.subscribe('NOTIFICATION_UPDATE', callback);
  },
};

export default notificationService;
