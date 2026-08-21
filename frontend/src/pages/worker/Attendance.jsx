import { useEffect, useMemo, useState } from 'react';
import { QrCode, UserCheck, RefreshCw, CheckCircle2, Clock, ShieldCheck, AlertTriangle, Award, CheckCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import attendanceService from '../../services/attendanceService';
import projectService from '../../services/projectService';
import { realtimeBus } from '../../services/api';
import { getAttendanceWorkflowCategory } from '../../utils/attendanceWorkflow';

export default function WorkerAttendance() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [projects, setProjects] = useState([]);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [attendance, projectData] = await Promise.all([
        attendanceService.list(),
        projectService.getProjects(),
      ]);
      setRows(Array.isArray(attendance) ? attendance.filter(Boolean) : []);
      setProjects(Array.isArray(projectData) ? projectData.filter(Boolean) : []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Unable to load attendance.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const unsub = realtimeBus.subscribe('SERVER_UPDATE', () => load());
    return () => unsub();
  }, []);

  const active = useMemo(() => rows.find(r => !r.checkOut), [rows]);
  const projectId = active?.projectId || projects[0]?.id;

  const toggle = async () => {
    try {
      setError('');
      if (active) {
        await attendanceService.checkOut(active.id || 0);
        setNotice('Checked out successfully! Worked duration & shift category calculated.');
      } else {
        const targetProjectId = projectId || projects[0]?.id;
        if (!targetProjectId) throw new Error('No assigned project site is available for attendance.');
        await attendanceService.checkIn({ projectId: targetProjectId });
        setNotice('Checked in successfully! Attendance Session is now OPEN.');
      }
      await load();
      setTimeout(() => setNotice(''), 4000);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Attendance action failed.');
    }
  };

  const qrToken = `QR-WRK-${String(user?.id || 1).padStart(5, '0')}`;

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--blue)', fontWeight: 700 }}>
            <UserCheck size={14} /> Worker Attendance & Daily Shift
          </p>
        </div>
        <button type="button" className="secondary-button" onClick={load} disabled={loading}>
          <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} /> Refresh
        </button>
      </section>

      {notice && (
        <div className="panel" style={{ marginTop: 16, padding: '12px 16px', color: 'var(--green)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={16} /> {notice}
        </div>
      )}
      {error && (
        <div className="panel" style={{ marginTop: 16, padding: '12px 16px', color: 'var(--red)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px,360px) 1fr', gap: 20, marginTop: 20 }}>
        {/* QR Badge & Check-in Control */}
        <div className="panel" style={{ padding: 28, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: 16, background: active ? 'rgba(34,197,94,0.12)' : 'rgba(37,99,235,0.1)', color: active ? 'var(--green)' : 'var(--blue)', display: 'grid', placeItems: 'center', marginBottom: 14 }}>
            {active ? <Clock size={42} /> : <QrCode size={42} />}
          </div>
          <h3 style={{ margin: '0 0 4px', fontWeight: 800 }}>Worker Attendance QR Pass</h3>
          <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Token: <code style={{ background: 'var(--panel-soft)', padding: '2px 6px', borderRadius: 4 }}>{qrToken}</code></span>
          
          {/* Live Session Status */}
          <div style={{
            marginTop: 14,
            padding: '10px 14px',
            borderRadius: 10,
            width: '100%',
            boxSizing: 'border-box',
            background: active ? 'rgba(34,197,94,0.12)' : 'var(--panel-soft)',
            border: active ? '1px solid rgba(34,197,94,0.3)' : '1px solid var(--border)',
            color: active ? 'var(--green)' : 'var(--muted)',
            fontSize: 12,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6
          }}>
            {active ? (
              <>
                <CheckCircle2 size={15} /> Session OPEN (Check-In: {new Date(active.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
              </>
            ) : (
              <>
                <Clock size={15} /> Not Checked In Today
              </>
            )}
          </div>

          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>
            {active
              ? 'Work is in progress. Click below when your shift ends to calculate duration & overtime.'
              : 'Show this QR code token to your Site Engineer or tap below to open your session.'}
          </p>
          <button
            className="primary-button"
            disabled={loading}
            onClick={toggle}
            style={{ width: '100%', marginTop: 16, background: active ? 'var(--red)' : 'var(--blue)' }}
          >
            {active ? 'Check Out (Calculate Duration)' : '1-Click Check In (Open Session)'}
          </button>
        </div>

        {/* History Table */}
        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', fontWeight: 700, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Attendance & Shift Duration History</span>
            <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>{rows.length} logs</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 840, borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--panel-soft)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                  {['Date', 'Project Site', 'Check In', 'Check Out', 'Hours', 'Work Duration / Category', 'Status', 'Verification'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={8} style={{ padding: 30, textAlign: 'center', color: 'var(--muted)' }}>Loading attendance…</td></tr>}
                {!loading && rows.length === 0 && (
                  <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>No attendance recorded yet.</td></tr>
                )}
                {!loading && rows.map(r => {
                  const cat = getAttendanceWorkflowCategory(r);
                  return (
                    <tr key={r.id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 700 }}>{r.checkIn ? new Date(r.checkIn).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                      <td style={{ padding: 14, color: 'var(--blue)', fontWeight: 600 }}>{r.projectName || '—'}</td>
                      <td style={{ padding: 14, color: 'var(--green)', fontWeight: 600 }}>{r.checkIn ? new Date(r.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                      <td style={{ padding: 14, color: r.checkOut ? 'var(--muted)' : 'var(--blue)', fontWeight: 600 }}>{r.checkOut ? new Date(r.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active On Site'}</td>
                      <td style={{ padding: 14, fontWeight: 700 }}>{r.hoursWorked != null ? `${r.hoursWorked} hrs` : (r.checkOut ? '—' : 'In Progress')}</td>
                      <td style={{ padding: 14 }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 700,
                          background: cat.badgeBg,
                          color: cat.badgeColor,
                          border: `1px solid ${cat.badgeBorder}`,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          whiteSpace: 'nowrap'
                        }}>
                          {cat.label}
                        </span>
                      </td>
                      <td style={{ padding: 14 }}>
                        <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: 'rgba(34,197,94,0.12)', color: 'var(--green)' }}>
                          {r.status || 'PRESENT'}
                        </span>
                      </td>
                      <td style={{ padding: 14 }}>
                        <span style={{
                          padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                          background: r.verificationStatus === 'VERIFIED' ? 'rgba(34,197,94,0.12)' : r.verificationStatus === 'REJECTED' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
                          color: r.verificationStatus === 'VERIFIED' ? 'var(--green)' : r.verificationStatus === 'REJECTED' ? 'var(--red)' : 'var(--orange)',
                        }}>
                          {r.verificationStatus || 'PENDING'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
