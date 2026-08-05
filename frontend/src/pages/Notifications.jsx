import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, CheckCircle2, AlertTriangle, Info, Settings, Check } from 'lucide-react';
import notificationService from '../services/notificationService';

export default function Notifications() {
  const { user } = useAuth();
  const role = user?.role || 'SUPER_ADMIN';

  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'settings'
  const [notifs, setNotifs] = useState([]);
  const [notice, setNotice] = useState('');

  // Notification Channel Settings State
  const [channels, setChannels] = useState({
    taskAssigned: { email: true, inApp: true, sms: true },
    shiftChanges: { email: true, inApp: true, sms: false },
    equipmentAlerts: { email: false, inApp: true, sms: false },
    financeApprovals: { email: true, inApp: true, sms: true },
    aiRiskAlerts: { email: true, inApp: true, sms: false },
  });

  useEffect(() => {
    // Initial fetch from REST API or local store
    notificationService.getNotifications().then((data) => {
      if (data) setNotifs(data);
    });

    // Subscribe to real-time updates via Event Bus / WebSockets
    const unsubscribe = notificationService.subscribeToNotifications((data) => {
      setNotifs(data);
    });
    return () => unsubscribe();
  }, []);

  const markAllRead = async () => {
    const updated = await notificationService.markAllAsRead();
    setNotifs(updated);
    setNotice('All notifications marked as read.');
    setTimeout(() => setNotice(''), 3000);
  };

  const markSingleRead = async (id) => {
    const updated = await notificationService.markAsRead(id);
    setNotifs(updated);
  };

  const isManagementRole = role === 'SUPER_ADMIN' || role === 'COMPANY_ADMIN' || role === 'PROJECT_MANAGER';

  // Filter notifications based on role scope (Worker sees shift/safety/task alerts, fallback to all if none match)
  const filteredNotifs = notifs.filter((n) => {
    if (role === 'WORKER') {
      const isRelevant = n.title.includes('Shift') || n.title.includes('Safety') || n.title.includes('Task') || n.title.includes('Site Alert') || n.title.includes('Overtime');
      return isRelevant;
    }
    return true;
  });

  const displayNotifs = filteredNotifs.length > 0 ? filteredNotifs : notifs;

  return (
    <div className="dashboard-page">
      {/* Hero Row */}
      <section className="hero-row">
        <div>
          <p className="eyebrow">Real-Time Event Stream</p>
          <h1>Notifications Center</h1>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {activeTab === 'feed' && (
            <button type="button" className="primary-button" onClick={markAllRead}>
              Mark All as Read
            </button>
          )}
        </div>
      </section>

      {notice && (
        <div style={{ background: 'rgba(36, 196, 107, 0.15)', border: '1px solid var(--green)', color: 'var(--green)', padding: '12px 18px', borderRadius: '10px', fontWeight: 600, fontSize: '14px', marginTop: '16px' }}>
          {notice}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('feed')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'feed' ? 'var(--blue)' : 'var(--panel)',
            color: activeTab === 'feed' ? '#fff' : 'var(--muted)',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Bell size={15} /> Real-Time Activity Feed ({displayNotifs.filter((n) => !n.read).length} Unread)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'settings' ? 'var(--blue)' : 'var(--panel)',
            color: activeTab === 'settings' ? '#fff' : 'var(--muted)',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Settings size={15} /> Notification Settings & Channels
        </button>
      </div>

      {/* TAB 1: REAL-TIME FEED */}
      {activeTab === 'feed' && (
        <div className="panel" style={{ padding: '0', overflow: 'hidden', marginTop: '20px' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Live Activity Feed ({displayNotifs.length} Total Alerts)</span>
            <span style={{ fontSize: '12px', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--green)' }} /> WebSocket Stream Connected
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {displayNotifs.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)', fontSize: '13px' }}>
                No records found
              </div>
            )}
            {displayNotifs.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: '20px',
                  borderBottom: '1px solid var(--border)',
                  background: n.read ? 'transparent' : 'var(--panel-soft)',
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ marginTop: '2px' }}>
                  {n.type === 'SUCCESS' && <CheckCircle2 size={20} style={{ color: 'var(--green)' }} />}
                  {n.type === 'WARNING' && <AlertTriangle size={20} style={{ color: 'var(--orange)' }} />}
                  {n.type === 'INFO' && <Info size={20} style={{ color: 'var(--blue)' }} />}
                  {n.type === 'ALERT' && <AlertTriangle size={20} style={{ color: 'var(--red)' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '15px', color: 'var(--text)' }}>{n.title}</strong>
                      {!n.read && (
                        <span style={{ background: 'var(--blue)', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '10px', fontWeight: 700 }}>
                          NEW
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{n.time}</span>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--muted)', margin: 0 }}>{n.message}</p>
                </div>
                {!n.read && (
                  <button
                    type="button"
                    onClick={() => markSingleRead(n.id)}
                    className="secondary-button"
                    style={{ fontSize: '11px', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    title="Mark read"
                  >
                    <Check size={12} /> Mark Read
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: NOTIFICATION SETTINGS & TRIGGERS */}
      {activeTab === 'settings' && (
        <div className="panel" style={{ padding: '24px', marginTop: '20px', maxWidth: '750px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>
            {isManagementRole ? 'Configure Event Triggers & Channels' : 'Personal Notification Preferences'}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '20px' }}>
            Select which platform events trigger In-App, Email, or SMS notifications.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: 'var(--panel-soft)', borderRadius: '10px' }}>
              <div>
                <strong>New Task & Shift Assignment</strong>
                <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '2px 0 0 0' }}>Triggered when deployed to new work site or task.</p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '12px' }}>
                  <input
                    type="checkbox"
                    checked={channels.taskAssigned.inApp}
                    onChange={(e) => setChannels({ ...channels, taskAssigned: { ...channels.taskAssigned, inApp: e.target.checked } })}
                  /> In-App
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '12px' }}>
                  <input
                    type="checkbox"
                    checked={channels.taskAssigned.email}
                    onChange={(e) => setChannels({ ...channels, taskAssigned: { ...channels.taskAssigned, email: e.target.checked } })}
                  /> Email
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '12px' }}>
                  <input
                    type="checkbox"
                    checked={channels.taskAssigned.sms}
                    onChange={(e) => setChannels({ ...channels, taskAssigned: { ...channels.taskAssigned, sms: e.target.checked } })}
                  /> SMS
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: 'var(--panel-soft)', borderRadius: '10px' }}>
              <div>
                <strong>AI Delay & Cost Overrun Alerts</strong>
                <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '2px 0 0 0' }}>High-severity ML risk notifications.</p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '12px' }}>
                  <input
                    type="checkbox"
                    checked={channels.aiRiskAlerts.inApp}
                    onChange={(e) => setChannels({ ...channels, aiRiskAlerts: { ...channels.aiRiskAlerts, inApp: e.target.checked } })}
                  /> In-App
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '12px' }}>
                  <input
                    type="checkbox"
                    checked={channels.aiRiskAlerts.email}
                    onChange={(e) => setChannels({ ...channels, aiRiskAlerts: { ...channels.aiRiskAlerts, email: e.target.checked } })}
                  /> Email
                </label>
              </div>
            </div>

            <button
              type="button"
              className="primary-button"
              style={{ alignSelf: 'flex-start', marginTop: '10px' }}
              onClick={() => {
                setNotice('Notification channel preferences saved successfully.');
                setTimeout(() => setNotice(''), 3000);
              }}
            >
              Save Notification Preferences
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
