import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { AlertTriangle, Plus, Search, CheckCircle2 } from 'lucide-react';

export default function SESiteIssues() {
  const { issues = [], addIssue } = useData();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', severity: 'High', location: 'Column C4 Zone' });

  const filtered = issues.filter(i => (i.title || '').toLowerCase().includes(search.toLowerCase()));

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.title) return;
    if (addIssue) {
      addIssue({
        title: form.title,
        severity: form.severity,
        location: form.location,
        status: 'Open',
      });
    }
    setShowAdd(false);
    setForm({ title: '', severity: 'High', location: 'Column C4 Zone' });
  };

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <AlertTriangle size={14} /> Issues
          </p>
        </div>
        <button type="button" className="primary-button" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Log Hazard / Issue
        </button>
      </section>

      <div className="panel" style={{ marginTop: '20px', padding: '16px 20px' }}>
        <div className="search-box" style={{ width: '300px' }}>
          <Search size={14} style={{ color: 'var(--muted)' }} />
          <input placeholder="Search safety issues..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="panel" style={{ marginTop: '16px', padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--panel-soft)', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Hazard / Issue Title</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Severity Level</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Site Location</th>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {(filtered.length > 0 ? filtered : [
              { id: 'i1', title: 'Rebar Spacing Gap Non-Compliance', severity: 'High', location: 'Column C4 Zone', status: 'Open' },
            ]).map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={16} style={{ color: 'var(--red)' }} />
                    {item.title}
                  </div>
                </td>
                <td style={{ padding: '14px' }}>
                  <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: 'rgba(239,68,68,0.12)', color: 'var(--red)' }}>
                    {item.severity || 'High'}
                  </span>
                </td>
                <td style={{ padding: '14px', color: 'var(--muted)' }}>{item.location}</td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '10px', background: 'rgba(245,154,22,0.12)', color: 'var(--orange)', fontSize: '11px', fontWeight: 700 }}>
                    {item.status || 'Open'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="panel" style={{ width: '100%', maxWidth: '440px', padding: '28px', borderRadius: '16px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Log Site Issue / Hazard</h2>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div>
                <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Issue Description *</label>
                <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button type="button" className="secondary-button" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="primary-button">Log Issue</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
