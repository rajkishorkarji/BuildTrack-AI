import { useEffect, useState, useMemo } from 'react';
import { FileText, Plus, CheckCircle2, XCircle, Activity, Sparkles, TrendingUp, AlertTriangle, ShieldCheck, MapPin, Radio, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { dailyLogService } from '../services/dailyLogService';
import taskService from '../services/taskService';
import projectService from '../services/projectService';
import { realtimeBus } from '../services/api';
import { getCurrentGpsCoordinates, calculateHaversineDistance, formatDistance } from '../utils/geo';

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
  const [deviceGps, setDeviceGps] = useState({ lat: null, lng: null, loading: false, error: null });
  const [notice, setNotice] = useState('');
  const [errorNotice, setErrorNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewTab, setReviewTab] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'

  // Capture device hardware GPS
  const acquireGps = async () => {
    setDeviceGps(prev => ({ ...prev, loading: true, error: null }));
    const loc = await getCurrentGpsCoordinates();
    if (loc.success) {
      setDeviceGps({ lat: loc.latitude, lng: loc.longitude, loading: false, error: null });
    } else {
      setDeviceGps({ lat: null, lng: null, loading: false, error: loc.error });
    }
  };

  useEffect(() => {
    acquireGps();
  }, []);

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

  const selectedProject = useMemo(() => {
    return projects.find(p => String(p.id) === String(projectId));
  }, [projects, projectId]);

  const isProjectGeofenced = selectedProject?.latitude != null && selectedProject?.longitude != null;
  const geofenceRadius = selectedProject?.geofenceRadiusMeters || 100;

  const currentDistance = useMemo(() => {
    if (!isProjectGeofenced || deviceGps.lat == null || deviceGps.lng == null) return null;
    return calculateHaversineDistance(deviceGps.lat, deviceGps.lng, selectedProject.latitude, selectedProject.longitude);
  }, [isProjectGeofenced, deviceGps, selectedProject]);

  const isWithinGeofence = currentDistance != null ? currentDistance <= geofenceRadius : !isProjectGeofenced;

  const activeTasks = useMemo(() => {
    if (!projectId) return [];
    if (projectTasks.length > 0) return projectTasks;
    return tasks.filter(t => {
      const pIdMatches = String(t.projectId || t.project?.id || t.project || '') === String(projectId);
      const selectedProjName = selectedProject?.name;
      const pNameMatches = selectedProjName && String(t.projectName || '') === String(selectedProjName);
      return pIdMatches || pNameMatches;
    });
  }, [projectId, projectTasks, tasks, selectedProject]);

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

    // 1. Validation: If user entered task progress percentage, a task must be selected!
    if (form.taskProgressPercentage !== '' && !taskId) {
      setErrorNotice('Select an assigned task before reporting task progress.');
      return;
    }

    // 2. Client-side Geofence Pre-validation
    if (isProjectGeofenced) {
      let lat = deviceGps.lat;
      let lng = deviceGps.lng;

      if (lat == null || lng == null) {
        // Try to fetch GPS right now
        setDeviceGps(prev => ({ ...prev, loading: true }));
        const loc = await getCurrentGpsCoordinates();
        setDeviceGps({ lat: loc.latitude, lng: loc.longitude, loading: false, error: loc.error || null });
        if (!loc.success) {
          setErrorNotice(`Physical Geofence Verification Required: Project "${selectedProject?.name}" requires verified on-site presence within ${geofenceRadius}m. Please allow browser location access.`);
          return;
        }
        lat = loc.latitude;
        lng = loc.longitude;
      }

      const dist = calculateHaversineDistance(lat, lng, selectedProject.latitude, selectedProject.longitude);
      if (dist > geofenceRadius) {
        setErrorNotice(`Physical Geofence Violation: You are ${formatDistance(dist)} away from "${selectedProject.name}" site. Daily log submission is strictly restricted to within ${geofenceRadius}m of the construction site.`);
        return;
      }
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
        latitude: deviceGps.lat,
        longitude: deviceGps.lng,
      };

      const newLog = await dailyLogService.create(payload);
      setLogs(p => [newLog, ...p]);

      // Broadcast real-time update to all subscribers (PM Tasks Table & Dashboards)
      realtimeBus.publish('SERVER_UPDATE', { type: 'DAILY_LOG_SUBMITTED', projectId, taskId, taskProgNum });
      if (realtimeBus.emit) realtimeBus.emit('SERVER_UPDATE');

      setForm({ ...form, workSummary: '', blockers: '', safetyNotes: '', taskProgressPercentage: '', weather: '' });
      setTaskId('');
      setNotice('Daily log submitted successfully! Task status set to In Review pending Project Manager approval.');
      setTimeout(() => setNotice(''), 5000);
      if (refresh) refresh();
    } catch (err) {
      setErrorNotice(err?.response?.data?.message || err?.message || 'Unable to submit log.');
    } finally {
      setSubmitting(false);
    }
  };

  const review = async (id, ok) => {
    try {
      const x = ok ? await dailyLogService.approve(id) : await dailyLogService.reject(id);
      setLogs(p => p.map(l => l.id === id ? x : l));
      realtimeBus.publish('SERVER_UPDATE', { type: 'LOG_REVIEW', id, ok });
      setNotice(ok ? 'Daily log approved! Task progress, milestone progress, and project status successfully updated.' : 'Daily log rejected.');
      setTimeout(() => setNotice(''), 5000);
      if (refresh) refresh();
    } catch (err) {
      setErrorNotice(err?.response?.data?.message || 'Review failed');
    }
  };

  const canReview = ['SUPER_ADMIN', 'COMPANY_ADMIN', 'PROJECT_MANAGER'].includes(user?.role);

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--blue)', fontWeight: 700 }}>
            <FileText size={14} /> Daily Logs & Site DPR
          </p>
        </div>
      </section>

      {notice && (
        <div className="panel" style={{ marginTop: 16, padding: '12px 16px', color: 'var(--green)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}>
          <CheckCircle2 size={16} /> {notice}
        </div>
      )}
      {errorNotice && (
        <div className="panel" style={{ marginTop: 16, padding: '12px 16px', color: 'var(--red)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <AlertTriangle size={16} /> {errorNotice}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 460px) 1fr', gap: 18, marginTop: 18 }}>
        {/* Submit Form */}
        <div className="panel" style={{ padding: 22 }}>
          <h3 style={{ margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
            <Plus size={16} style={{ color: 'var(--blue)' }} /> Submit Daily Progress Report
          </h3>
          <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Active Project Site *</label>
              <select required style={INPUT} value={projectId} onChange={e => {
                const pId = e.target.value;
                setProjectId(pId);
                setTaskId('');
                setErrorNotice('');
                const selP = projects.find(p => String(p.id) === String(pId));
                if (selP && selP.progressPercentage != null) {
                  setForm(f => ({ ...f, overallProjectProgress: String(selP.progressPercentage) }));
                }
              }}>
                <option value="">Select active project</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.latitude != null ? ` (Geofenced ${p.geofenceRadiusMeters || 100}m)` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Zero-Trust Physical Geofence Banner */}
            {selectedProject && (
              <div style={{
                padding: '10px 14px',
                borderRadius: 8,
                fontSize: 12,
                border: isProjectGeofenced
                  ? isWithinGeofence
                    ? '1px solid rgba(34,197,94,0.3)'
                    : '1px solid rgba(239,68,68,0.3)'
                  : '1px solid var(--border)',
                background: isProjectGeofenced
                  ? isWithinGeofence
                    ? 'rgba(34,197,94,0.08)'
                    : 'rgba(239,68,68,0.08)'
                  : 'var(--panel-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {isProjectGeofenced ? (
                    isWithinGeofence ? (
                      <ShieldCheck size={16} style={{ color: 'var(--green)', flexShrink: 0 }} />
                    ) : (
                      <AlertTriangle size={16} style={{ color: 'var(--red)', flexShrink: 0 }} />
                    )
                  ) : (
                    <MapPin size={16} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                  )}
                  <div>
                    {isProjectGeofenced ? (
                      deviceGps.loading ? (
                        <span style={{ color: 'var(--muted)' }}>📡 Detecting device hardware GPS...</span>
                      ) : deviceGps.error ? (
                        <span style={{ color: 'var(--red)', fontWeight: 600 }}>⚠️ GPS access denied. Site requires on-site presence verification.</span>
                      ) : isWithinGeofence ? (
                        <span style={{ color: 'var(--green)', fontWeight: 600 }}>
                          ✓ On-Site GPS Confirmed ({formatDistance(currentDistance)} from site center)
                        </span>
                      ) : (
                        <span style={{ color: 'var(--red)', fontWeight: 600 }}>
                          ⚠️ Outside Site Boundary ({formatDistance(currentDistance)} away · Max {geofenceRadius}m)
                        </span>
                      )
                    ) : (
                      <span style={{ color: 'var(--muted)' }}>Standard Mode: No physical GPS geofence configured.</span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={acquireGps}
                  title="Refresh GPS"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--blue)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: 4,
                  }}
                >
                  <RotateCcw size={13} className={deviceGps.loading ? 'spin' : ''} />
                </button>
              </div>
            )}

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
              <textarea required rows={4} style={INPUT} placeholder="Describe work completed today on site (e.g., Concrete pouring for Slab 3, Rebar tying finished)" value={form.workSummary} onChange={e => setForm({ ...form, workSummary: e.target.value })} />
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
                <input 
                  style={INPUT} 
                  list="weather-suggestions"
                  placeholder="Sunny / Rain" 
                  value={form.weather} 
                  onChange={e => setForm({ ...form, weather: e.target.value })} 
                />
                <datalist id="weather-suggestions">
                  <option value="Sunny / Clear" />
                  <option value="Partly Cloudy" />
                  <option value="Light Rain" />
                  <option value="Heavy Rain / Storm" />
                  <option value="Windy / High Dust" />
                  <option value="Extreme Heat" />
                </datalist>
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

            <button 
              className="primary-button" 
              disabled={!projectId || submitting || (isProjectGeofenced && !isWithinGeofence && !deviceGps.loading)} 
              style={{ 
                marginTop: 6,
                opacity: isProjectGeofenced && !isWithinGeofence ? 0.6 : 1,
                cursor: isProjectGeofenced && !isWithinGeofence ? 'not-allowed' : 'pointer'
              }}
            >
              {submitting ? 'Submitting Log...' : isProjectGeofenced && !isWithinGeofence ? 'Blocked: Outside Site Geofence' : 'Submit Daily Log (Pending PM Review)'}
            </button>
          </form>
        </div>

        {/* Logs Feed */}
        <div className="panel" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontWeight: 700 }}>Submitted Site Daily Logs</h3>
          </div>

          {/* Review Tabs — visible to PM, Company Admin, Super Admin only */}
          {canReview && (
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
              {[
                { key: 'all', label: 'All Logs' },
                { key: 'pending', label: `Pending Review`, count: logs.filter(l => l.status === 'SUBMITTED').length },
                { key: 'approved', label: 'Approved' },
                { key: 'rejected', label: 'Rejected' },
              ].map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setReviewTab(tab.key)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: reviewTab === tab.key ? 'var(--blue)' : 'var(--panel-soft)',
                    color: reviewTab === tab.key ? '#fff' : 'var(--text)',
                  }}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span style={{ background: 'var(--red)', color: '#fff', borderRadius: 10, padding: '1px 6px', fontSize: 10, fontWeight: 800 }}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          <div style={{ display: 'grid', gap: 12 }}>
            {logs
              .filter(l => {
                if (!canReview || reviewTab === 'all') return true;
                if (reviewTab === 'pending') return l.status === 'SUBMITTED';
                if (reviewTab === 'approved') return l.status === 'APPROVED';
                if (reviewTab === 'rejected') return l.status === 'REJECTED';
                return true;
              })
              .map(l => (
              <div key={l.id} style={{ padding: 16, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--panel-soft)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <strong style={{ fontSize: 14 }}>{l.projectName}</strong>
                      {l.locationVerified ? (
                        <span style={{ fontSize: 11, color: 'var(--blue)', display: 'inline-flex', alignItems: 'center', gap: 3, background: 'rgba(59,130,246,0.1)', padding: '2px 6px', borderRadius: 4 }}>
                          <MapPin size={11} /> On-Site GPS {l.distanceMeters != null ? `(${formatDistance(l.distanceMeters)})` : ''}
                        </span>
                      ) : l.distanceMeters != null ? (
                        <span style={{ fontSize: 11, color: 'var(--orange)', display: 'inline-flex', alignItems: 'center', gap: 3, background: 'rgba(245,158,11,0.1)', padding: '2px 6px', borderRadius: 4 }}>
                          <MapPin size={11} /> {formatDistance(l.distanceMeters)} away
                        </span>
                      ) : null}
                    </div>
                    {l.taskTitle && <div style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 600, marginTop: 2 }}>Task: {l.taskTitle}</div>}
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{l.logDate} · Reported by {l.createdBy}</div>
                  </div>
                  {(() => {
                    const statusKey = String(l.status || 'SUBMITTED').toUpperCase();
                    const meta = {
                      SUBMITTED: { label: 'PENDING REVIEW', color: 'var(--orange)', bg: 'rgba(245,158,11,0.12)', icon: '⏳' },
                      APPROVED: { label: 'APPROVED', color: 'var(--green)', bg: 'rgba(34,197,94,0.12)', icon: '✓' },
                      REJECTED: { label: 'REJECTED', color: 'var(--red)', bg: 'rgba(239,68,68,0.12)', icon: '✕' },
                    }[statusKey] || { label: statusKey, color: 'var(--blue)', bg: 'rgba(37,99,235,0.12)', icon: '' };

                    return (
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: 700,
                        background: meta.bg,
                        color: meta.color,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}>
                        {meta.icon} {meta.label}
                      </span>
                    );
                  })()}
                </div>
                <p style={{ fontSize: 13, marginTop: 10, lineHeight: 1.5, color: 'var(--text)' }}>{l.workSummary}</p>

                {/* Weather & Progress Info */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  {l.weather && (
                    <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'rgba(59,130,246,0.1)', color: 'var(--blue)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      ☀️ Weather: {l.weather}
                    </span>
                  )}
                  {l.progressPercentage != null && (
                    <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'rgba(34,197,94,0.1)', color: 'var(--green)', fontWeight: 600 }}>
                      Progress: {l.progressPercentage}%
                    </span>
                  )}
                </div>

                {/* Blockers & Delays */}
                {l.blockers && (
                  <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, fontSize: 12, color: 'var(--red)' }}>
                    <strong>⚠️ Blockers / Delays:</strong> {l.blockers}
                  </div>
                )}

                {/* Safety Notes */}
                {l.safetyNotes && (
                  <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, fontSize: 12, color: 'var(--green)' }}>
                    <strong>🦺 Safety Notes:</strong> {l.safetyNotes}
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

