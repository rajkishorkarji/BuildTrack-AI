import { useState, useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import attendanceService from '../../services/attendanceService';
import { realtimeBus } from '../../services/api';
import { Clock, Search, RefreshCw, CheckCircle2, AlertTriangle, UserCheck, Award, ShieldCheck } from 'lucide-react';
import { getAttendanceWorkflowCategory } from '../../utils/attendanceWorkflow';

export default function ContractorAttendance() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await attendanceService.list();
      setRows(Array.isArray(data) ? data.filter(Boolean) : []);
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

  const safeRows = useMemo(() => (Array.isArray(rows) ? rows.filter(Boolean) : []), [rows]);

  const filteredLogs = useMemo(() => {
    return safeRows.filter(log => {
      if (!log) return false;
      const q = search.trim().toLowerCase();
      const cat = getAttendanceWorkflowCategory(log);
      const matchSearch = !q || [log.workerName, log.projectName, log.status, log.verificationStatus, cat.label].some(v => String(v || '').toLowerCase().includes(q));
      
      let matchStatus = true;
      if (statusFilter === 'SESSION_OPEN') matchStatus = !log.checkOut;
      else if (statusFilter === 'FULL_DAY') matchStatus = cat.key === 'FULL_DAY';
      else if (statusFilter === 'OVERTIME') matchStatus = cat.key === 'OVERTIME';
      else if (statusFilter === 'EARLY_LEAVE') matchStatus = cat.key === 'EARLY_LEAVE';
      else if (statusFilter === 'VERIFIED') matchStatus = log.verificationStatus === 'VERIFIED';
      else if (statusFilter !== 'ALL') matchStatus = String(log.status || '').toUpperCase() === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [safeRows, search, statusFilter]);

  // Workflow KPI Metrics
  const activeSessionCount = safeRows.filter(l => !l.checkOut).length;
  const fullDayCount = safeRows.filter(l => getAttendanceWorkflowCategory(l).key === 'FULL_DAY').length;
  const overtimeCount = safeRows.filter(l => getAttendanceWorkflowCategory(l).key === 'OVERTIME').length;
  const earlyLeaveCount = safeRows.filter(l => getAttendanceWorkflowCategory(l).key === 'EARLY_LEAVE').length;

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--blue)', fontWeight: 700 }}>
            <Clock size={14} /> Subcontractor Attendance Monitor (View Only)
          </p>
        </div>
        <button type="button" className="secondary-button" onClick={load} disabled={loading}>
          <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} /> Refresh Realtime
        </button>
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

      {/* Workflow Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14, marginTop: 18 }}>
        {[
          { label: 'Session OPEN (Active)', value: activeSessionCount, color: 'var(--blue)', icon: Clock, sub: 'Currently on site' },
          { label: 'Full Day Completed (= 8 hrs)', value: fullDayCount, color: 'var(--green)', icon: CheckCircle2, sub: '8.0 hrs shift completed' },
          { label: 'Overtime Calculated (> 8 hrs)', value: overtimeCount, color: 'var(--purple)', icon: Award, sub: 'Overtime hours logged' },
          { label: 'Early Leave / Short (< 8 hrs)', value: earlyLeaveCount, color: 'var(--orange)', icon: AlertTriangle, sub: 'Left before 8 hrs' },
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

      {/* Search & Filter */}
      <div className="panel" style={{ marginTop: 16, padding: '12px 16px', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-box" style={{ flex: 1, minWidth: 220 }}>
          <Search size={15} />
          <input placeholder="Search worker, site, category, status..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13, fontWeight: 600 }}
        >
          <option value="ALL">All Categories & Records</option>
          <option value="SESSION_OPEN">Session OPEN (Active On Site)</option>
          <option value="FULL_DAY">Full Day Completed (= 8 hrs)</option>
          <option value="OVERTIME">Overtime Calculated (&gt; 8 hrs)</option>
          <option value="EARLY_LEAVE">Early Leave / Short Hours (&lt; 8 hrs)</option>
          <option value="VERIFIED">Verified Records</option>
        </select>
        <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>{filteredLogs.length} entries</span>
      </div>

      {/* Attendance Table (View Only) */}
      <div className="panel" style={{ marginTop: 14, padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 880, borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--panel-soft)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                {['Worker Name', 'Assigned Site', 'Check In', 'Check Out', 'Hours Worked', 'Work Duration / Category', 'Status', 'Verification'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={8} style={{ padding: 30, textAlign: 'center', color: 'var(--muted)' }}>Loading crew attendance…</td></tr>}
              {!loading && filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
                    No team attendance logs recorded.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const cat = getAttendanceWorkflowCategory(log);
                  return (
                    <tr key={log.id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                        <div style={{ color: 'var(--text)' }}>{log.workerName || '—'}</div>
                      </td>
                      <td style={{ padding: 14, color: 'var(--blue)', fontWeight: 600 }}>{log.projectName || '—'}</td>
                      <td style={{ padding: 14, color: 'var(--green)', fontWeight: 700 }}>{log.checkIn ? new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                      <td style={{ padding: 14, color: log.checkOut ? 'var(--muted)' : 'var(--blue)', fontWeight: 600 }}>{log.checkOut ? new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active On Site'}</td>
                      <td style={{ padding: 14, fontWeight: 700 }}>{log.hoursWorked != null ? `${log.hoursWorked} hrs` : (log.checkOut ? '—' : 'In Progress')}</td>
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
                          {log.status || 'PRESENT'}
                        </span>
                      </td>
                      <td style={{ padding: 14 }}>
                        <span style={{
                          padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                          background: log.verificationStatus === 'VERIFIED' ? 'rgba(34,197,94,0.12)' : log.verificationStatus === 'REJECTED' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
                          color: log.verificationStatus === 'VERIFIED' ? 'var(--green)' : log.verificationStatus === 'REJECTED' ? 'var(--red)' : 'var(--orange)',
                        }}>
                          {log.verificationStatus || 'PENDING'}
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
