import { useEffect, useState } from 'react';
import { AlertTriangle, Plus, Search } from 'lucide-react';
import issueService from '../../services/issueService';
import projectService from '../../services/projectService';

export default function SESiteIssues() {
  const [issues, setIssues] = useState([]);
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ projectId: '', title: '', severity: 'HIGH', location: '' });

  const load = async () => {
    const [issueRows, projectRows] = await Promise.all([issueService.list(), projectService.list()]);
    setIssues(issueRows);
    setProjects(projectRows);
    if (!form.projectId && projectRows[0]?.id) setForm((p) => ({ ...p, projectId: projectRows[0].id }));
  };

  useEffect(() => { load().catch(() => {}); }, []);

  const filtered = issues.filter((i) =>
    `${i.title || ''} ${i.location || ''} ${i.projectName || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.projectId || !form.title.trim()) return;
    setBusy(true);
    try {
      const created = await issueService.create({ ...form, title: form.title.trim() });
      setIssues((current) => [created, ...current]);
      setShowAdd(false);
      setForm((p) => ({ ...p, title: '', location: '' }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><AlertTriangle size={14} /> Issues</p>
         
        </div>
        <button type="button" className="primary-button" onClick={() => setShowAdd(true)}><Plus size={16} /> Log Hazard / Issue</button>
      </section>

      <div className="panel" style={{ marginTop: '20px', padding: '16px 20px' }}>
        <div className="search-box" style={{ width: '300px' }}><Search size={14} /><input placeholder="Search issues..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      </div>

      <div className="panel" style={{ marginTop: '16px', padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? <div style={{ padding: '48px', textAlign: 'center', color: 'var(--muted)' }}>No site issues found.</div> : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead><tr style={{ background: 'var(--panel-soft)', color: 'var(--muted)' }}><th style={{ padding: '14px 20px', textAlign: 'left' }}>Issue</th><th style={{ padding: '14px', textAlign: 'left' }}>Project</th><th style={{ padding: '14px', textAlign: 'left' }}>Severity</th><th style={{ padding: '14px', textAlign: 'left' }}>Location</th><th style={{ padding: '14px', textAlign: 'left' }}>Status</th></tr></thead>
            <tbody>{filtered.map((item) => <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}><td style={{ padding: '14px 20px', fontWeight: 700 }}>{item.title}</td><td style={{ padding: '14px' }}>{item.projectName}</td><td style={{ padding: '14px' }}>{item.severity}</td><td style={{ padding: '14px' }}>{item.location || '—'}</td><td style={{ padding: '14px' }}>{item.status}</td></tr>)}</tbody>
          </table>
        )}
      </div>

      {showAdd && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
        <div className="panel" style={{ width: '100%', maxWidth: 480, padding: 28 }}>
          <h2 style={{ marginBottom: 16 }}>Log Site Issue / Hazard</h2>
          <form onSubmit={handleAdd} style={{ display: 'grid', gap: 12 }}>
            <select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} required><option value="">Select project</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
            <input required placeholder="Issue title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option></select>
            <input placeholder="Site location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}><button type="button" className="secondary-button" onClick={() => setShowAdd(false)}>Cancel</button><button disabled={busy} type="submit" className="primary-button">{busy ? 'Saving…' : 'Log Issue'}</button></div>
          </form>
        </div>
      </div>}
    </div>
  );
}
