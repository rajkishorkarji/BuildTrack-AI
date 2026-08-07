import { useState, useEffect } from 'react';
import notificationService from '../../services/notificationService';
import { Bell, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function PMNotifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const unsubscribe = notificationService.subscribeToNotifications((notifs) => setNotifications(notifs));
    return () => unsubscribe();
  }, []);

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <Bell size={14} /> Notifications
          </p>
        </div>
      </section>

      <div className="panel" style={{ marginTop: '20px', padding: '24px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={18} style={{ color: 'var(--blue)' }} /> Real-Time Notifications Feed
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.length === 0 ? (
            <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '32px' }}>No active site notifications.</p>
          ) : (
            notifications.map(n => (
              <div key={n.id} style={{ padding: '14px 18px', background: 'var(--panel-soft)', borderRadius: '10px', borderLeft: '4px solid var(--blue)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '14px', color: 'var(--text)' }}>{n.title || n.message}</strong>
                  <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginTop: '2px' }}>{n.timestamp || 'Just now'}</span>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: 'var(--panel)', border: '1px solid var(--border)' }}>
                  {n.type || 'Alert'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
