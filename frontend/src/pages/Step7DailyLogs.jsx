import { useEffect, useState, useMemo } from 'react';
import { FileText, Plus, CheckCircle2, XCircle, Activity, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { dailyLogService } from '../services/dailyLogService';
import taskService from '../services/taskService';
import projectService from '../services/projectService';
import { realtimeBus } from '../services/api';

const INPUT = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13, boxSizing: 'border-box' };

export default function Step7DailyLogs() {
  const { user } = useAuth();
  const { projects = [], tasks = [], refresh } = useData();
  const [logs, setLogs] = useState([]);
  const [projectId, setProjectId] = useState('');
  const [taskId, setTaskId] = useState('');
  const [projectTasks, setProjectTasks] = useState([]);
  const [form, setForm] = useState({
    logDate: new Date().toISOString().slice(0, 10),
    workSummary: '',
    blockers: '',
    safetyNotes: '',
    weather: '',
    taskProgressPercentage: '',
    overallProjectProgress: '',
  });
  const [notice, setNotice] = useState('');
  const [errorNotice, setErrorNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      setLogs(await dailyLogService.list(projectId || undefined));
    } catch (e) {
      console.error(e);
    }
  };

  const loadTasks = async (pId) => {
    if (!pId) { setProjectTasks([]); return; }
    try {
      const fetched = await taskService.listByProject(pId);
      setProjectTasks(fetched || []);
    } catch (e) {
      setProjectTasks([]);
    }
  };

  useEffect(() => {
    load();
    if (projectId) loadTasks(projectId);
    const unsub = realtimeBus.subscribe('SERVER_UPDATE', () => {
      load();
      if (projectId) loadTasks(projectId);
    });
    return () => unsub();
  }, [projectId]);

  useEffect(() => {
    if (!projectId && projects.length > 0) {
      setProjectId(String(projects[0].id));
      if (projects[0].progressPercentage != null) {
        setForm(f => ({ ...f, overallProjectProgress: String(projects[0].progressPercentage) }));
      }
    }
  }, [projects, projectId]);

  const activeTasks = useMemo(() => {
    if (!projectId) return [];
    if (projectTasks.length > 0) return projectTasks;
    return tasks.filter(t => {
      const pIdMatches = String(t.projectId || t.project?.id || t.project || '') === String(projectId);
      const selectedProjName = projects.find(p => String(p.id) === String(projectId))?.name;
      const pNameMatches = selectedProjName && String(t.projectName || '') === String(selectedProjName);
      return pIdMatches || pNameMatches;
    });
  }, [projectId, projectTasks, tasks, projects]);

  // Dynamically calculate overall project completion % based on updated task progress
  const computedProjectProgress = useMemo(() => {
    if (!projectId || activeTasks.length === 0) return null;
    const taskProg = form.taskProgressPercentage !== '' ? Number(form.taskProgressPercentage) : null;
    if (taskProg == null || isNaN(taskProg)) return null;

    let total = 0;
    activeTasks.forEach(t => {
      if (String(t.id) === String(taskId)) {
        total += Math.min(Math.max(taskProg, 0), 100);
      } else {
        total += Number(t.completionPercentage ?? t.progress ?? 0);
      }
    });
    return Math.round(total / activeTasks.length);
  }, [projectId, taskId, form.taskProgressPercentage, activeTasks]);

  const submit = async e => {
    e.preventDefault();
    setErrorNotice('');
    setNotice('');
    if (!projectId) return;

    // Validation: If user entered task progress percentage, a task must be selected!
    if (form.taskProgressPercentage !== '' && !taskId) {
      setErrorNotice('Select an assigned task before reporting task progress.');
      return;
    }

    setSubmitting(true);
    try {
      const selectedTask = activeTasks.find(t => String(t.id) === String(taskId));
      const summaryPrefix = selectedTask ? `[Task: ${selectedTask.title}] ` : '';
      const taskProgNum = taskId && form.taskProgressPercentage !== '' ? Number(form.taskProgressPercentage) : null;
      const finalProjectProg = computedProjectProgress ?? (form.overallProjectProgress === '' ? null : Number(form.overallProjectProgress));

      const payload = {
        logDate: form.logDate,
        workSummary: summaryPrefix + form.workSummary.trim(),
        blockers: form.blockers,
        safetyNotes: form.safetyNotes,
        weather: form.weather,
        projectId: Number(projectId),
        taskId: taskId ? Number(taskId) : null,
        progressPercentage: taskProgNum,
      };

      const newLog = await dailyLogService.create(payload);
      setLogs(p => [newLog, ...p]);

      // 1. Update task progress & status in real time for Project Manager Tasks page
      if (taskId && taskProgNum != null && !isNaN(taskProgNum)) {
        try {
          const nextStatus = taskProgNum >= 100 ? 'COMPLETED' : taskProgNum > 0 ? 'IN_PROGRESS' : 'TODO';
          await taskService.updateProgress(Number(taskId), { progress: taskProgNum, completionPercentage: taskProgNum, status: nextStatus });
        } catch (taskErr) {
          console.error('Failed to update task progress:', taskErr);
        }
      }

      // 2. Automatically calculate and update project progress across system
      if (projectId && finalProjectProg != null && !isNaN(finalProjectProg)) {
        try {
          await projectService.updateProgress(Number(projectId), finalProjectProg);
        } catch (projErr) {
          console.error('Failed to update project progress:', projErr);
        }
      }

      // Broadcast real-time update to all subscribers (PM Tasks Table & Dashboards)
      realtimeBus.publish('SERVER_UPDATE', { type: 'PROGRESS_UPDATE', projectId, taskId, taskProgNum, finalProjectProg });
      if (realtimeBus.emit) realtimeBus.emit('SERVER_UPDATE');

      setForm({ ...form, workSummary: '', blockers: '', safetyNotes: '', taskProgressPercentage: '' });
      setTaskId('');
      setNotice('Daily log submitted successfully! Real-time task progress & project completion synchronized.');
      setTimeout(() => setNotice(''), 4000);
      if (refresh) refresh();
    } catch (err) {
      setErrorNotice(err?.response?.data?.message || 'Unable to submit log.');
    } finally {
      setSubmitting(false);
    }
  };

  const review = async (id, ok) => {
    try {
      const x = ok ? await dailyLogService.approve(id) : await dailyLogService.reject(id);
      setLogs(p => p.map(l => l.id === id ? x : l));
      realtimeBus.publish('SERVER_UPDATE', { type: 'LOG_REVIEW', id, ok });
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
          
        </div>
      </section>

      {notice && (
        <div className="panel" style={{ marginTop: 16, padding: '12px 16px', color: 'var(--green)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={16} /> {notice}
        </div>
      )}
      {errorNotice && (
        <div className="panel" style={{ marginTop: 16, padding: '12px 16px', color: 'var(--red)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <AlertTriangle size={16} /> {errorNotice}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 440px) 1fr', gap: 18, marginTop: 18 }}>
        {/* Submit Form */}
        <div className="panel" style={{ padding: 22 }}>
          <h3 style={{ margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
            <Plus size={16} style={{ color: 'var(--blue)' }} /> Submit Daily Log
          </h3>
          <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Active Project Site *</label>
              <select required style={INPUT} value={projectId} onChange={e => {
                const pId = e.target.value;
                setProjectId(pId);
                setTaskId('');
                const selP = projects.find(p => String(p.id) === String(pId));
                if (selP && selP.progressPercentage != null) {
                  setForm(f => ({ ...f, overallProjectProgress: String(selP.progressPercentage) }));
                }
              }}>
                <option value="">Select active project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name} ({p.progressPercentage || 0}% overall)</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Select Assigned Task (Required to report task progress)</label>
              <select style={{ ...INPUT, borderColor: form.taskProgressPercentage !== '' && !taskId ? 'var(--red)' : 'var(--border)' }} value={taskId} onChange={e => {
                const tId = e.target.value;
                setTaskId(tId);
                setErrorNotice('');
                const selT = activeTasks.find(t => String(t.id) === String(tId));
                if (selT && (selT.completionPercentage != null || selT.progress != null)) {
                  const currentProg = selT.completionPercentage ?? selT.progress ?? 0;
                  setForm(f => ({ ...f, taskProgressPercentage: String(currentProg) }));
                }
              }}>
                <option value="">General Site Work (No Task Selected)</option>
                {activeTasks.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.status || 'Active'}) — {t.completionPercentage ?? t.progress ?? 0}% done
                  </option>
                ))}
              </select>
              {activeTasks.length === 0 && projectId && (
                <span style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginTop: 4 }}>
                  No active tasks found for this project site.
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
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Task Progress % (PM Table)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  style={{ ...INPUT, borderColor: form.taskProgressPercentage !== '' && !taskId ? 'var(--red)' : 'var(--border)' }}
                  placeholder={taskId ? "e.g. 75" : "Select task above"}
                  value={form.taskProgressPercentage}
                  onChange={e => {
                    setForm({ ...form, taskProgressPercentage: e.target.value });
                    setErrorNotice('');
                    if (e.target.value !== '' && !taskId && activeTasks.length > 0) {
                      setTaskId(String(activeTasks[0].id));
                    }
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Project Progress %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  style={INPUT}
                  placeholder="Calculated automatically"
                  value={computedProjectProgress != null ? computedProjectProgress : form.overallProjectProgress}
                  onChange={e => setForm({ ...form, overallProjectProgress: e.target.value })}
                />
              </div>
            </div>

            {/* Real-time Calculation Indicator */}
            {computedProjectProgress != null && (
              <div style={{ padding: '8px 12px', background: 'rgba(37,99,235,0.08)', borderRadius: 8, border: '1px solid rgba(37,99,235,0.18)', fontSize: 12, color: 'var(--blue)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp size={14} style={{ flexShrink: 0 }} />
                <span>Updating task progress to <strong>{form.taskProgressPercentage}%</strong> will automatically adjust overall project completion to <strong>{computedProjectProgress}%</strong> across site tasks.</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Weather</label>
                <input style={INPUT} placeholder="Sunny / Rain" value={form.weather} onChange={e => setForm({ ...form, weather: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Blockers / Delays</label>
                <input style={INPUT} placeholder="Material or equipment delays" value={form.blockers} onChange={e => setForm({ ...form, blockers: e.target.value })} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Safety Notes</label>
              <textarea rows={2} style={INPUT} placeholder="Safety audits or PPE compliance notes" value={form.safetyNotes} onChange={e => setForm({ ...form, safetyNotes: e.target.value })} />
            </div>

            <button className="primary-button" disabled={!projectId || submitting} style={{ marginTop: 6 }}>
              {submitting ? 'Submitting Log...' : 'Submit Daily Log & Sync Progress'}
            </button>
          </form>
        </div>

        {/* Logs Feed */}
        <div className="panel" style={{ padding: 22 }}>
          <h3 style={{ margin: '0 0 16px', fontWeight: 700 }}>Submitted Site Daily Logs</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            {logs.map(l => (
              <div key={l.id} style={{ padding: 16, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--panel-soft)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <div>
                    <strong style={{ fontSize: 14 }}>{l.projectName}</strong>
                    {l.taskTitle && <div style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 600, marginTop: 2 }}>Task: {l.taskTitle}</div>}
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
                    Progress Reported: <strong style={{ color: 'var(--blue)' }}>{l.progressPercentage}%</strong>
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
