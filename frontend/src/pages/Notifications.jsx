import { useState } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Info, ShieldAlert } from 'lucide-react';

const initialNotifs = [
  { id: 1, title: 'Site Alert: Metro Tower', message: 'Floor 14 core drilling safety inspection completed successfully.', type: 'SUCCESS', time: '10 mins ago', read: false },
  { id: 2, title: 'Maintenance Reminder', message: 'Mobile Concrete Pump 5000 scheduled maintenance is pending approval.', type: 'WARNING', time: '1 hour ago', read: false },
  { id: 3, title: 'Budget Approval', message: 'Invoice #INV-2025-002 approved for payment ($78,000 + GST).', type: 'INFO', time: '3 hours ago', read: true },
  { id: 4, title: 'Overtime Notification', message: 'Ronald Richards logged 2 hours overtime at Zone C.', type: 'INFO', time: 'Yesterday', read: true },
];

export default function Notifications() {
  const [notifs, setNotifs] = useState(initialNotifs);

  const markAllRead = () => {
    setNotifs(notifs.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow">Real-Time Site Feed</p>
          <h1>System Alerts & WebSockets Notifications</h1>
        </div>
        <button type="button" className="primary-button" onClick={markAllRead}>
          Mark All as Read
        </button>
      </section>

      <div className="panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Live Activity Feed</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {notifs.map((n) => (
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
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '15px', color: 'var(--text)' }}>{n.title}</strong>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{n.time}</span>
                </div>
                <p style={{ fontSize: '14px', color: 'var(--muted)', margin: 0 }}>{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
