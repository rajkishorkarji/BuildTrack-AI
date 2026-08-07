import { useState } from 'react';
import { AlertTriangle, Plus } from 'lucide-react';

export default function WorkerIssues() {
  const [issues, setIssues] = useState([
    { id: 1, title: 'Scaffolding Plank Loose on Level 3', status: 'Reported' },
  ]);
  const [title, setTitle] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIssues([{ id: Date.now(), title: title.trim(), status: 'Reported' }, ...issues]);
    setTitle('');
  };

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <AlertTriangle size={14} /> Site Issues
          </p>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '16px' }}>Report Hazard</h3>
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input required type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Describe safety concern..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }} />
            <button type="submit" className="primary-button"><Plus size={16} /> Submit Safety Report</button>
          </form>
        </div>

        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '16px' }}>Reported Hazards</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {issues.map(i => (
              <div key={i.id} style={{ padding: '12px', background: 'var(--panel-soft)', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px' }}>{i.title}</span>
                <span style={{ padding: '2px 6px', borderRadius: '6px', background: 'rgba(239,68,68,0.12)', color: 'var(--red)', fontSize: '11px', fontWeight: 700 }}>{i.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
