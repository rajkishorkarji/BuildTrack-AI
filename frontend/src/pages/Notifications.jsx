import { useEffect, useMemo, useState } from 'react';
import { Bell, CheckCheck, AlertTriangle, Info, CheckCircle2, Clock, Megaphone } from 'lucide-react';
import notificationService from '../services/notificationService';

const TYPE_STYLES = {
  ALERT: { color: 'var(--red)', bg: 'rgba(239,68,68,0.10)', icon: AlertTriangle },
  WARNING: { color: 'var(--orange)', bg: 'rgba(245,154,22,0.10)', icon: AlertTriangle },
  SUCCESS: { color: 'var(--green)', bg: 'rgba(34,197,94,0.10)', icon: CheckCircle2 },
  BROADCAST: { color: 'var(--purple)', bg: 'rgba(139,92,246,0.10)', icon: Megaphone },
  INFO: { color: 'var(--blue)', bg: 'rgba(37,99,235,0.10)', icon: Info },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => notificationService.subscribeToNotifications(setNotifications), []);

  const filtered = useMemo(() => filter === 'ALL'
    ? notifications
    : notifications.filter(n => n.type === filter), [notifications, filter]);

  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--blue)', fontWeight: 700 }}>
            <Bell size={14} /> Notifications
          </p>
          <h1 style={{ margin: '4px 0 0' }}>Real-time notification center</h1>
        </div>
        <button type="button" className="secondary-button" onClick={() => notificationService.markAllAsRead()} disabled={!unread}>
          <CheckCheck size={15} /> Mark All as Read
        </button>
      </section>

      <div style={{ display: 'flex', gap: 8, margin: '18px 0' }}>
        {['ALL', 'INFO', 'SUCCESS', 'WARNING', 'ALERT', 'BROADCAST'].map(type => (
          <button key={type} type="button" className={filter === type ? 'primary-button' : 'secondary-button'} onClick={() => setFilter(type)}>
            {type === 'ALL' ? `All (${notifications.length})` : type}
          </button>
        ))}
      </div>

      <div className="panel" style={{ padding: 20 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 50, color: 'var(--muted)' }}>
            <Bell size={40} />
            <p>No notifications yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(notification => {
              const style = TYPE_STYLES[notification.type] || TYPE_STYLES.INFO;
              const Icon = style.icon;
              return (
                <button
                  type="button"
                  key={notification.id}
                  onClick={() => !notification.read && notificationService.markAsRead(notification.id)}
                  style={{ textAlign: 'left', display: 'flex', gap: 12, padding: 14, borderRadius: 12, border: `1px solid ${notification.read ? 'var(--border)' : style.color}`, background: notification.read ? 'var(--panel)' : style.bg, color: 'var(--text)', cursor: notification.read ? 'default' : 'pointer' }}
                >
                  <span style={{ width: 34, height: 34, display: 'grid', placeItems: 'center', borderRadius: 9, background: `${style.color}20`, color: style.color, flexShrink: 0 }}><Icon size={17} /></span>
                  <span style={{ flex: 1 }}>
                    <strong>{notification.title}</strong>
                    <span style={{ display: 'block', marginTop: 3, color: 'var(--muted)', fontSize: 13 }}>{notification.message}</span>
                    <span style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 6, color: 'var(--muted)', fontSize: 11 }}>
                      <Clock size={11} /> {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 'Just now'}
                      {notification.senderName && <span>• {notification.senderName}</span>}
                    </span>
                  </span>
                  {!notification.read && <span style={{ width: 7, height: 7, borderRadius: '50%', background: style.color, marginTop: 6 }} />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
