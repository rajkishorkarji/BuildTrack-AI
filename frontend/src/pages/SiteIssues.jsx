import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, Plus, Search, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function SiteIssues() {
  const { issues, addIssue } = useData();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newIssue, setNewIssue] = useState({
    title: '',
    severity: 'Medium',
    location: 'Floor 14 Tower A',
  });

  const handleReportIssue = (e) => {
    e.preventDefault();
    if (!newIssue.title.trim()) return;

    addIssue({
      title: newIssue.title.trim(),
      severity: newIssue.severity,
      location: newIssue.location,
      reportedBy: user?.fullName || 'Site Engineer',
    });

    setShowAddModal(false);
    setNewIssue({ title: '', severity: 'Medium', location: 'Floor 14 Tower A' });
  };

  const filtered = issues.filter((i) => (i.title || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow">Quality & Safety Compliance</p>
          <h1>Site Safety & Hazards ({issues.length})</h1>
        </div>

        <button type="button" className="primary-button" style={{ background: 'var(--red)' }} onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Report Safety Hazard
        </button>
      </section>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
        <div className="search-box" style={{ width: '320px' }}>
          <Search size={16} style={{ color: 'var(--muted)' }} />
          <input placeholder="Search hazard title..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="panel" style={{ marginTop: '20px', padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
            <ShieldCheck size={36} style={{ marginBottom: '12px', color: 'var(--green)' }} />
            <h3 style={{ fontSize: '16px', color: 'var(--text)', margin: '0 0 6px 0' }}>Zero Open Hazards Reported</h3>
            <p style={{ fontSize: '13px', margin: 0 }}>Site safety compliance is optimal across active locations.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--panel-soft)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                <th style={{ padding: '14px 20px' }}>Hazard Ticket</th>
                <th style={{ padding: '14px' }}>Severity</th>
                <th style={{ padding: '14px' }}>Reported By</th>
                <th style={{ padding: '14px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text)' }}>{item.title}</td>
                  <td style={{ padding: '16px' }}>
                    <span className="schedule-pill" style={{ color: 'var(--red)', background: 'rgba(239, 68, 68, 0.15)' }}>
                      {item.severity}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>{item.reportedBy}</td>
                  <td style={{ padding: '16px' }}>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="panel" style={{ width: '100%', maxWidth: '480px', padding: '28px', borderRadius: '16px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--text)' }}>Report Site Hazard Ticket</h2>
            <form onSubmit={handleReportIssue} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div>
                <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Hazard Summary *</label>
                <input
                  type="text"
                  placeholder="e.g. Scaffolding handrail loose on Floor 14"
                  value={newIssue.title}
                  onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
                />
              </div>

              <div>
                <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Severity Level</label>
                <select
                  value={newIssue.severity}
                  onChange={(e) => setNewIssue({ ...newIssue, severity: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High (Immediate Action Required)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="secondary-button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button" style={{ background: 'var(--red)' }}>
                  Submit Hazard Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
