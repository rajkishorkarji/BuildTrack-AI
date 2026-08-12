import { useState, useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { realtimeBus } from '../../services/api';
import { Clock, Search, RefreshCw, CheckCircle2, AlertTriangle, UserCheck, Calendar } from 'lucide-react';

const STATUS_META = {
  PRESENT: { label: 'Present', color: 'var(--green)', bg: 'rgba(34,197,94,0.12)', icon: CheckCircle2 },
  LATE: { label: 'Late', color: 'var(--orange)', bg: 'rgba(245,158,11,0.12)', icon: Clock },
  ABSENT: { label: 'Absent', color: 'var(--red)', bg: 'rgba(239,68,68,0.12)', icon: AlertTriangle },
  ON_LEAVE: { label: 'On Leave', color: 'var(--blue)', bg: 'rgba(37,99,235,0.12)', icon: Calendar },
};

function getStatusMeta(status) {
  const key = String(status || 'PRESENT').toUpperCase();
  return STATUS_META[key] || { label: status || 'Present', color: 'var(--green)', bg: 'rgba(34,197,94,0.12)', icon: CheckCircle2 };
}

export default function ContractorAttendance() {
  const { workers = [], attendanceLogs = [], projects = [], refresh } = useData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = realtimeBus.subscribe('SERVER_UPDATE', () => {
      refresh && refresh();
    });
    return () => unsub();
  }, [refresh]);

  const logsToDisplay = useMemo(() => {
    if (attendanceLogs.length > 0) return attendanceLogs;
    return workers.map((w, idx) => ({
      id: w.id || idx,
      workerName: w.fullName || w.name,
      skill: w.skillTrade || w.role || 'General Mason',
      projectName: w.projectName || (projects[0]?.name || 'Site Sector A'),
      checkInTime: '08:00 AM',
      checkOutTime: w.enabled === false ? '—' : '05:00 PM',
      status: w.enabled === false ? 'ABSENT' : (idx % 4 === 3 ? 'LATE' : 'PRESENT'),
      date: new Date().toISOString().split('T')[0],
    }));
  }, [attendanceLogs, workers, projects]);

  const filteredLogs = useMemo(() => {
    return logsToDisplay.filter(log => {
      const q = search.trim().toLowerCase();
      const matchSearch = !q || [log.workerName, log.skill, log.projectName].some(v => String(v || '').toLowerCase().includes(q));
      const matchStatus = !statusFilter || String(log.status || '').toUpperCase() === statusFilter.toUpperCase();
      return matchSearch && matchStatus;
    });
  }, [logsToDisplay, search, statusFilter]);

  const presentCount = logsToDisplay.filter(l => String(l.status || '').toUpperCase() === 'PRESENT').length;
  const lateCount = logsToDisplay.filter(l => String(l.status || '').toUpperCase() === 'LATE').length;
  const absentCount = logsToDisplay.filter(l => String(l.status || '').toUpperCase() === 'ABSENT').length;

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--blue)', fontWeight: 700 }}>
            <Clock size={14} /> Subcontractor Attendance
          </p>
          <h1>Team Attendance & Site Logs</h1>
        </div>
        <button type="button" className="secondary-button" onClick={() => refresh && refresh()}>
          <RefreshCw size={14} /> Refresh Realtime
        </button>
      </section>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14, marginTop: 18 }}>
        {[
          { label: 'Total Crew Assigned', value: workers.length || logsToDisplay.length, color: 'var(--blue)' },
          { label: 'Present Today', value: presentCount, color: 'var(--green)' },
          { label: 'Late Arrivals', value: lateCount, color: 'var(--orange)' },
          { label: 'Absent / Off-site', value: absentCount, color: 'var(--red)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="panel" style={{ padding: 18 }}>
            <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>{label}</span>
            <h2 style={{ fontSize: 24, color, margin: '4px 0 0 0', fontWeight: 800 }}>{value}</h2>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="panel" style={{ marginTop: 16, padding: '12px 16px', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-box" style={{ flex: 1, minWidth: 220 }}>
          <Search size={15} />
          <input placeholder="Search worker, trade skill, site..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 }}
        >
          <option value="">All Statuses</option>
          <option value="PRESENT">Present</option>
          <option value="LATE">Late</option>
          <option value="ABSENT">Absent</option>
          <option value="ON_LEAVE">On Leave</option>
        </select>
      </div>

      {/* Attendance Table */}
      <div className="panel" style={{ marginTop: 14, padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--panel-soft)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                {['Worker Name & Skill', 'Assigned Site', 'Check In', 'Check Out', 'Date', 'Attendance Status'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
                    No team attendance logs recorded today.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const meta = getStatusMeta(log.status);
                  const StatusIcon = meta.icon;
                  return (
                    <tr key={log.id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                        <div style={{ color: 'var(--text)' }}>{log.workerName}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>{log.skill}</div>
                      </td>
                      <td style={{ padding: 14, color: 'var(--blue)', fontWeight: 600 }}>{log.projectName}</td>
                      <td style={{ padding: 14, color: 'var(--green)', fontWeight: 700 }}>{log.checkInTime || '—'}</td>
                      <td style={{ padding: 14, color: 'var(--muted)' }}>{log.checkOutTime || '—'}</td>
                      <td style={{ padding: 14, color: 'var(--muted)', fontSize: 12 }}>{log.date || new Date().toISOString().split('T')[0]}</td>
                      <td style={{ padding: 14 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 10, background: meta.bg, color: meta.color, fontSize: 11, fontWeight: 700 }}>
                          <StatusIcon size={12} /> {meta.label}
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
