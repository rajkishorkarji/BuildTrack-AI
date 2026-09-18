import { useEffect, useState, useMemo } from 'react';
import { CheckSquare, Plus, Search, RefreshCw, AlertTriangle, Users, Calendar, Clock, CheckCircle2, X, ShieldCheck, MapPin, FileText, XCircle } from 'lucide-react';
import taskService from '../../services/taskService';
import projectService from '../../services/projectService';
import { dailyLogService } from '../../services/dailyLogService';
import api, { realtimeBus } from '../../services/api';
import { getCurrentGpsCoordinates } from '../../utils/geo';

const PRIORITY_META = {
  LOW: { label: 'Low', color: 'var(--green)', bg: 'rgba(34,197,94,0.12)' },
  MEDIUM: { label: 'Medium', color: 'var(--blue)', bg: 'rgba(37,99,235,0.12)' },
  HIGH: { label: 'High', color: 'var(--orange)', bg: 'rgba(245,158,11,0.12)' },
  CRITICAL: { label: 'Critical', color: 'var(--red)', bg: 'rgba(239,68,68,0.12)' },
};

const STATUS_META = {
  TODO: { label: 'To Do', color: 'var(--muted)', bg: 'var(--panel-soft)' },
  IN_PROGRESS: { label: 'In Progress', color: 'var(--blue)', bg: 'rgba(37,99,235,0.12)' },
  REVIEW: { label: 'In Review', color: 'var(--orange)', bg: 'rgba(245,158,11,0.12)' },
  COMPLETED: { label: 'Completed', color: 'var(--green)', bg: 'rgba(34,197,94,0.12)' },
};

const emptyForm = {
  projectId: '',
  title: '',
  description: '',
  priority: 'MEDIUM',
  dueDate: '',
  assigneeUserId: '',
  milestoneId: '',
};

