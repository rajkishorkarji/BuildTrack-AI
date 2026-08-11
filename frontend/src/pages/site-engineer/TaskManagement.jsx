import { useEffect, useState, useMemo } from 'react';
import { CheckSquare, Plus, Search, RefreshCw, AlertTriangle, Users, Clock, CheckCircle2 } from 'lucide-react';
import taskService from '../../services/taskService';
import projectService from '../../services/projectService';
import { realtimeBus } from '../../services/api';

const PRIORITY_META = {
  LOW: { label: 'Low', color: 'var(--green)', bg: 'rgba(34,197,94,0.12)' },
  MEDIUM: { label: 'Medium', color: 'var(--blue)', bg: 'rgba(37,99,235,0.12)' },
  HIGH: { label: 'High', color: 'var(--orange)', bg: 'rgba(245,158,11,0.12)' },
  CRITICAL: { label: 'Critical', color: 'var(--red)', bg: 'rgba(239,68,68,0.12)' },
};

const INPUT = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 };

export default function SETaskManagement() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ projectId: '', title: '', description: '', priority: 'MEDIUM', dueDate: '', assigneeUserId: '' });

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [tList, pList] = await Promise.all([
        taskService.list(),
        projectService.list(),
      ]);
      setTasks(tList || []);
      setProjects(pList || []);
      if (pList.length > 0 && !form.projectId) {
        setForm(f => ({ ...f, projectId: String(pList[0].id) }));
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to load site tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = realtimeBus.subscribe('SERVER_UPDATE', loadData);
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      const q = search.trim().toLowerCase();
      const matchSearch = !q || [t.title, t.projectName, t.assigneeName, t.description].some(v => String(v || '').toLowerCase().includes(q));
      const matchStatus = !statusFilter || String(t.status || '').toUpperCase() === statusFilter.toUpperCase();
      return matchSearch && matchStatus;
    });
  }, [tasks, search, statusFilter]);

  const handleStatusChange = async (taskId, nextStatus) => {
    try {
      await taskService.updateProgress(taskId, { status: nextStatus });
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update status.');
    }
  };

  const create = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.projectId) return;
    setBusy(true);
    setError('');
    try {
      await taskService.create({
        ...form,
        projectId: Number(form.projectId),
        assigneeUserId: form.assigneeUserId ? Number(form.assigneeUserId) : null,
      });
      setShow(false);
      setForm(f => ({ ...f, title: '', description: '', priority: 'MEDIUM', dueDate: '', assigneeUserId: '' }));
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create task');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--blue)', fontWeight: 700 }}>
            <CheckSquare size={14} /> Site Tasks
          </p>
          <h1>Site Task Management</h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="secondary-button" onClick={loadData} disabled={loading}>
            <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} /> Refresh
          </button>
          <button type="button" className="primary-button" onClick={() => setShow(true)}>
            <Plus size={16} /> Create Site Task
          </button>
        </div>
      </section>

      {error && (
        <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, color: 'var(--red)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      {/* Filter Row */}
      <div className="panel" style={{ marginTop: 16, padding: '12px 16px', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-box" style={{ flex: 1, minWidth: 220 }}>
          <Search size={15} />
          <input placeholder="Search tasks, project, assignee..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 }}
        >
          <option value="">All Statuses</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="REVIEW">In Review</option>
          <option value="COMPLETED">Completed</option>
        </select>
        <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
          {filtered.length} task{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Tasks Table */}
      <div className="panel" style={{ marginTop: 14, padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--panel-soft)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                {['Task Title', 'Project', 'Assignee', 'Priority', 'Progress', 'Status', 'Due Date'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Loading site tasks…</td></tr>}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
                    <CheckSquare size={36} style={{ display: 'block', margin: '0 auto 10px', opacity: 0.4 }} />
                    No site tasks assigned yet.
                  </td>
                </tr>
              )}
              {!loading && filtered.map(t => {
                const priorityKey = String(t.priority || 'MEDIUM').toUpperCase();
                const prio = PRIORITY_META[priorityKey] || PRIORITY_META.MEDIUM;
                const statusKey = String(t.status || 'TODO').toUpperCase();

                return (
                  <tr key={t.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <strong style={{ color: 'var(--text)' }}>{t.title}</strong>
                      {t.description && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{t.description}</div>}
                    </td>
                    <td style={{ padding: 14, color: 'var(--blue)', fontWeight: 600 }}>{t.projectName || '—'}</td>
                    <td style={{ padding: 14, color: t.assigneeName ? 'var(--text)' : 'var(--muted)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <Users size={13} /> {t.assigneeName || 'Unassigned'}
                      </span>
                    </td>
                    <td style={{ padding: 14 }}>
                      <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: prio.bg, color: prio.color }}>
                        {prio.label}
                      </span>
                    </td>
                    <td style={{ padding: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 60, height: 6, background: 'var(--panel-soft)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(t.completionPercentage || 0, 100)}%`, height: '100%', background: 'var(--blue)', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700 }}>{t.completionPercentage || 0}%</span>
                      </div>
                    </td>
                    <td style={{ padding: 14 }}>
                      <select
                        value={statusKey}
                        onChange={e => handleStatusChange(t.id, e.target.value)}
                        style={{ fontSize: 12, padding: '4px 8px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', cursor: 'pointer' }}
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="REVIEW">In Review</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </td>
                    <td style={{ padding: 14, color: 'var(--muted)', fontSize: 12 }}>
                      {t.dueDate || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {show && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <form className="panel" onSubmit={create} style={{ width: '100%', maxWidth: 520, padding: 26, display: 'grid', gap: 14, borderRadius: 16 }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>Create Site Task</h2>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Project *</label>
              <select required style={INPUT} value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })}>
                <option value="">Select assigned project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Task Title *</label>
              <input required style={INPUT} placeholder="Task title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Description</label>
              <textarea style={{ ...INPUT, minHeight: 80 }} placeholder="Task description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Priority</label>
                <select style={INPUT} value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Due Date</label>
                <input type="date" style={INPUT} value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
              <button type="button" className="secondary-button" onClick={() => setShow(false)}>Cancel</button>
              <button className="primary-button" disabled={busy}>{busy ? 'Creating...' : 'Create Task'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
