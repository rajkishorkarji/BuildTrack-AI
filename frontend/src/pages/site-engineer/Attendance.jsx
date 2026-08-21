import { useEffect, useState, useMemo } from 'react';
import { UserCheck, QrCode, CheckCircle2, XCircle, Clock, Search, RefreshCw, AlertTriangle, ShieldCheck, CheckCheck, Award } from 'lucide-react';
import attendanceService from '../../services/attendanceService';
import projectService from '../../services/projectService';
import { realtimeBus } from '../../services/api';
import { getAttendanceWorkflowCategory } from '../../utils/attendanceWorkflow';

const INPUT = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13, boxSizing: 'border-box' };

export default function SEAttendance() {
  const [rows, setRows] = useState([]);
  const [projects, setProjects] = useState([]);
  const [token, setToken] = useState('');
  const [projectId, setProjectId] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [a, p] = await Promise.all([
        attendanceService.list(),
        projectService.list(),
      ]);
      setRows(Array.isArray(a) ? a.filter(Boolean) : []);
      setProjects(Array.isArray(p) ? p.filter(Boolean) : []);
      if (!projectId && p?.[0]?.id) setProjectId(String(p[0].id));
    } catch (e) {
      setError(e?.response?.data?.message || 'Unable to load attendance records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const unsub = realtimeBus.subscribe('SERVER_UPDATE', () => load());
    return () => unsub();
  }, []);

  const scanQr = async (e) => {
    e?.preventDefault();
    if (!token.trim()) { setError('Enter or scan worker QR code token.'); return; }
    if (!projectId) { setError('Please select a project site first.'); return; }
    setScanning(true);
    setError('');
    try {
      await attendanceService.checkInByQr({ qrCodeToken: token.trim(), projectId: Number(projectId) });
      setToken('');
      setNotice('Worker checked in (Attendance Session OPEN) successfully!');
      setTimeout(() => setNotice(''), 3000);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || 'QR Check-in failed.');
    } finally {
      setScanning(false);
    }
  };

  const verify = async (id, verified) => {
    try {
      await attendanceService.verify(id, verified);
      setNotice(`Attendance ${verified ? 'verified' : 'rejected'}!`);
      setTimeout(() => setNotice(''), 3000);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Verification failed.');
    }
  };

  const checkout = async (id) => {
    try {
      await attendanceService.checkOut(id);
      setNotice('Worker checked out! Worked duration & shift category calculated.');
      setTimeout(() => setNotice(''), 3000);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Check-out failed.');
    }
  };

  const safeRows = useMemo(() => (Array.isArray(rows) ? rows.filter(Boolean) : []), [rows]);

  const filtered = useMemo(() => {
    return safeRows.filter(r => {
      if (!r) return false;
      const q = search.trim().toLowerCase();
      const cat = getAttendanceWorkflowCategory(r);
      const matchSearch = !q || [r.workerName, r.projectName, r.status, r.verificationStatus, cat.label].some(v => String(v || '').toLowerCase().includes(q));
      
      let matchStatus = true;
      if (statusFilter === 'SESSION_OPEN') matchStatus = !r.checkOut;
      else if (statusFilter === 'FULL_DAY') matchStatus = cat.key === 'FULL_DAY';
      else if (statusFilter === 'OVERTIME') matchStatus = cat.key === 'OVERTIME';
      else if (statusFilter === 'EARLY_LEAVE') matchStatus = cat.key === 'EARLY_LEAVE';
      else if (statusFilter === 'PENDING_VERIFY') matchStatus = r.verificationStatus === 'PENDING';
      else if (statusFilter !== 'ALL') matchStatus = String(r.status || '').toUpperCase() === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [safeRows, search, statusFilter]);

  // Workflow Category KPI Metrics
  const activeSessionCount = safeRows.filter(r => !r.checkOut).length;
  const fullDayCount = safeRows.filter(r => {
    const cat = getAttendanceWorkflowCategory(r);
    return cat.key === 'FULL_DAY';
  }).length;
  const overtimeCount = safeRows.filter(r => {
    const cat = getAttendanceWorkflowCategory(r);
    return cat.key === 'OVERTIME';
  }).length;
  const earlyLeaveCount = safeRows.filter(r => {
    const cat = getAttendanceWorkflowCategory(r);
    return cat.key === 'EARLY_LEAVE';
  }).length;
  const pendingVerification = safeRows.filter(r => r?.verificationStatus === 'PENDING').length;

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--blue)', fontWeight: 700 }}>
            <UserCheck size={14} /> Site Attendance & Shift Workflow
          </p>
        </div>
        <button type="button" className="secondary-button" onClick={load} disabled={loading}>
          <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} /> Refresh
        </button>
      </section>

      {notice && (
        <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, color: 'var(--green)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={16} /> {notice}
        </div>
      )}
      {error && (
        <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, color: 'var(--red)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Workflow Shift KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14, marginTop: 20 }}>
        {[
          { label: 'Session OPEN (Active)', value: activeSessionCount, color: 'var(--blue)', icon: Clock, sub: 'Currently logged in on site' },
          { label: 'Full Day Completed (= 8 hrs)', value: fullDayCount, color: 'var(--green)', icon: CheckCircle2, sub: '8.0 hrs standard shift' },
          { label: 'Overtime Calculated (> 8 hrs)', value: overtimeCount, color: 'var(--purple)', icon: Award, sub: 'Overtime hours logged' },
          { label: 'Early Leave / Short (< 8 hrs)', value: earlyLeaveCount, color: 'var(--orange)', icon: AlertTriangle, sub: 'Departed before 8 hours' },
          { label: 'Pending Verification', value: pendingVerification, color: 'var(--orange)', icon: ShieldCheck, sub: 'Requires Site Engineer review' },
        ].map(({ label, value, color, icon: Icon, sub }) => (
          <div key={label} className="panel" style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700 }}>{label}</span>
              <Icon size={16} style={{ color }} />
            </div>
            <h2 style={{ fontSize: 22, color, margin: '6px 0 2px 0', fontWeight: 800 }}>{value}</h2>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>{sub}</span>
          </div>
        ))}
      </div>

      {/* QR Code Check-in Panel */}
      <form onSubmit={scanQr} className="panel" style={{ marginTop: 20, padding: 22, background: 'var(--panel-soft)', borderRadius: 14 }}>
        <h3 style={{ margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700 }}>
          <QrCode size={18} style={{ color: 'var(--blue)' }} /> QR Code / Token Worker Check-In (Open Session)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr auto', gap: 12, alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Project Site *</label>
            <select required style={INPUT} value={projectId} onChange={e => setProjectId(e.target.value)}>
              <option value="">Select Project</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Scan / Input Worker QR Code Token *</label>
            <input required style={INPUT} placeholder="e.g. QR-WRK-90812 or Worker ID" value={token} onChange={e => setToken(e.target.value)} />
          </div>
          <button type="submit" className="primary-button" disabled={scanning || !token.trim()}>
            {scanning ? 'Opening Session...' : 'Check-In (Open Session)'}
          </button>
        </div>
      </form>

      {/* Search & Filter Toolbar */}
      <div className="panel" style={{ marginTop: 16, padding: '12px 16px', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-box" style={{ flex: 1, minWidth: 220 }}>
          <Search size={15} />
          <input placeholder="Search worker, site, duration category, verification..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13, fontWeight: 600 }}>
          <option value="ALL">All Categories & Records</option>
          <option value="SESSION_OPEN">Session OPEN (Active On Site)</option>
          <option value="FULL_DAY">Full Day Completed (= 8 hrs)</option>
          <option value="OVERTIME">Overtime Calculated (&gt; 8 hrs)</option>
          <option value="EARLY_LEAVE">Early Leave / Short Hours (&lt; 8 hrs)</option>
          <option value="PENDING_VERIFY">Pending Verification</option>
        </select>
        <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>{filtered.length} entries</span>
      </div>

      {/* Table */}
      <div className="panel" style={{ marginTop: 14, padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 920, borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--panel-soft)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                {['Worker', 'Project Site', 'Check In', 'Check Out', 'Hours Worked', 'Work Duration / Category', 'Status', 'Verification', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={9} style={{ padding: 30, textAlign: 'center', color: 'var(--muted)' }}>Loading site attendance…</td></tr>}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={9} style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>No attendance records found.</td></tr>
              )}
              {!loading && filtered.map(r => {
                const cat = getAttendanceWorkflowCategory(r);
                return (
                  <tr key={r.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700 }}>{r.workerName || '—'}</td>
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
                    <td style={{ padding: 14 }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {!r.checkOut && (
                          <button className="primary-button" style={{ fontSize: 11, padding: '4px 10px', background: 'var(--red)' }} onClick={() => checkout(r.id)}>
                            Check Out
                          </button>
                        )}
                        {r.verificationStatus === 'PENDING' && (
                          <>
                            <button className="primary-button" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => verify(r.id, true)}>
                              <CheckCircle2 size={12} /> Verify
                            </button>
                            <button className="secondary-button" style={{ fontSize: 11, padding: '4px 8px', color: 'var(--red)' }} onClick={() => verify(r.id, false)}>
                              <XCircle size={12} /> Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
