import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  CheckSquare,
  Clock,
  Package,
  MapPin,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Play,
  Check,
  Award,
  QrCode,
  Calendar,
  Layers
} from 'lucide-react';
import attendanceService from '../../services/attendanceService';
import taskService from '../../services/taskService';
import materialService from '../../services/materialService';
import projectService from '../../services/projectService';
import { realtimeBus } from '../../services/api';
import { getAttendanceWorkflowCategory } from '../../utils/attendanceWorkflow';

export default function WorkerDashboard() {
  const { user } = useAuth();
  const {
    tasks: ctxTasks = [],
    attendanceLogs: ctxAttendance = [],
    materials: ctxMaterials = [],
    materialRequests: ctxMaterialRequests = [],
    projects: ctxProjects = [],
    workers: ctxWorkers = [],
    refresh: ctxRefresh
  } = useData();

  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [materialRequests, setMaterialRequests] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busyAction, setBusyAction] = useState(false);
  const [receivingId, setReceivingId] = useState(null);

  const workerName = user?.fullName || user?.name || 'Worker';
  const qrToken = `QR-WRK-${String(user?.id || 1).padStart(5, '0')}`;

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [attRes, taskRes, matReqRes, projRes] = await Promise.allSettled([
        attendanceService.list(),
        taskService.list(),
        materialService.listRequests(),
        projectService.getProjects(),
      ]);

      if (attRes.status === 'fulfilled' && Array.isArray(attRes.value)) {
        setAttendanceLogs(attRes.value.filter(Boolean));
      } else {
        setAttendanceLogs(ctxAttendance || []);
      }

      if (taskRes.status === 'fulfilled' && Array.isArray(taskRes.value)) {
        setTasks(taskRes.value.filter(Boolean));
      } else {
        setTasks(ctxTasks || []);
      }

      if (matReqRes.status === 'fulfilled' && Array.isArray(matReqRes.value)) {
        setMaterialRequests(matReqRes.value.filter(Boolean));
      } else {
        setMaterialRequests(ctxMaterialRequests || []);
      }

      if (projRes.status === 'fulfilled' && Array.isArray(projRes.value)) {
        setProjects(projRes.value.filter(Boolean));
      } else {
        setProjects(ctxProjects || []);
      }
    } catch (e) {
      setError(e?.response?.data?.message || 'Unable to sync worker dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = realtimeBus.subscribe('SERVER_UPDATE', () => {
      loadData();
      if (ctxRefresh) ctxRefresh();
    });
    return () => unsub();
  }, []);

  // Real Worker Data Resolution
  const activeAttendance = useMemo(() => {
    return attendanceLogs.find(r => r && !r.checkOut);
  }, [attendanceLogs]);

  const checkedIn = Boolean(activeAttendance);
  const activeCat = activeAttendance ? getAttendanceWorkflowCategory(activeAttendance) : null;

  const assignedTasks = useMemo(() => {
    const rawList = tasks.length ? tasks : ctxTasks;
    return rawList.filter(t => {
      if (!t) return false;
      const assigned = t.assignedWorker || t.assignedTo || t.workerName;
      return !assigned || assigned === workerName || String(t.workerId) === String(user?.id);
    });
  }, [tasks, ctxTasks, workerName, user?.id]);

  const openTasks = useMemo(() => {
    return assignedTasks.filter(t => t && !String(t.status || '').toUpperCase().includes('COMPLETED'));
  }, [assignedTasks]);

  const completedTasks = useMemo(() => {
    return assignedTasks.filter(t => t && String(t.status || '').toUpperCase().includes('COMPLETED'));
  }, [assignedTasks]);

  const avgProgress = useMemo(() => {
    if (!assignedTasks.length) return 0;
    const sum = assignedTasks.reduce((acc, t) => acc + Number(t.completionPercentage ?? t.progress ?? 0), 0);
    return Math.round(sum / assignedTasks.length);
  }, [assignedTasks]);

  const assignedProject = useMemo(() => {
    if (activeAttendance?.projectName) return activeAttendance.projectName;
    if (projects.length && projects[0]?.name) return projects[0].name;
    if (ctxProjects.length && ctxProjects[0]?.name) return ctxProjects[0].name;
    return 'Assigned Project Site';
  }, [activeAttendance, projects, ctxProjects]);

  const allRequests = useMemo(() => {
    return (materialRequests.length ? materialRequests : ctxMaterialRequests) || [];
  }, [materialRequests, ctxMaterialRequests]);

  const readyMaterials = useMemo(() => {
    return allRequests.filter(r => r && (String(r.status || '').toUpperCase() === 'ISSUED' || String(r.status || '').toUpperCase() === 'READY'));
  }, [allRequests]);

  const receivedMaterials = useMemo(() => {
    return allRequests.filter(r => r && (String(r.status || '').toUpperCase() === 'WORKER_RECEIVED' || String(r.status || '').toUpperCase() === 'CONFIRMED'));
  }, [allRequests]);

  // Attendance Toggle (Check-in / Check-out)
  const toggleAttendance = async () => {
    setBusyAction(true);
    setError('');
    try {
      if (checkedIn && activeAttendance) {
        await attendanceService.checkOut(activeAttendance.id || 0);
        setNotice('Checked out successfully! Worked duration & shift category calculated.');
      } else {
        const projId = activeAttendance?.projectId || projects[0]?.id || ctxProjects[0]?.id;
        if (!projId) throw new Error('No assigned project site available for check-in.');
        await attendanceService.checkIn({ projectId: projId });
        setNotice('Checked in successfully! Attendance Session is now OPEN.');
      }
      await loadData();
      if (ctxRefresh) ctxRefresh();
      setTimeout(() => setNotice(''), 4000);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Attendance action failed.');
    } finally {
      setBusyAction(false);
    }
  };

  // Start Task Action
  const startTask = async (taskId) => {
    try {
      await taskService.updateProgress(taskId, { progress: 10, status: 'IN_PROGRESS' });
      setNotice('Task marked as In Progress!');
      setTimeout(() => setNotice(''), 3000);
      await loadData();
      if (ctxRefresh) ctxRefresh();
    } catch (e) {
      setError(e?.response?.data?.message || 'Unable to update task status.');
    }
  };

  // Receive Material Action
  const receiveMaterial = async (reqId) => {
    setReceivingId(reqId);
    try {
      await materialService.workerReceiveRequest(reqId);
      setNotice('Material successfully received on site!');
      setTimeout(() => setNotice(''), 3000);
      await loadData();
      if (ctxRefresh) ctxRefresh();
    } catch (e) {
      setError(e?.response?.data?.message || 'Unable to receive material.');
    } finally {
      setReceivingId(null);
    }
  };

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--blue)', fontWeight: 700 }}>
            <CheckSquare size={14} /> Worker Operations Dashboard
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button type="button" className="secondary-button" onClick={loadData} disabled={loading}>
            <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} /> Refresh Realtime
          </button>
          <button
            type="button"
            className="primary-button"
            style={{ background: checkedIn ? 'var(--red)' : 'var(--blue)' }}
            onClick={toggleAttendance}
            disabled={busyAction}
          >
            <Clock size={16} />
            {checkedIn
              ? `Check Out (Session OPEN: ${activeAttendance?.checkIn ? new Date(activeAttendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active'})`
              : '1-Click Check In (Open Session)'}
          </button>
        </div>
      </section>

      {notice && (
        <div className="panel" style={{ marginTop: 16, color: 'var(--green)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={16} /> {notice}
        </div>
      )}
      {error && (
        <div className="panel" style={{ marginTop: 16, color: 'var(--red)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Real-Data KPI Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginTop: 18 }}>
        {[
          {
            label: "Today's Tasks",
            value: `${openTasks.length} Pending`,
            color: 'var(--blue)',
            sub: `${completedTasks.length} completed / ${assignedTasks.length} total`,
            icon: CheckSquare,
          },
          {
            label: 'Shift & Attendance',
            value: checkedIn ? 'Session OPEN' : (attendanceLogs.length > 0 && attendanceLogs[0]?.checkOut ? 'Shift Done' : 'Not Checked In'),
            color: checkedIn ? 'var(--green)' : 'var(--orange)',
            sub: checkedIn ? `In: ${new Date(activeAttendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Shift tracking ready',
            icon: Clock,
          },
          {
            label: 'Overall Progress',
            value: `${avgProgress}%`,
            color: 'var(--purple)',
            sub: `${assignedTasks.length} assigned task items`,
            icon: Layers,
          },
          {
            label: 'Ready Materials',
            value: readyMaterials.length > 0
              ? `${readyMaterials.length} Ready to Receive`
              : (receivedMaterials.length > 0 ? `${receivedMaterials.length} Received` : '0 Pending'),
            color: readyMaterials.length > 0 ? 'var(--green)' : (receivedMaterials.length > 0 ? 'var(--blue)' : 'var(--muted)'),
            sub: readyMaterials.length > 0
              ? `${readyMaterials.length} delivery awaiting site receipt`
              : (receivedMaterials.length > 0 ? `${receivedMaterials.length} delivered materials acknowledged` : 'All materials acknowledged'),
            icon: Package,
          },
          {
            label: 'Assigned Site',
            value: assignedProject,
            color: 'var(--blue)',
            sub: `QR Pass: ${qrToken}`,
            icon: MapPin,
          },
        ].map(({ label, value, color, sub, icon: Icon }) => (
          <div key={label} className="panel" style={{ padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 600 }}>{label}</span>
              <Icon size={16} style={{ color }} />
            </div>
            <h2 style={{ fontSize: 22, color, margin: '6px 0 2px 0', fontWeight: 800 }}>{value}</h2>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>{sub}</span>
          </div>
        ))}
      </div>

      {/* Main Grid: Tasks & Material Receipt Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)', gap: 18, marginTop: 20 }}>
        
        {/* Today's Assigned Tasks */}
        <div className="panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckSquare size={17} style={{ color: 'var(--blue)' }} /> Assigned Tasks ({openTasks.length} Active)
            </h3>
            <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>{assignedTasks.length} Total</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {assignedTasks.length === 0 ? (
              <div style={{ padding: 30, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                No tasks assigned to your queue today.
              </div>
            ) : (
              assignedTasks.slice(0, 5).map(t => {
                const isDone = String(t.status || '').toUpperCase().includes('COMPLETED');
                const isTodo = String(t.status || '').toUpperCase() === 'TODO';
                return (
                  <div key={t.id} style={{ padding: '12px 14px', background: 'var(--panel-soft)', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ display: 'block', fontSize: 13, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {t.title}
                      </strong>
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                        {t.projectName || assignedProject} • Priority: {t.priority || 'Normal'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                        background: isDone ? 'rgba(34,197,94,0.12)' : 'rgba(37,99,235,0.12)',
                        color: isDone ? 'var(--green)' : 'var(--blue)',
                      }}>
                        {t.completionPercentage != null ? `${t.completionPercentage}%` : (t.status || 'Active')}
                      </span>
                      {isTodo && (
                        <button
                          className="primary-button"
                          style={{ fontSize: 11, padding: '4px 8px', background: 'var(--blue)' }}
                          onClick={() => startTask(t.id)}
                        >
                          <Play size={11} /> Start
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Site Material Receipts Queue */}
        <div className="panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Package size={17} style={{ color: 'var(--purple)' }} /> Site Material Deliveries
            </h3>
            <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>{readyMaterials.length} Ready</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {readyMaterials.length === 0 ? (
              <div style={{ padding: 30, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                No pending material deliveries requiring receipt on site.
              </div>
            ) : (
              readyMaterials.slice(0, 5).map(r => {
                const matName = (r.material && typeof r.material === 'object' && r.material.name ? r.material.name : null)
                  || r.materialName || r.materialRequested || r.name || 'Site Material';
                return (
                  <div key={r.id} style={{ padding: '12px 14px', background: 'var(--panel-soft)', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: 13, color: 'var(--text)' }}>
                        {matName} — {r.quantity} {r.unit || 'units'}
                      </strong>
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                        Task: {r.taskTitle || 'Site Work'} • Issued by {r.issuedByName || 'Store'}
                      </span>
                    </div>
                    <button
                      className="primary-button"
                      style={{ fontSize: 11, padding: '4px 10px', background: 'var(--green)' }}
                      disabled={receivingId === r.id}
                      onClick={() => receiveMaterial(r.id)}
                    >
                      <Check size={12} /> {receivingId === r.id ? 'Receiving...' : 'Receive'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Recent Attendance & Shift Duration Logs */}
      <div className="panel" style={{ marginTop: 20, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong style={{ fontSize: 14 }}>Recent Shift Attendance Logs</strong>
          <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>{attendanceLogs.length} Records</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 760, borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--panel-soft)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                {['Date', 'Site', 'Check In', 'Check Out', 'Hours Worked', 'Work Duration / Category', 'Status', 'Verification'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attendanceLogs.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: 30, textAlign: 'center', color: 'var(--muted)' }}>No attendance logs recorded yet.</td></tr>
              ) : (
                attendanceLogs.slice(0, 5).map(r => {
                  const cat = getAttendanceWorkflowCategory(r);
                  return (
                    <tr key={r.id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 700 }}>
                        {r.checkIn ? new Date(r.checkIn).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}
                      </td>
                      <td style={{ padding: 12, color: 'var(--blue)', fontWeight: 600 }}>{r.projectName || assignedProject}</td>
                      <td style={{ padding: 12, color: 'var(--green)', fontWeight: 600 }}>
                        {r.checkIn ? new Date(r.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td style={{ padding: 12, color: r.checkOut ? 'var(--muted)' : 'var(--blue)', fontWeight: 600 }}>
                        {r.checkOut ? new Date(r.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active On Site'}
                      </td>
                      <td style={{ padding: 12, fontWeight: 700 }}>
                        {r.hoursWorked != null ? `${r.hoursWorked} hrs` : (r.checkOut ? '—' : 'In Progress')}
                      </td>
                      <td style={{ padding: 12 }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 700,
                          background: cat.badgeBg,
                          color: cat.badgeColor,
                          border: `1px solid ${cat.badgeBorder}`,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          whiteSpace: 'nowrap'
                        }}>
                          {cat.label}
                        </span>
                      </td>
                      <td style={{ padding: 12 }}>
                        <span style={{ padding: '2px 6px', borderRadius: 5, fontSize: 11, fontWeight: 700, background: 'rgba(34,197,94,0.12)', color: 'var(--green)' }}>
                          {r.status || 'PRESENT'}
                        </span>
                      </td>
                      <td style={{ padding: 12 }}>
                        <span style={{
                          padding: '2px 6px', borderRadius: 5, fontSize: 11, fontWeight: 700,
                          background: r.verificationStatus === 'VERIFIED' ? 'rgba(34,197,94,0.12)' : r.verificationStatus === 'REJECTED' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
                          color: r.verificationStatus === 'VERIFIED' ? 'var(--green)' : r.verificationStatus === 'REJECTED' ? 'var(--red)' : 'var(--orange)',
                        }}>
                          {r.verificationStatus || 'PENDING'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