export default function PMTaskManagement() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);

  const [dailyLogs, setDailyLogs] = useState([]);
  const [reviewModalLog, setReviewModalLog] = useState(null);
  const [reviewDrawerOpen, setReviewDrawerOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [tList, pList, logList] = await Promise.all([
        taskService.list(),
        projectService.list(),
        dailyLogService.list().catch(() => []),
      ]);
      setTasks(tList || []);
      setProjects(pList || []);
      setDailyLogs(logList || []);
      if (pList.length > 0 && !form.projectId) {
        setForm(f => ({ ...f, projectId: String(pList[0].id) }));
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = realtimeBus.subscribe('SERVER_UPDATE', loadData);
    return () => unsub();
  }, []);

  // When selected project in creation modal changes, fetch assigned members for that project
  useEffect(() => {
    if (!form.projectId) {
      setProjectMembers([]);
      return;
    }
    projectService.assignments(form.projectId)
      .then(members => setProjectMembers(members || []))
      .catch(() => setProjectMembers([]));
  }, [form.projectId]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const q = search.trim().toLowerCase();
      const matchSearch = !q || [t.title, t.projectName, t.assigneeName, t.description].some(v => String(v || '').toLowerCase().includes(q));
      const matchStatus = !statusFilter || String(t.status || '').toUpperCase() === statusFilter.toUpperCase();
      return matchSearch && matchStatus;
    });
  }, [tasks, search, statusFilter]);

  const [milestones, setMilestones] = useState([]);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({ projectId: '', title: '', description: '', dueDate: '' });
  const [milestoneBusy, setMilestoneBusy] = useState(false);

  // Fetch milestones for the selected project in create-task modal
  const [projectMilestones, setProjectMilestones] = useState([]);
  useEffect(() => {
    if (!form.projectId) { setProjectMilestones([]); return; }
    api.get(`/milestones?projectId=${form.projectId}`)
      .then(res => setProjectMilestones(res.data?.data || []))
      .catch(() => setProjectMilestones([]));
  }, [form.projectId]);

  // Load all milestones visible to PM
  const loadMilestones = () => {
    api.get('/milestones')
      .then(res => setMilestones(res.data?.data || []))
      .catch(() => setMilestones([]));
  };

  useEffect(() => { loadMilestones(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.projectId) return;
    setBusy(true);
    setError('');
    try {
      const payload = {
        projectId: Number(form.projectId),
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        dueDate: form.dueDate || null,
        assigneeUserId: form.assigneeUserId ? Number(form.assigneeUserId) : null,
        milestoneId: form.milestoneId ? Number(form.milestoneId) : null,
      };
      await taskService.create(payload);
      setShowModal(false);
      setForm(f => ({ ...emptyForm, projectId: f.projectId }));
      await loadData();
      loadMilestones();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create task.');
    } finally {
      setBusy(false);
    }
  };

  const handleCreateMilestone = async (e) => {
    e.preventDefault();
    if (!milestoneForm.title.trim() || !milestoneForm.projectId) return;
    setMilestoneBusy(true);
    try {
      await api.post('/milestones', {
        projectId: Number(milestoneForm.projectId),
        title: milestoneForm.title.trim(),
        dueDate: milestoneForm.dueDate || null,
      });
      setShowMilestoneModal(false);
      setMilestoneForm({ projectId: '', title: '', description: '', dueDate: '' });
      loadMilestones();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create milestone.');
    } finally {
      setMilestoneBusy(false);
    }
  };

  const handleStatusChange = async (taskId, nextStatus) => {
    try {
      const coords = await getCurrentGpsCoordinates();
      await taskService.updateProgress(taskId, {
        status: nextStatus,
        latitude: coords?.latitude,
        longitude: coords?.longitude
      });
      await loadData();
      loadMilestones();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update status.');
    }
  };

  const handleAssigneeChange = async (taskId, assigneeUserId) => {
    try {
      await taskService.assign(taskId, assigneeUserId ? Number(assigneeUserId) : null);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reassign task.');
    }
  };

  const pendingLogs = useMemo(() => {
    return dailyLogs.filter(l => l.status === 'SUBMITTED');
  }, [dailyLogs]);

  const openReviewForTask = (task) => {
    const matched = pendingLogs.find(l => String(l.taskId) === String(task.id)) ||
      dailyLogs.find(l => String(l.taskId) === String(task.id) && l.status === 'SUBMITTED') ||
      {
        id: null,
        taskId: task.id,
        taskTitle: task.title,
        projectName: task.projectName,
        logDate: new Date().toISOString().slice(0, 10),
        createdBy: 'Site Engineer',
        workSummary: 'Site progress submitted for review.',
        progressPercentage: task.completionPercentage || task.progress || 0,
        status: 'SUBMITTED',
      };
    setReviewModalLog(matched);
  };

  const handleApprove = async (logId, logObj) => {
    try {
      setBusy(true);
      if (logId) {
        await dailyLogService.approve(logId);
      } else if (logObj?.taskId) {
        await taskService.updateTaskProgress(logObj.taskId, logObj.progressPercentage || 100);
      }
      setActionNotice('Daily log approved! Task, milestone, and project progress successfully updated.');
      setReviewModalLog(null);
      await loadData();
      loadMilestones();
      setTimeout(() => setActionNotice(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to approve log.');
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async (logId, logObj) => {
    try {
      setBusy(true);
      if (logId) {
        await dailyLogService.reject(logId);
      } else if (logObj?.taskId) {
        await taskService.updateProgress(logObj.taskId, { status: 'IN_PROGRESS' });
      }
      setActionNotice('Daily log rejected.');
      setReviewModalLog(null);
      await loadData();
      loadMilestones();
      setTimeout(() => setActionNotice(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reject log.');
    } finally {
      setBusy(false);
    }
  };

  const totalCount = tasks.length;
  const reviewCount = tasks.filter(t => String(t.status || '').toUpperCase() === 'REVIEW').length;
  const completedCount = tasks.filter(t => String(t.status || '').toUpperCase() === 'COMPLETED').length;
  const inProgressCount = tasks.filter(t => String(t.status || '').toUpperCase() === 'IN_PROGRESS').length;
  const todoCount = tasks.filter(t => String(t.status || '').toUpperCase() === 'TODO' || !t.status).length;

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--blue)', fontWeight: 700 }}>
            <CheckSquare size={14} /> Task Governance
          </p>
         
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" className="secondary-button" onClick={loadData} disabled={loading}>
            <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} /> Refresh
          </button>
          <button type="button" className="secondary-button" onClick={() => { setMilestoneForm(f => ({ ...f, projectId: form.projectId || (projects[0]?.id ? String(projects[0].id) : '') })); setShowMilestoneModal(true); }}>
            <Calendar size={16} /> Create Milestone
          </button>
          <button type="button" className="primary-button" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Create Task
          </button>
        </div>
      </section>

      {actionNotice && (
        <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, color: 'var(--green)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={16} /> {actionNotice}
        </div>
      )}

      {error && (
        <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, color: 'var(--red)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14, marginTop: 18 }}>
        {[
          { label: 'Total Tasks', value: totalCount, color: 'var(--blue)' },
          { label: 'In Progress', value: inProgressCount, color: 'var(--orange)' },
          { label: 'To Do', value: todoCount, color: 'var(--purple)' },
          { label: 'Completed', value: completedCount, color: 'var(--green)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="panel" style={{ padding: 18 }}>
            <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>{label}</span>
            <h2 style={{ fontSize: 24, color, margin: '4px 0 0 0', fontWeight: 800 }}>{value}</h2>
          </div>
        ))}
      </div>

      {/* Milestones Section */}
      {milestones.length > 0 && (
        <div className="panel" style={{ marginTop: 18, padding: 20 }}>
          <h3 style={{ margin: '0 0 14px', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={15} style={{ color: 'var(--orange)' }} /> Project Milestones
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 12 }}>
            {milestones.map(ms => {
              const pct = ms.taskCount > 0 ? Math.round((ms.completedTaskCount / ms.taskCount) * 100) : 0;
              return (
                <div key={ms.id} style={{ padding: 14, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--panel-soft)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <strong style={{ fontSize: 13 }}>{ms.title}</strong>
                    <span style={{
                      fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 6,
                      background: ms.status === 'COMPLETED' ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)',
                      color: ms.status === 'COMPLETED' ? 'var(--green)' : 'var(--orange)',
                    }}>{ms.status}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{ms.projectName}</div>
                  {ms.dueDate && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Due: {ms.dueDate}</div>}
                  <div style={{ marginTop: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>
                      <span>{ms.completedTaskCount}/{ms.taskCount} tasks done</span>
                      <span style={{ fontWeight: 700, color: 'var(--blue)' }}>{pct}%</span>
                    </div>
                    <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: ms.status === 'COMPLETED' ? 'var(--green)' : 'var(--blue)', borderRadius: 3, transition: 'width 0.4s' }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
          {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Task Table */}
      <div className="panel" style={{ marginTop: 14, padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--panel-soft)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                {['Task Title', 'Project', 'Milestone', 'Assignee', 'Priority', 'Progress', 'Status', 'GPS Verification', 'Due Date', 'Review / Action'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={10} style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Loading tasks...</td></tr>
              )}
              {!loading && filteredTasks.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
                    <CheckSquare size={36} style={{ display: 'block', margin: '0 auto 10px', opacity: 0.4 }} />
                    No project tasks found. Click "Create Task" above to add one.
                  </td>
                </tr>
              )}
              {!loading && filteredTasks.map(t => {
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
                    <td style={{ padding: 14 }}>
                      {t.milestoneTitle ? (
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--orange)', background: 'rgba(245,158,11,0.1)', padding: '2px 8px', borderRadius: 6 }}>
                          {t.milestoneTitle}
                        </span>
                      ) : <span style={{ color: 'var(--muted)', fontSize: 11 }}>—</span>}
                    </td>
                    <td style={{ padding: 14 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: t.assigneeName ? 'var(--text)' : 'var(--muted)' }}>
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
                      {(() => {
                        const pct = Number(t.completionPercentage ?? t.progress ?? 0);
                        const status = String(t.status || 'TODO').toUpperCase();

                        let label = 'PLANNED';
                        let color = '#64748b';
                        let bg = 'rgba(100,116,139,0.12)';

                        if (status === 'REVIEW') {
                          label = 'IN REVIEW';
                          color = 'var(--orange)';
                          bg = 'rgba(245,158,11,0.14)';
                        } else if (pct >= 100 || status === 'COMPLETED') {
                          label = 'COMPLETED';
                          color = 'var(--green)';
                          bg = 'rgba(34,197,94,0.14)';
                        } else if (pct > 0 || status === 'IN_PROGRESS') {
                          label = 'IN PROGRESS';
                          color = 'var(--blue)';
                          bg = 'rgba(37,99,235,0.14)';
                        }

                        return (
                          <span
                            title={t.milestoneTitle ? `Milestone: ${t.milestoneTitle}` : `Task Status: ${label}`}
                            style={{
                              padding: '4px 10px',
                              borderRadius: 8,
                              fontSize: 11,
                              fontWeight: 700,
                              background: bg,
                              color,
                              display: 'inline-flex',
                              alignItems: 'center',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {label}
                          </span>
                        );
                      })()}
                    </td>
                    <td style={{ padding: 14 }}>
                      {t.locationVerified === true ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--green)', fontSize: 11, fontWeight: 700, background: 'rgba(34,197,94,0.1)', padding: '2px 8px', borderRadius: 6 }}>
                          <ShieldCheck size={13} /> On-Site
                        </span>
                      ) : t.locationVerified === false ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--red)', fontSize: 11, fontWeight: 700, background: 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: 6 }}>
                          <MapPin size={13} /> Remote / Flagged
                        </span>
                      ) : (
                        <span style={{ color: 'var(--muted)', fontSize: 11 }}>Standard</span>
                      )}
                    </td>
                    <td style={{ padding: 14, color: 'var(--muted)', fontSize: 12 }}>
                      {t.dueDate || '—'}
                    </td>
                    <td style={{ padding: 14 }}>
                      {statusKey === 'REVIEW' || pendingLogs.some(l => String(l.taskId) === String(t.id)) ? (
                        <button
                          type="button"
                          className="secondary-button"
                          style={{
                            fontSize: 11,
                            padding: '4px 10px',
                            color: 'var(--orange)',
                            borderColor: 'rgba(245,158,11,0.4)',
                            background: 'rgba(245,158,11,0.1)',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                          onClick={() => openReviewForTask(t)}
                        >
                          Review Log
                        </button>
                      ) : (
                        <span style={{ color: 'var(--muted)', fontSize: 12 }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Task Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="panel" style={{ width: '100%', maxWidth: 540, padding: 26, borderRadius: 16, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, margin: 0 }}>Create & Assign Task</h2>
              <button className="secondary-button" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'grid', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Project *</label>
                <select
                  required
                  value={form.projectId}
                  onChange={e => setForm({ ...form, projectId: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 }}
                >
                  <option value="">Select a project</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Link to Milestone (Optional)</label>
                <select
                  value={form.milestoneId || ''}
                  onChange={e => setForm({ ...form, milestoneId: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 }}
                >
                  <option value="">No Milestone</option>
                  {projectMilestones.map(ms => (
                    <option key={ms.id} value={ms.id}>{ms.title} ({ms.status})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Task Title *</label>
                <input
                  required
                  placeholder="e.g. Concrete pouring inspection for Block A"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Description</label>
                <textarea
                  rows={3}
                  placeholder="Task scope, instructions, or safety requirements"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Priority</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 }}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Due Date</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={e => setForm({ ...form, dueDate: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Assign To (Assigned Project Personnel)</label>
                <select
                  value={form.assigneeUserId}
                  onChange={e => setForm({ ...form, assigneeUserId: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 }}
                >
                  <option value="">Unassigned</option>
                  {projectMembers.map(m => (
                    <option key={m.userId} value={m.userId}>
                      {m.fullName} ({m.role.replace(/_/g, ' ')})
                    </option>
                  ))}
                </select>
                {projectMembers.length === 0 && form.projectId && (
                  <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                    No assigned personnel for this project yet.
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" className="secondary-button" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="primary-button" disabled={busy}>
                  {busy ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Milestone Modal */}
      {showMilestoneModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="panel" style={{ width: '100%', maxWidth: 480, padding: 26, borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, margin: 0 }}>Create Project Milestone</h2>
              <button className="secondary-button" onClick={() => setShowMilestoneModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleCreateMilestone} style={{ display: 'grid', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Project *</label>
                <select
                  required
                  value={milestoneForm.projectId}
                  onChange={e => setMilestoneForm({ ...milestoneForm, projectId: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 }}
                >
                  <option value="">Select project</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Milestone Name *</label>
                <input
                  required
                  placeholder="e.g. Foundation Phase Complete"
                  value={milestoneForm.title}
                  onChange={e => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Description</label>
                <textarea
                  rows={2}
                  placeholder="What does completing this milestone mean?"
                  value={milestoneForm.description}
                  onChange={e => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Target Date</label>
                <input
                  type="date"
                  value={milestoneForm.dueDate}
                  onChange={e => setMilestoneForm({ ...milestoneForm, dueDate: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
                <button type="button" className="secondary-button" onClick={() => setShowMilestoneModal(false)}>Cancel</button>
                <button type="submit" className="primary-button" disabled={milestoneBusy}>
                  {milestoneBusy ? 'Creating...' : 'Create Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Review Modal for Single Task / Log */}
      {reviewModalLog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="panel" style={{ width: '100%', maxWidth: 560, padding: 26, borderRadius: 16, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileText size={18} style={{ color: 'var(--orange)' }} /> Review SE Daily Log
                </h2>
                <p style={{ margin: '4px 0 0 0', color: 'var(--muted)', fontSize: 12 }}>
                  Verify task progress submitted by Site Engineer
                </p>
              </div>
              <button className="secondary-button" onClick={() => setReviewModalLog(null)}><X size={16} /></button>
            </div>

            <div style={{ background: 'var(--panel-soft)', padding: 14, borderRadius: 10, border: '1px solid var(--border)', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <strong style={{ fontSize: 14, color: 'var(--text)' }}>{reviewModalLog.taskTitle || 'Task Progress'}</strong>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'rgba(245,158,11,0.15)', color: 'var(--orange)', fontWeight: 700 }}>
                  IN REVIEW
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 600 }}>Project: {reviewModalLog.projectName || '—'}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                Date: {reviewModalLog.logDate} · Reported by: {reviewModalLog.createdBy || 'Site Engineer'}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <div className="panel" style={{ padding: 12 }}>
                <small style={{ color: 'var(--muted)', fontSize: 11 }}>Submitted Task Progress</small>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--blue)', marginTop: 2 }}>
                  {reviewModalLog.progressPercentage != null ? `${reviewModalLog.progressPercentage}%` : '—'}
                </div>
              </div>
              <div className="panel" style={{ padding: 12 }}>
                <small style={{ color: 'var(--muted)', fontSize: 11 }}>Weather Condition</small>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginTop: 4 }}>
                  {reviewModalLog.weather || 'Standard'}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Work Summary</label>
              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--panel-soft)', border: '1px solid var(--border)', fontSize: 13, lineHeight: 1.5 }}>
                {reviewModalLog.workSummary || 'No summary text provided.'}
              </div>
            </div>

            {reviewModalLog.blockers && (
              <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 12, color: 'var(--red)' }}>
                <strong>Blockers / Delays:</strong> {reviewModalLog.blockers}
              </div>
            )}

            {reviewModalLog.safetyNotes && (
              <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', fontSize: 12, color: 'var(--green)' }}>
                <strong>Safety Notes:</strong> {reviewModalLog.safetyNotes}
              </div>
            )}

            <div style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--panel-soft)', border: '1px solid var(--border)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
              {reviewModalLog.locationVerified ? (
                <span style={{ color: 'var(--green)', display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                  <ShieldCheck size={14} /> Site Engineer location physically verified on-site
                </span>
              ) : (
                <span style={{ color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={14} /> GPS verification: Standard
                </span>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                className="secondary-button"
                onClick={() => setReviewModalLog(null)}
                disabled={busy}
              >
                Cancel
              </button>
              <button
                type="button"
                className="secondary-button"
                style={{ color: 'var(--red)', borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', fontWeight: 700 }}
                onClick={() => handleReject(reviewModalLog.id, reviewModalLog)}
                disabled={busy}
              >
                <XCircle size={15} /> Reject
              </button>
              <button
                type="button"
                className="primary-button"
                style={{ background: 'var(--green)', borderColor: 'var(--green)', fontWeight: 700 }}
                onClick={() => handleApprove(reviewModalLog.id, reviewModalLog)}
                disabled={busy}
              >
                <CheckCircle2 size={15} /> Approve Progress
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Drawer / List Modal for All Pending Logs */}
      {reviewDrawerOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="panel" style={{ width: '100%', maxWidth: 700, padding: 26, borderRadius: 16, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileText size={18} style={{ color: 'var(--orange)' }} /> Pending Site Engineer Logs ({pendingLogs.length})
                </h2>
                <p style={{ margin: '4px 0 0 0', color: 'var(--muted)', fontSize: 12 }}>
                  Daily progress submissions awaiting Project Manager approval
                </p>
              </div>
              <button className="secondary-button" onClick={() => setReviewDrawerOpen(false)}><X size={16} /></button>
            </div>

            {pendingLogs.length === 0 ? (
              <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '30px 0', fontSize: 13 }}>
                All submitted site engineer logs have been reviewed!
              </p>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {pendingLogs.map(l => (
                  <div key={l.id} style={{ padding: 14, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--panel-soft)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div>
                        <strong style={{ fontSize: 14 }}>{l.taskTitle || 'Site Progress Report'}</strong>
                        <div style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 600, marginTop: 2 }}>{l.projectName}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{l.logDate} · By {l.createdBy || 'Site Engineer'}</div>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: 'rgba(34,197,94,0.1)', color: 'var(--green)' }}>
                        +{l.progressPercentage}%
                      </span>
                    </div>
                    <p style={{ fontSize: 13, marginTop: 8, color: 'var(--text)', lineHeight: 1.4 }}>{l.workSummary}</p>
                    {l.blockers && (
                      <div style={{ marginTop: 6, fontSize: 11, color: 'var(--red)', background: 'rgba(239,68,68,0.06)', padding: '4px 8px', borderRadius: 6 }}>
                        <strong>Blocker:</strong> {l.blockers}
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
                      <button
                        type="button"
                        className="secondary-button"
                        style={{ fontSize: 12, color: 'var(--red)' }}
                        onClick={() => handleReject(l.id, l)}
                        disabled={busy}
                      >
                        <XCircle size={13} /> Reject
                      </button>
                      <button
                        type="button"
                        className="secondary-button"
                        style={{ fontSize: 12, color: 'var(--green)', borderColor: 'rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.08)' }}
                        onClick={() => handleApprove(l.id, l)}
                        disabled={busy}
                      >
                        <CheckCircle2 size={13} /> Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
