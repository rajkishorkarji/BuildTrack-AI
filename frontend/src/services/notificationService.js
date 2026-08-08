import api, { realtimeBus } from './api';

let notifications = (() => {
  try { return JSON.parse(localStorage.getItem('buildtrack_notifications') || '[]'); } catch { return []; }
})();

const persist = () => localStorage.setItem('buildtrack_notifications', JSON.stringify(notifications));

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
          timestamp: n.createdAt || new Date().toISOString(),
          time: n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
          read: n.read || false,
          recipientEmail: n.recipientEmail,
          companyId: n.companyId,
          from: n.senderName,
        }));
        persist();
      }
    } catch (err) {
      // Local store fallback
    }
    realtimeBus.emit('NOTIFICATION_UPDATE', notifications);
    return notifications;
  },

  async markAllAsRead() {
    const user = JSON.parse(localStorage.getItem('buildtrack_user') || '{}');
    notifications = notifications.map((n) => !n.recipientEmail || n.recipientEmail === user.email ? { ...n, read: true } : n);
    persist();
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
    persist();
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
      timestamp: new Date().toISOString(),
      recipientEmail: alert.recipientEmail || JSON.parse(localStorage.getItem('buildtrack_user') || '{}').email,
      from: alert.from,
    };
    notifications = [newAlert, ...notifications];
    persist();
    realtimeBus.emit('NOTIFICATION_UPDATE', notifications);

    try {
      await api.post('/notifications', { title: alert.title, message: alert.message, type: alert.type });
    } catch (err) {
      // Local fallback
    }
    return newAlert;
  },

  async broadcast({ title, message, type = 'BROADCAST', targetRole, from, companyCode }) {
    try {
      const response = await api.post('/notifications', { title, message, type, targetRole });
      await this.getNotifications();
      return response.data?.data || [];
    } catch (err) {
      const users = JSON.parse(localStorage.getItem('buildtrack_registered_users') || '[]');
      const normalizedRole = String(targetRole || '').toUpperCase();
      const recipients = users.filter((item) =>
        String(item.role || '').toUpperCase() === normalizedRole &&
        (!companyCode || item.companyCode === companyCode)
      );
      const created = recipients.map((recipient, index) => ({
        id: `${Date.now()}-${index}`,
        title,
        message,
        type,
        read: false,
        from,
        recipientEmail: recipient.email,
        timestamp: new Date().toISOString(),
      }));
      notifications = [...created, ...notifications];
      persist();
      realtimeBus.emit('NOTIFICATION_UPDATE', notifications);
      return created;
    }
  },

  subscribeToNotifications(callback) {
    callback(notifications);
    return realtimeBus.subscribe('NOTIFICATION_UPDATE', callback);
  },

  subscribe(callback) {
    return this.subscribeToNotifications(callback);
  },
};

export default notificationService;
