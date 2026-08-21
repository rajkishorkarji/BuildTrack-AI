import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { ShieldAlert, Plus, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

export default function SEIssues() {
  const { issues } = useData();
  const [issueList, setIssueList] = useState(issues);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', location: 'Sector 3', severity: 'High' });

  const handleReport = (e) => {
    e.preventDefault();
    if (!form.title) return;
    setIssueList([{ id: Date.now(), title: form.title, location: form.location, severity: form.severity, status: 'Open' }, ...issueList]);
    setShowModal(false);
    setForm({ title: '', location: 'Sector 3', severity: 'High' });
  };

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow">Site Safety & Defect Tracking</p>
          
        </div>
        <button type="button" className="primary-button" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Report Hazard / Defect
        </button>
      </section>

      <div className="panel" style={{ marginTop: '20px', padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--panel-soft)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Issue Title</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Location</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Severity</th>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Resolution Status</th>
            </tr>
          </thead>
          <tbody>
            {issueList.map(i => (
              <tr key={i.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text)' }}>{i.title}</td>
                <td style={{ padding: '14px', color: 'var(--muted)' }}>{i.location || 'Sector B'}</td>
                <td style={{ padding: '14px' }}>
                  <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: 'rgba(239,68,68,0.12)', color: 'var(--red)' }}>
                    {i.severity || 'High'}
                  </span>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{ padding: '3px 10px', borderRadius: '10px', background: i.status === 'Resolved' ? 'rgba(34,197,94,0.12)' : 'rgba(245,154,22,0.12)', color: i.status === 'Resolved' ? 'var(--green)' : 'var(--orange)', fontSize: '11px', fontWeight: 600 }}>
                    {i.status || 'Open'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="panel" style={{ width: '100%', maxWidth: '440px', padding: '28px', borderRadius: '16px' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Report Site Hazard</h2>
            <form onSubmit={handleReport} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--muted)', marginBottom: '4px' }}>Issue Description *</label>
                <input type="text" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="secondary-button" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="primary-button">Log Hazard</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
