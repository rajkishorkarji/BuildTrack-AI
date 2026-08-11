import { useEffect, useState, useMemo } from 'react';
import { FileText, Plus, CheckCircle2, XCircle, CheckSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { dailyLogService } from '../services/dailyLogService';

const INPUT = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 };

export default function Step7DailyLogs() {
  const { user } = useAuth();
  const { projects = [], tasks = [] } = useData();
  const [logs, setLogs] = useState([]);
  const [projectId, setProjectId] = useState('');
  const [taskId, setTaskId] = useState('');
  const [form, setForm] = useState({
    logDate: new Date().toISOString().slice(0, 10),
    workSummary: '',
    blockers: '',
    safetyNotes: '',
    weather: '',
    progressPercentage: '',
  });
  const [notice, setNotice] = useState('');

  const load = async () => {
    try {
      setLogs(await dailyLogService.list(projectId || undefined));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { load(); }, [projectId]);

  useEffect(() => {
    if (!projectId && projects.length > 0) {
      setProjectId(String(projects[0].id));
    }
  }, [projects, projectId]);

  const activeTasks = useMemo(() => {
    if (!projectId) return [];
    return tasks.filter(t => {
      const pIdMatches = String(t.projectId || t.project?.id || t.project || '') === String(projectId);
      const selectedProjName = projects.find(p => String(p.id) === String(projectId))?.name;
      const pNameMatches = selectedProjName && String(t.projectName || '') === String(selectedProjName);
      return pIdMatches || pNameMatches;
    });
  }, [projectId, tasks, projects]);

  const submit = async e => {
    e.preventDefault();
    if (!projectId) return;
    try {
      const selectedTask = activeTasks.find(t => String(t.id) === String(taskId));
      const summaryPrefix = selectedTask ? `[Task: ${selectedTask.title}] ` : '';
      const payload = {
        ...form,
        projectId: Number(projectId),
        workSummary: summaryPrefix + form.workSummary,
        progressPercentage: form.progressPercentage === '' ? null : Number(form.progressPercentage),
      };
      const x = await dailyLogService.create(payload);
      setLogs(p => [x, ...p]);
      setForm({ ...form, workSummary: '', blockers: '', safetyNotes: '', progressPercentage: '' });
      setTaskId('');
      setNotice('Daily log submitted successfully.');
      setTimeout(() => setNotice(''), 4000);
    } catch (err) {
      setNotice(err?.response?.data?.message || 'Unable to submit log.');
    }
  };

  const review = async (id, ok) => {
    try {
      const x = ok ? await dailyLogService.approve(id) : await dailyLogService.reject(id);
      setLogs(p => p.map(l => l.id === id ? x : l));
    } catch (err) {
      alert(err?.response?.data?.message || 'Review failed');
    }
  };

  const canReview = ['SUPER_ADMIN', 'COMPANY_ADMIN', 'PROJECT_MANAGER'].includes(user?.role);

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--blue)', fontWeight: 700 }}>
            <FileText size={14} /> Daily Logs
          </p>
          <h1>Site Daily Logs</h1>
        </div>
      </section>

      {notice && (
        <div className="panel" style={{ marginTop: 16, padding: '12px 16px', color: notice.includes('successfully') ? 'var(--green)' : 'var(--red)', fontSize: 13 }}>
          {notice}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 420px) 1fr', gap: 18, marginTop: 18 }}>
        {/* Submit Form */}
        <div className="panel" style={{ padding: 22 }}>
          <h3 style={{ margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={16} style={{ color: 'var(--blue)' }} /> Submit Daily Log
          </h3>
          <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Active Project *</label>
              <select required style={INPUT} value={projectId} onChange={e => { setProjectId(e.target.value); setTaskId(''); }}>
                <option value="">Select active project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Assigned Task (Optional)</label>
              <select style={INPUT} value={taskId} onChange={e => setTaskId(e.target.value)}>
                <option value="">No specific task / General site work</option>
                {activeTasks.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.status || 'Active'})
                  </option>
                ))}
              </select>
              {activeTasks.length === 0 && projectId && (
                <span style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginTop: 4 }}>
                  No active tasks found for this project.
                </span>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Log Date *</label>
              <input type="date" required style={INPUT} value={form.logDate} onChange={e => setForm({ ...form, logDate: e.target.value })} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Work Summary *</label>
              <textarea required rows={4} style={INPUT} placeholder="Describe work completed today on site" value={form.workSummary} onChange={e => setForm({ ...form, workSummary: e.target.value })} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Progress %</label>
                <input type="number" min="0" max="100" style={INPUT} placeholder="e.g. 75" value={form.progressPercentage} onChange={e => setForm({ ...form, progressPercentage: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Weather</label>
                <input style={INPUT} placeholder="Sunny / Rain" value={form.weather} onChange={e => setForm({ ...form, weather: e.target.value })} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Blockers / Delays</label>
              <textarea rows={2} style={INPUT} placeholder="Any material shortages or equipment delays" value={form.blockers} onChange={e => setForm({ ...form, blockers: e.target.value })} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Safety Notes</label>
              <textarea rows={2} style={INPUT} placeholder="Safety audits or PPE compliance notes" value={form.safetyNotes} onChange={e => setForm({ ...form, safetyNotes: e.target.value })} />
            </div>

            <button className="primary-button" disabled={!projectId} style={{ marginTop: 6 }}>
              Submit Daily Log
            </button>
          </form>
        </div>

        {/* Logs Feed */}
        <div className="panel" style={{ padding: 22 }}>
          <h3 style={{ margin: '0 0 16px' }}>Submitted Site Daily Logs</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            {logs.map(l => (
              <div key={l.id} style={{ padding: 16, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--panel-soft)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <div>
                    <strong style={{ fontSize: 14 }}>{l.projectName}</strong>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{l.logDate} · Reported by {l.createdBy}</div>
                  </div>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: 8,
                    fontSize: 11,
                    fontWeight: 700,
                    background: l.status === 'APPROVED' ? 'rgba(34,197,94,0.12)' : l.status === 'REJECTED' ? 'rgba(239,68,68,0.12)' : 'rgba(37,99,235,0.12)',
                    color: l.status === 'APPROVED' ? 'var(--green)' : l.status === 'REJECTED' ? 'var(--red)' : 'var(--blue)',
                  }}>
                    {l.status}
                  </span>
                </div>
                <p style={{ fontSize: 13, marginTop: 10, lineHeight: 1.5, color: 'var(--text)' }}>{l.workSummary}</p>
                {l.progressPercentage != null && (
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
                    Progress Reported: <strong style={{ color: 'var(--text)' }}>{l.progressPercentage}%</strong>
                  </div>
                )}
                {canReview && l.status === 'SUBMITTED' && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button className="secondary-button" style={{ fontSize: 12, color: 'var(--green)' }} onClick={() => review(l.id, true)}>
                      <CheckCircle2 size={13} /> Approve
                    </button>
                    <button className="secondary-button" style={{ fontSize: 12, color: 'var(--red)' }} onClick={() => review(l.id, false)}>
                      <XCircle size={13} /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
            {logs.length === 0 && (
              <p style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: '30px 0' }}>
                No site daily logs submitted yet for this project.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
