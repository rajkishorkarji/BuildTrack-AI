import { useEffect, useMemo, useState } from 'react';
import { Bell, CheckCheck, AlertTriangle, Info, CheckCircle2, Clock, Megaphone, Trash2 } from 'lucide-react';
import notificationService from '../services/notificationService';
import { useAuth } from '../context/AuthContext';

const TYPE_STYLES = {
  ALERT: { color: 'var(--red)', bg: 'rgba(239,68,68,0.08)', icon: AlertTriangle },
  WARNING: { color: 'var(--orange)', bg: 'rgba(245,154,22,0.08)', icon: AlertTriangle },
  SUCCESS: { color: 'var(--green)', bg: 'rgba(34,197,94,0.08)', icon: CheckCircle2 },
  BROADCAST: { color: 'var(--purple)', bg: 'rgba(139,92,246,0.08)', icon: Megaphone },
  INFO: { color: 'var(--blue)', bg: 'rgba(37,99,235,0.08)', icon: Info },
};

export default function Notifications() {
  const { user } = useAuth();
  const role = String(user?.role || '').toUpperCase();
  // Filter tabs hidden for Worker, Contractor, and Site Engineer pages
  const hideFilterTabs = ['WORKER', 'CONTRACTOR', 'SITE_ENGINEER'].includes(role);

  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState(new Set());

  useEffect(() => notificationService.subscribeToNotifications(setNotifications), []);

  const filtered = useMemo(() => {
    if (hideFilterTabs || filter === 'ALL') return notifications;
    return notifications.filter(n => String(n.type || '').toUpperCase() === filter);
  }, [notifications, filter, hideFilterTabs]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read && !n.isRead).length;
  }, [notifications]);

  const isAllSelected = filtered.length > 0 && filtered.every(n => selectedIds.has(n.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(n => n.id)));
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
            <CheckCheck size={14} /> Mark All as Read
          </button>
        </div>
      </section>

      {/* Filter tabs hidden for Worker, Contractor, and Site Engineer pages */}
      {!hideFilterTabs && (
        <div style={{ display: 'flex', gap: 6, margin: '14px 0', flexWrap: 'wrap' }}>
          {['ALL', 'INFO', 'SUCCESS', 'WARNING', 'ALERT', 'BROADCAST'].map(type => {
            const count = type === 'ALL'
              ? notifications.length
              : notifications.filter(n => String(n.type || '').toUpperCase() === type).length;
            const isActive = filter === type;
            return (
              <button
                key={type}
                type="button"
                className={isActive ? 'primary-button' : 'secondary-button'}
                onClick={() => setFilter(type)}
                style={{ fontSize: '12px', padding: '5px 12px', borderRadius: '8px' }}
              >
                {type === 'ALL' ? `All (${count})` : `${type} (${count})`}
              </button>
            );
          })}
        </div>
      )}

      <div className="panel" style={{ padding: '16px', marginTop: hideFilterTabs ? '14px' : '0' }}>
        {filtered.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              background: 'var(--panel-soft)',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              marginBottom: '10px',
              fontSize: '12px',
              color: 'var(--muted)',
            }}
          >
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none', fontWeight: 600, color: 'var(--text)' }}>
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={handleToggleSelectAll}
                style={{ cursor: 'pointer', accentColor: 'var(--blue)', width: 14, height: 14 }}
              />
              <span>Select All ({filtered.length})</span>
            </label>
            {selectedIds.size > 0 && (
              <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                {selectedIds.size} selected
              </span>
            )}
          </div>
        )}

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--muted)' }}>
            <Bell size={34} style={{ opacity: 0.35, marginBottom: 8 }} />
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', margin: '0 0 3px 0' }}>No notifications</p>
            <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0 }}>Your inbox is completely up to date.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(notification => {
              const nType = String(notification.type || 'INFO').toUpperCase();
              const style = TYPE_STYLES[nType] || TYPE_STYLES.INFO;
              const Icon = style.icon;
              const isItemRead = Boolean(notification.read || notification.isRead);
              const isSelected = selectedIds.has(notification.id);

              return (
                <div
                  key={notification.id}
                  onClick={() => !isItemRead && handleMarkRead(notification.id)}
                  style={{
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '11px 14px',
                    borderRadius: 10,
                    border: `1px solid ${isSelected ? 'var(--blue)' : 'var(--border)'}`,
                    borderLeft: `3.5px solid ${isItemRead ? (isSelected ? 'var(--blue)' : 'transparent') : style.color}`,
                    background: isSelected ? 'rgba(37,99,235,0.04)' : (isItemRead ? 'var(--panel)' : 'var(--panel-soft)'),
                    color: 'var(--text)',
                    cursor: isItemRead ? 'default' : 'pointer',
                    transition: 'background 0.15s, border-color 0.15s',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => handleToggleSelect(notification.id, e)}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      cursor: 'pointer',
                      accentColor: 'var(--blue)',
                      width: 14,
                      height: 14,
                      marginTop: 6,
                      flexShrink: 0,
                    }}
                  />

                  <span
                    style={{
                      width: 30,
                      height: 30,
                      minWidth: 30,
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: 8,
                      background: `${style.color}15`,
                      color: style.color,
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    <Icon size={15} />
                  </span>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '13px', fontWeight: 650, color: 'var(--text)', lineHeight: 1.3 }}>
                          {notification.title || 'Platform Notification'}
                        </span>
                        <span
                          style={{
                            fontSize: '9.5px',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: 4,
                            background: `${style.color}15`,
                            color: style.color,
                            letterSpacing: '0.03em',
                            textTransform: 'uppercase',
                          }}
                        >
                          {nType}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        {!isItemRead && (
                          <span
                            title="Unread"
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: '50%',
                              background: style.color,
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <button
                          type="button"
                          title="Delete notification"
                          onClick={(e) => handleDeleteSingle(notification.id, e)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--muted)',
                            cursor: 'pointer',
                            padding: '3px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'color 0.15s, background 0.15s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'var(--red)';
                            e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--muted)';
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <p
                      style={{
                        margin: '3px 0 0 0',
                        color: 'var(--muted)',
                        fontSize: '12px',
                        lineHeight: 1.45,
                        wordBreak: 'break-word',
                      }}
                    >
                      {notification.message}
                    </p>

                    <div
                      style={{
                        display: 'flex',
                        gap: 10,
                        alignItems: 'center',
                        marginTop: 6,
                        color: 'var(--muted)',
                        fontSize: '11px',
                        lineHeight: 1,
                      }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={11} />
                        {notification.createdAt
                          ? new Date(notification.createdAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Just now'}
                      </span>
                      {notification.senderName && <span>• {notification.senderName}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
