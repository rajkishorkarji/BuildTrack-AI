import { useEffect, useState, useMemo } from 'react';
import { Bell, Megaphone, CheckCheck, Trash2, Clock, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import notificationService from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';

const TYPE_STYLES = {
  ALERT: { color: 'var(--red)', bg: 'rgba(239,68,68,0.08)', icon: AlertTriangle },
  WARNING: { color: 'var(--orange)', bg: 'rgba(245,154,22,0.08)', icon: AlertTriangle },
  SUCCESS: { color: 'var(--green)', bg: 'rgba(34,197,94,0.08)', icon: CheckCircle2 },
  BROADCAST: { color: 'var(--purple)', bg: 'rgba(139,92,246,0.08)', icon: Megaphone },
  INFO: { color: 'var(--blue)', bg: 'rgba(37,99,235,0.08)', icon: Info },
};

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [form, setForm] = useState({ title: '', message: '', type: 'INFO', targetRole: 'PROJECT_MANAGER' });
  const [notice, setNotice] = useState('');

  useEffect(() => notificationService.subscribeToNotifications(setNotifications), []);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read && !n.isRead).length, [notifications]);
  const isAllSelected = notifications.length > 0 && notifications.every(n => selectedIds.has(n.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(notifications.map(n => n.id)));
    }
  };

  const handleToggleSelect = (id, e) => {
    e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    const idsToDelete = Array.from(selectedIds);
    setNotifications(prev => prev.filter(n => !selectedIds.has(n.id)));
    setSelectedIds(new Set());
    try {
      await notificationService.deleteNotifications(idsToDelete);
    } catch (err) {
      console.error('Failed to delete selected notifications:', err);
    }
  };

  const handleDeleteSingle = async (id, e) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    try {
      await notificationService.deleteNotification(id);
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true, isRead: true })));
    try {
      await notificationService.markAllAsRead();
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const handleMarkRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true, isRead: true } : n));
    notificationService.markAsRead(id);
  };

  const send = async (e) => {
    e.preventDefault();
    await notificationService.broadcast(form);
    setForm({ title: '', message: '', type: 'INFO', targetRole: 'PROJECT_MANAGER' });
    setNotice('Broadcast delivered to the selected role in your company.');
    setTimeout(() => setNotice(''), 3000);
  };

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--blue)', fontWeight: 700 }}>
            <Bell size={14} /> Notifications
            {unreadCount > 0 && (
              <span style={{ fontSize: '11px', background: 'rgba(239,68,68,0.12)', color: 'var(--red)', padding: '1px 6px', borderRadius: 10, fontWeight: 700 }}>
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {selectedIds.size > 0 && (
            <button
              type="button"
              className="secondary-button"
              onClick={handleDeleteSelected}
              style={{
                fontSize: '12px',
                padding: '6px 12px',
                color: 'var(--red)',
                borderColor: 'rgba(239,68,68,0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Trash2 size={13} /> Delete ({selectedIds.size})
            </button>
          )}
          <button
            type="button"
            className="secondary-button"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            style={{ fontSize: '12px', padding: '6px 14px' }}
          >
            <CheckCheck size={14} /> Mark All Read
          </button>
        </div>
      </section>

      {notice && <div className="panel" style={{ marginTop: 14, color: 'var(--green)' }}>{notice}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(300px, .8fr)', gap: 18, marginTop: 18 }}>
        <div className="panel" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>Recent Events</h3>
            {notifications.length > 0 && (
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', userSelect: 'none', fontSize: '12px', color: 'var(--text)', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleToggleSelectAll}
                  style={{ cursor: 'pointer', accentColor: 'var(--blue)', width: 14, height: 14 }}
                />
                <span>Select All ({notifications.length})</span>
              </label>
            )}
          </div>

          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--muted)' }}>
              <Bell size={32} style={{ opacity: 0.35, marginBottom: 8 }} />
              <p style={{ fontSize: '13px', margin: 0 }}>No notifications yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {notifications.map(n => {
                const nType = String(n.type || 'INFO').toUpperCase();
                const style = TYPE_STYLES[nType] || TYPE_STYLES.INFO;
                const Icon = style.icon;
                const isItemRead = Boolean(n.read || n.isRead);
                const isSelected = selectedIds.has(n.id);

                return (
                  <div
                    key={n.id}
                    onClick={() => !isItemRead && handleMarkRead(n.id)}
                    style={{
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: `1px solid ${isSelected ? 'var(--blue)' : 'var(--border)'}`,
                      borderLeft: `3.5px solid ${isItemRead ? (isSelected ? 'var(--blue)' : 'transparent') : style.color}`,
                      background: isSelected ? 'rgba(37,99,235,0.04)' : (isItemRead ? 'var(--panel)' : 'var(--panel-soft)'),
                      color: 'var(--text)',
                      cursor: isItemRead ? 'default' : 'pointer',
                      transition: 'background 0.15s',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleToggleSelect(n.id, e)}
                      onClick={(e) => e.stopPropagation()}
                      style={{ cursor: 'pointer', accentColor: 'var(--blue)', width: 14, height: 14, marginTop: 4, flexShrink: 0 }}
                    />
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        minWidth: 28,
                        display: 'grid',
                        placeItems: 'center',
                        borderRadius: 7,
                        background: `${style.color}15`,
                        color: style.color,
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      <Icon size={14} />
                    </span>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                        <strong style={{ fontSize: '13px', color: 'var(--text)' }}>{n.title}</strong>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                          <span style={{ fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: 4, background: `${style.color}15`, color: style.color }}>
                            {nType}
                          </span>
                          <button
                            type="button"
                            title="Delete"
                            onClick={(e) => handleDeleteSingle(n.id, e)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 2 }}
                            onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <div style={{ color: 'var(--muted)', fontSize: '12px', marginTop: 2, lineHeight: 1.4 }}>{n.message}</div>
                      <small style={{ color: 'var(--muted)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                        <Clock size={10} /> {n.createdAt ? new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                      </small>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="panel" style={{ padding: 20 }}>
          <h3 style={{ marginTop: 0, display: 'flex', gap: 8, alignItems: 'center' }}><Megaphone size={17} /> Broadcast</h3>
          <p style={{ color: 'var(--muted)', fontSize: 12 }}>Send a message only to personnel roles inside your company.</p>
          <form onSubmit={send} style={{ display: 'grid', gap: 10 }}>
            <input required placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <textarea required rows={4} placeholder="Message" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
            <select value={form.targetRole} onChange={e => setForm({ ...form, targetRole: e.target.value })}>
              {['PROJECT_MANAGER', 'SITE_ENGINEER', 'CONTRACTOR', 'WORKER'].map(role => <option key={role} value={role}>{role.replace(/_/g, ' ')}</option>)}
            </select>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              {['INFO', 'SUCCESS', 'WARNING', 'ALERT', 'BROADCAST'].map(type => <option key={type}>{type}</option>)}
            </select>
            <button className="primary-button" type="submit">Send to {form.targetRole.replace(/_/g, ' ')}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
