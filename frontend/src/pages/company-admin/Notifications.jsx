import { useState } from 'react';
import { Bell, CheckCircle2, AlertTriangle, DollarSign, Clock, Wrench, ShieldAlert } from 'lucide-react';

export default function Notifications() {
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'Task Alerts', title: 'Foundation Concrete Pouring Completed', time: '10 mins ago', read: false, icon: CheckCircle2, color: 'var(--green)' },
    { id: 2, type: 'Payment Reminders', title: 'Subcontractor Invoice #INV-4921 due in 3 days', time: '1 hour ago', read: false, icon: DollarSign, color: 'var(--orange)' },
    { id: 3, type: 'Deadline Alerts', title: 'Milestone 2 - Structural Framing Deadline Tomorrow', time: '3 hours ago', read: true, icon: Clock, color: 'var(--blue)' },
    { id: 4, type: 'Maintenance Notifications', title: 'Tower Crane #4 Scheduled for Maintenance Inspection', time: 'Yesterday', read: true, icon: Wrench, color: 'var(--purple)' },
    { id: 5, type: 'System Announcements', title: 'Platform v2.4 Security Patch Deployed', time: '2 days ago', read: true, icon: ShieldAlert, color: 'var(--muted)' },
  ]);

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <Bell size={14} /> Notifications
          </p>
        </div>
        <button type="button" className="secondary-button" onClick={markAllRead}>
          Mark All as Read
        </button>
      </section>

      <div className="panel" style={{ marginTop: '20px', padding: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {notifications.map(n => {
            const Icon = n.icon;
            return (
              <div key={n.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: n.read ? 'var(--panel-soft)' : 'rgba(26, 115, 232, 0.08)', borderRadius: '12px', border: n.read ? '1px solid var(--border)' : '1px solid var(--blue)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--panel)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={20} style={{ color: n.color }} />
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: n.color, textTransform: 'uppercase' }}>{n.type}</span>
                    <strong style={{ display: 'block', fontSize: '14px', color: 'var(--text)', margin: '2px 0' }}>{n.title}</strong>
                    <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{n.time}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
