import { useEffect, useState } from 'react';
import { Bell, Megaphone, CheckCheck } from 'lucide-react';
import notificationService from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [form, setForm] = useState({ title: '', message: '', type: 'INFO', targetRole: 'PROJECT_MANAGER' });
  const [notice, setNotice] = useState('');

  useEffect(() => notificationService.subscribeToNotifications(setNotifications), []);

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
        <div><p className="eyebrow"><Bell size={14} /> Notifications</p></div>
        <button type="button" className="secondary-button" onClick={() => notificationService.markAllAsRead()}><CheckCheck size={15} /> Mark All Read</button>
      </section>

      {notice && <div className="panel" style={{ marginTop: 14, color: 'var(--green)' }}>{notice}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(300px, .8fr)', gap: 18, marginTop: 18 }}>
        <div className="panel" style={{ padding: 20 }}>
          <h3 style={{ marginTop: 0 }}>Recent events</h3>
          {notifications.length === 0 ? <p style={{ color: 'var(--muted)' }}>No notifications yet.</p> : notifications.map(n => (
            <div key={n.id} style={{ padding: 12, borderBottom: '1px solid var(--border)' }}>
              <strong>{n.title}</strong><div style={{ color: 'var(--muted)', fontSize: 13 }}>{n.message}</div>
              <small style={{ color: 'var(--muted)' }}>{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</small>
            </div>
          ))}
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
