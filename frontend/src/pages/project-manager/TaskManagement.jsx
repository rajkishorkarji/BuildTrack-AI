import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { CheckSquare, Plus, Search, Clock, AlertTriangle } from 'lucide-react';

export default function PMTaskManagement() {
  const { tasks = [], addTask } = useData();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', project: 'Metro Tower Site A', priority: 'High', assignedSE: 'Amit Kumar (Site Engineer)' });

  const filtered = tasks.filter(t => (t.title || '').toLowerCase().includes(search.toLowerCase()));

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.title) return;
    if (addTask) {
      addTask({
        title: form.title,
        project: form.project,
        priority: form.priority,
        assignedSE: form.assignedSE,
        status: 'In Progress',
        progress: 0,
      });
    }
    setShowAdd(false);
    setForm({ title: '', project: 'Metro Tower Site A', priority: 'High', assignedSE: 'Amit Kumar (Site Engineer)' });
  };

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <CheckSquare size={14} /> Tasks
          </p>
        </div>
        <button type="button" className="primary-button" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Assign Site Task
        </button>
      </section>

      <div className="panel" style={{ marginTop: '20px', padding: '16px 20px' }}>
        <div className="search-box" style={{ width: '300px' }}>
          <Search size={14} style={{ color: 'var(--muted)' }} />
          <input placeholder="Search tasks by title..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="panel" style={{ marginTop: '16px', padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--panel-soft)', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Task Description</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Assigned Site Engineer</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Priority</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Progress</th>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {(filtered.length > 0 ? filtered : tasks).map(t => (
              <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckSquare size={16} style={{ color: 'var(--blue)' }} />
                    {t.title}
                  </div>
                </td>
                <td style={{ padding: '14px', color: 'var(--blue)', fontWeight: 600 }}>{t.assignedSE || 'Amit Kumar (Site Engineer)'}</td>
                <td style={{ padding: '14px' }}>
                  <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: 'rgba(239,68,68,0.12)', color: 'var(--red)' }}>
                    {t.priority || 'High'}
                  </span>
                </td>
                <td style={{ padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '120px' }}>
                    <div style={{ flex: 1, height: '6px', background: 'var(--panel-soft)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${t.progress || 50}%`, height: '100%', background: 'var(--blue)' }} />
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--blue)', fontSize: '12px' }}>{t.progress || 50}%</span>
                  </div>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '10px', background: 'rgba(37,99,235,0.12)', color: 'var(--blue)', fontSize: '11px', fontWeight: 700 }}>
                    {t.status || 'In Progress'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="panel" style={{ width: '100%', maxWidth: '460px', padding: '28px', borderRadius: '16px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Assign Site Task</h2>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div>
                <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Task Title *</label>
                <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)' }} />
              </div>
              <div>
                <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Assign Site Engineer</label>
                <input type="text" value={form.assignedSE} onChange={e => setForm({ ...form, assignedSE: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button type="button" className="secondary-button" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="primary-button">Assign Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
