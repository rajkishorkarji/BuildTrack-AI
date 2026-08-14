import { useState, useEffect, useMemo } from 'react';
import { Bell, Search, CheckCheck, Megaphone, Clock, AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';
import notificationService from '../../services/notificationService';
import { realtimeBus } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const TAB = (active) => ({
  padding: '7px 14px',
  borderRadius: '7px',
  border: 'none',
  background: active ? 'var(--blue)' : 'var(--panel)',
  color: active ? '#fff' : 'var(--muted)',
  fontWeight: 600,
  fontSize: '12px',
  cursor: 'pointer',
});

const TYPE_STYLES = {
  'ALERT': { color: 'var(--red)', bg: 'rgba(239,68,68,0.10)', icon: <AlertTriangle size={16} style={{ color: 'var(--red)' }} /> },
  'WARNING': { color: 'var(--orange)', bg: 'rgba(245,154,22,0.10)', icon: <AlertTriangle size={16} style={{ color: 'var(--orange)' }} /> },
  'INFO': { color: 'var(--blue)', bg: 'rgba(37,99,235,0.10)', icon: <Info size={16} style={{ color: 'var(--blue)' }} /> },
  'SUCCESS': { color: 'var(--green)', bg: 'rgba(34,197,94,0.10)', icon: <CheckCircle2 size={16} style={{ color: 'var(--green)' }} /> },
  'BROADCAST': { color: 'var(--purple)', bg: 'rgba(139,92,246,0.10)', icon: <Megaphone size={16} style={{ color: 'var(--purple)' }} /> },
};

export default function Notifications() {
  const { user } = useAuth();
  const role = user?.role || 'SUPER_ADMIN';
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({ title: '', message: '', type: 'BROADCAST', targetRole: 'COMPANY_ADMIN' });
  const [notice, setNotice] = useState('');

  const loadNotifications = async () => {
    try {
      const list = await notificationService.getAll();
      setNotifications(list || []);
    } catch (e) {
      console.error('Failed to load notifications:', e);
    }
  };

  useEffect(() => {
    loadNotifications();
    const unsubscribe = notificationService.subscribeToNotifications((notifs) => setNotifications(notifs || []));
    const unsubRealtime = realtimeBus.subscribe('SERVER_UPDATE', () => loadNotifications());
    return () => {
      unsubscribe();
      unsubRealtime();
    };
  }, []);

  const notify = (msg) => { setNotice(msg); setTimeout(() => setNotice(''), 3000); };

  const isUnread = (n) => !n.read && !n.isRead;
  const isAlert = (n) => ['ALERT', 'WARNING', 'CRITICAL', 'COST_OVERRUN'].includes(String(n.type || '').toUpperCase());
  const isBroadcast = (n) => String(n.type || '').toUpperCase() === 'BROADCAST';

  const unreadCount = useMemo(() => notifications.filter(isUnread).length, [notifications]);
  const alertCount = useMemo(() => notifications.filter(isAlert).length, [notifications]);
  const broadcastCount = useMemo(() => notifications.filter(isBroadcast).length, [notifications]);

  const markRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true, isRead: true } : n));
    } catch (e) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true, isRead: true } : n));
    }
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true, isRead: true })));
      notify('All notifications marked as read.');
    } catch (e) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true, isRead: true })));
    }
  };

  const deleteNotif = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const sendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastForm.title || !broadcastForm.message) return;
    try {
      await notificationService.broadcast({ ...broadcastForm });
      setShowBroadcast(false);
      setBroadcastForm({ title: '', message: '', type: 'BROADCAST', targetRole: 'COMPANY_ADMIN' });
      notify('Broadcast dispatched successfully!');
      await loadNotifications();
    } catch (err) {
      notify(err?.response?.data?.message || 'Broadcast sent.');
      setShowBroadcast(false);
    }
  };

  const filtered = useMemo(() => {
    return notifications.filter(n => {
      const title = n.title || n.subject || '';
      const msg = n.message || n.body || '';
      const sender = n.senderName || n.from || '';
      const matchSearch = [title, msg, sender].join(' ').toLowerCase().includes(search.toLowerCase());
      const nType = String(n.type || 'INFO').toUpperCase();
      const matchType = typeFilter === 'ALL' || nType === typeFilter;
      const matchTab = activeTab === 'all' ||
        (activeTab === 'unread' && isUnread(n)) ||
        (activeTab === 'alerts' && isAlert(n)) ||
        (activeTab === 'broadcasts' && isBroadcast(n));
      return matchSearch && matchType && matchTab;
    });
  }, [notifications, search, typeFilter, activeTab]);

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <Bell size={14} /> Notifications
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" className="secondary-button" onClick={markAllRead} disabled={unreadCount === 0}>
            <CheckCheck size={15} /> Mark All Read
          </button>
          {['SUPER_ADMIN', 'COMPANY_ADMIN'].includes(role) && (
            <button type="button" className="primary-button" onClick={() => setShowBroadcast(true)}>
              <Megaphone size={15} /> Broadcast Alert
            </button>
          )}
        </div>
      </section>

      {notice && (
        <div style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: 'var(--green)', padding: '12px 18px', borderRadius: '10px', fontWeight: 600, fontSize: '13px', marginTop: '16px' }}>
          {notice}
        </div>
      )}

      {/* KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px', marginTop: '20px' }}>
        {[
          { label: 'Total Notifications', value: notifications.length, color: 'var(--blue)' },
          { label: 'Unread', value: unreadCount, color: unreadCount > 0 ? 'var(--orange)' : 'var(--muted)' },
          { label: 'Critical Alerts', value: alertCount, color: alertCount > 0 ? 'var(--red)' : 'var(--green)' },
          { label: 'Broadcasts', value: broadcastCount, color: 'var(--purple)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="panel" style={{ padding: '14px' }}>
            <span style={{ color: 'var(--muted)', fontSize: '11px', fontWeight: 600 }}>{label}</span>
            <h3 style={{ fontSize: '22px', color, margin: '4px 0 0 0', fontWeight: 800 }}>{value}</h3>
          </div>
        ))}
      </div>

      {/* Tabs + Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            ['all', 'All'],
            ['unread', `Unread (${unreadCount})`],
            ['alerts', `Alerts (${alertCount})`],
            ['broadcasts', `Broadcasts (${broadcastCount})`]
          ].map(([id, label]) => (
            <button key={id} type="button" onClick={() => setActiveTab(id)} style={TAB(activeTab === id)}>{label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div className="search-box" style={{ width: '220px' }}>
            <Search size={14} style={{ color: 'var(--muted)' }} />
            <input placeholder="Search notifications..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ padding: '7px 12px', borderRadius: '7px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)', fontSize: '12px', fontWeight: 600 }}>
            <option value="ALL">All Types</option>
            {['ALERT', 'WARNING', 'INFO', 'SUCCESS', 'BROADCAST'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* ── Notification Feed ── */}
      <div style={{ marginTop: '20px' }}>
        {filtered.length === 0 ? (
          <div className="panel" style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--muted)' }}>
            <Bell size={44} style={{ marginBottom: '12px', color: 'var(--muted)' }} />
            <h3 style={{ color: 'var(--text)', marginBottom: '6px', fontWeight: 700 }}>
              {activeTab === 'unread' ? 'No Unread Notifications' : 'No Notifications Found'}
            </h3>
            <p style={{ fontSize: '13px' }}>
              {activeTab === 'unread' ? "You're all caught up! Great work." : 'Notifications from the platform will appear here.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map(notif => {
              const nType = String(notif.type || 'INFO').toUpperCase();
              const ts = TYPE_STYLES[nType] || TYPE_STYLES['INFO'];
              const readState = !isUnread(notif);
              const createdAt = notif.createdAt || notif.timestamp;
              return (
                <div key={notif.id}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '16px', background: readState ? 'var(--panel)' : ts.bg, borderRadius: '12px', border: `1px solid ${readState ? 'var(--border)' : ts.color}`, cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => markRead(notif.id)}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${ts.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {ts.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <strong style={{ fontSize: '14px', color: 'var(--text)' }}>{notif.title || notif.subject || 'Notification'}</strong>
                        {!readState && <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: ts.color, display: 'inline-block', flexShrink: 0 }} />}
                        <span style={{ padding: '2px 7px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, background: ts.bg, color: ts.color, flexShrink: 0 }}>{nType}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                        {!readState && (
                          <button type="button" onClick={(e) => { e.stopPropagation(); markRead(notif.id); }} className="secondary-button" style={{ fontSize: '11px', padding: '4px 8px' }}>Read</button>
                        )}
                        <button type="button" onClick={(e) => { e.stopPropagation(); deleteNotif(notif.id); }} className="secondary-button" style={{ color: 'var(--muted)', padding: '4px 7px' }}>
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 6px 0', lineHeight: '1.5' }}>{notif.message || notif.body}</p>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--muted)' }}>
                      {(notif.senderName || notif.from) && <span>From: <strong style={{ color: 'var(--text)' }}>{notif.senderName || notif.from}</strong></span>}
                      {notif.recipientEmail && <span>Target: <strong style={{ color: 'var(--text)' }}>{notif.recipientEmail}</strong></span>}
                      {createdAt && <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Clock size={10} /> {new Date(createdAt).toLocaleString('en-IN')}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Broadcast Modal ── */}
      {showBroadcast && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="panel" style={{ width: '100%', maxWidth: '480px', padding: '28px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '20px', margin: 0, fontWeight: 800 }}>Broadcast Platform Alert</h2>
              <button type="button" className="secondary-button" onClick={() => setShowBroadcast(false)} style={{ padding: 6 }}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={sendBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '13px', fontSize: '13px' }}>
              <div>
                <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>Alert Title *</label>
                <input type="text" placeholder="e.g. Scheduled System Maintenance" value={broadcastForm.title}
                  onChange={e => setBroadcastForm({ ...broadcastForm, title: e.target.value })} required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>Message Body *</label>
                <textarea placeholder="Detailed notification message for tenant administrators..." value={broadcastForm.message} rows={4}
                  onChange={e => setBroadcastForm({ ...broadcastForm, message: e.target.value })} required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: '13px', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>Alert Type</label>
                  <select value={broadcastForm.type} onChange={e => setBroadcastForm({ ...broadcastForm, type: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: '13px' }}>
                    {['BROADCAST', 'ALERT', 'WARNING', 'INFO', 'SUCCESS'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>Target Audience</label>
                  <select value={broadcastForm.targetRole} onChange={e => setBroadcastForm({ ...broadcastForm, targetRole: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: '13px' }}>
                    <option value="COMPANY_ADMIN">Company Admins</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button type="button" className="secondary-button" onClick={() => setShowBroadcast(false)}>Cancel</button>
                <button type="submit" className="primary-button">Send Broadcast</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
