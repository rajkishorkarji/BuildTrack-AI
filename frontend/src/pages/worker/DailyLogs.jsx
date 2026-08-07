import { useState } from 'react';
import { FileText, Plus } from 'lucide-react';

export default function WorkerDailyLogs() {
  const [logs, setLogs] = useState([
    { id: 1, text: 'Completed 12m steel rebar tying on Beam B2.', date: '06 Aug 2026' },
  ]);
  const [newLog, setNewLog] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newLog.trim()) return;
    setLogs([{ id: Date.now(), text: newLog.trim(), date: 'Today' }, ...logs]);
    setNewLog('');
  };

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <FileText size={14} /> Daily Logs
          </p>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '16px' }}>Submit Work Log</h3>
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <textarea required rows={3} value={newLog} onChange={e => setNewLog(e.target.value)} placeholder="Describe work completed today..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }} />
            <button type="submit" className="primary-button"><Plus size={16} /> Submit Log</button>
          </form>
        </div>

        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '16px' }}>Log Stream</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {logs.map(l => (
              <div key={l.id} style={{ padding: '12px', background: 'var(--panel-soft)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px' }}>{l.text}</p>
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{l.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
