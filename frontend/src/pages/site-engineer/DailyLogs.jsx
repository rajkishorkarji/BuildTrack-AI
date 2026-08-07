import { useState } from 'react';
import { FileText, Camera, Plus, CheckCircle2, Clock } from 'lucide-react';

export default function DailyLogs() {
  const [logs, setLogs] = useState([
    { id: 1, date: '2026-08-05', title: 'Foundation Level 2 Pouring', activity: 'Completed 240m³ concrete pouring with 2 boom pumps.', weather: 'Sunny 28°C', photos: 4 },
    { id: 2, date: '2026-08-04', title: 'Retaining Wall Rebar Inspection', activity: 'Inspected 16mm rebar spacing. Passed QC audit.', weather: 'Clear 30°C', photos: 6 },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newLog, setNewLog] = useState({ title: '', activity: '', weather: 'Sunny' });

  const handleAddLog = (e) => {
    e.preventDefault();
    if (!newLog.title) return;
    setLogs([{ id: Date.now(), date: new Date().toISOString().slice(0, 10), ...newLog, photos: 2 }, ...logs]);
    setShowModal(false);
    setNewLog({ title: '', activity: '', weather: 'Sunny' });
  };

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow">Daily Site Progress Log</p>
          <h1>Daily Logs</h1>
        </div>
        <button type="button" className="primary-button" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Submit Daily Progress Report
        </button>
      </section>

      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {logs.map(l => (
          <div key={l.id} className="panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <strong style={{ fontSize: '16px', color: 'var(--text)' }}>{l.title}</strong>
              <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>{l.date} • {l.weather}</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 12px 0' }}>{l.activity}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--blue)', fontWeight: 600 }}>
              <Camera size={14} /> {l.photos} Photo Updates Uploaded
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="panel" style={{ width: '100%', maxWidth: '460px', padding: '28px', borderRadius: '16px' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Log Site Activity</h2>
            <form onSubmit={handleAddLog} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--muted)', marginBottom: '4px' }}>Activity Title *</label>
                <input type="text" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }} value={newLog.title} onChange={e => setNewLog({ ...newLog, title: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--muted)', marginBottom: '4px' }}>Work Notes & Summary</label>
                <textarea rows={3} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }} value={newLog.activity} onChange={e => setNewLog({ ...newLog, activity: e.target.value })} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="secondary-button" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="primary-button">Submit Log</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
