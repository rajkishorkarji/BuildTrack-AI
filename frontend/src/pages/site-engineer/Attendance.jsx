import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  Users, CheckCircle2, XCircle, Clock, Calendar, Download,
  QrCode, AlertTriangle, ShieldCheck, Search, Filter, RefreshCw
} from 'lucide-react';

export default function SEAttendance() {
  const { workers = [], attendanceLogs = [], verifyAttendanceSE } = useData();
  const { user } = useAuth();

  const [recordMode, setRecordMode] = useState('daily'); // daily, monthly, history
  const [search, setSearch] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeInput, setQrCodeInput] = useState('');
  const [notice, setNotice] = useState('');

  // Default sample attendance records matching specification
  const initialRecords = [
    { id: 'rec-1', name: 'Rahul', role: 'Worker', checkIn: '08:05 AM', checkOut: '05:15 PM', status: 'Present', verifiedBy: 'Site Engineer', date: '2026-08-06', shift: 'Day Shift' },
    { id: 'rec-2', name: 'Aman', role: 'Contractor', checkIn: '08:12 AM', checkOut: '—', status: 'Present', verifiedBy: 'Site Engineer', date: '2026-08-06', shift: 'Day Shift' },
    { id: 'rec-3', name: 'Vikram Operator', role: 'Heavy Equipment Operator', checkIn: '08:25 AM', checkOut: '—', status: 'Present', verifiedBy: 'Site Engineer', date: '2026-08-06', shift: 'Day Shift' },
    { id: 'rec-4', name: 'Suresh Welder', role: 'Welder', checkIn: '08:45 AM', checkOut: '—', status: 'Late', verifiedBy: 'Site Engineer', date: '2026-08-06', shift: 'Day Shift' },
    { id: 'rec-5', name: 'Karan Loader', role: 'Worker', checkIn: '—', checkOut: '—', status: 'Absent', verifiedBy: 'Unverified', date: '2026-08-06', shift: 'Day Shift' },
  ];

  // Merge context attendance logs if present
  const mergedRecords = attendanceLogs.length > 0 ? attendanceLogs.map(l => ({
    id: l.id,
    name: l.workerName || l.fullName || 'Personnel',
    role: l.role || 'Worker',
    checkIn: l.checkInTime || '08:15 AM',
    checkOut: l.checkOutTime || '—',
    status: l.status || 'Present',
    verifiedBy: l.seVerified === 'Verified' ? 'Site Engineer' : (l.verifiedBy || 'Site Engineer'),
    date: l.date || '2026-08-06',
    shift: 'Day Shift',
  })) : initialRecords;

  const [records, setRecords] = useState(mergedRecords);

  const notify = (msg) => { setNotice(msg); setTimeout(() => setNotice(''), 4000); };

  // KPI Calculations
  const totalWorkforce = records.length;
  const presentToday = records.filter(r => r.status === 'Present' || r.status === 'Late').length;
  const absentToday = records.filter(r => r.status === 'Absent').length;
  const lateCheckIns = records.filter(r => r.status === 'Late' || r.checkIn > '08:30 AM').length;

  // Single Action: Verify Entry
  const handleVerifyEntry = (id) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, verifiedBy: 'Site Engineer', status: r.status === 'Absent' ? 'Present' : r.status } : r));
    if (verifyAttendanceSE) verifyAttendanceSE(id);
    notify(`Attendance entry verified by ${user?.fullName || 'Site Engineer'}.`);
  };

  // Single Action: Reject Invalid Entry
  const handleRejectEntry = (id) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: 'Invalid / Rejected', verifiedBy: 'Rejected by SE' } : r));
    notify(`Invalid attendance entry rejected.`);
  };

  // QR Attendance Verification
  const handleScanQR = (e) => {
    e.preventDefault();
    if (!qrCodeInput.trim()) return;
    const nameInput = qrCodeInput.trim();
    const newEntry = {
      id: Date.now().toString(),
      name: nameInput,
      role: 'Field Worker',
      checkIn: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      checkOut: '—',
      status: 'Present',
      verifiedBy: 'Site Engineer (QR Verified)',
      date: new Date().toISOString().slice(0, 10),
      shift: 'Day Shift',
    };
    setRecords([newEntry, ...records]);
    setShowQRModal(false);
    setQrCodeInput('');
    notify(`QR Attendance Verified for ${nameInput}! Status: Present (Verified by Site Engineer).`);
  };

  // Export CSV
  const exportCSV = () => {
    const headers = ['Employee', 'Role', 'Check-In', 'Check-Out', 'Status', 'Verified By', 'Shift', 'Date'];
    const rows = records.map(r => [
      `"${r.name}"`,
      `"${r.role}"`,
      `"${r.checkIn}"`,
      `"${r.checkOut}"`,
      `"${r.status}"`,
      `"${r.verifiedBy}"`,
      `"${r.shift}"`,
      `"${r.date}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const a = document.createElement('a');
    a.href = encodeURI(csvContent);
    a.download = `site_engineer_attendance_${recordMode}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const filteredRecords = records.filter(r =>
    (r.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.role || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.status || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-page">
      {/* Hero Title & Primary Actions */}
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <Clock size={14} /> Attendance
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" className="secondary-button" onClick={() => setShowQRModal(true)}>
            <QrCode size={16} /> Verify QR Attendance
          </button>
          <button type="button" className="primary-button" onClick={exportCSV}>
            <Download size={16} /> Export CSV
          </button>
        </div>
      </section>

      {notice && (
        <div style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid var(--green)', color: 'var(--green)', padding: '14px 18px', borderRadius: '12px', fontWeight: 700, fontSize: '14px', marginTop: '16px' }}>
          ✓ {notice}
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginTop: '20px' }}>
        {[
          { label: 'Total Workforce', value: totalWorkforce, sub: 'Assigned Site Personnel', color: 'var(--blue)', icon: Users },
          { label: 'Present Today', value: presentToday, sub: `${Math.round((presentToday / Math.max(1, totalWorkforce)) * 100)}% On Site`, color: 'var(--green)', icon: CheckCircle2 },
          { label: 'Absent', value: absentToday, sub: 'Unexcused Absences', color: 'var(--red)', icon: XCircle },
          { label: 'Late Check-ins', value: lateCheckIns, sub: 'After 08:30 AM Cutoff', color: 'var(--orange)', icon: Clock },
        ].map(({ label, value, sub, color, icon: Icon }) => (
          <div key={label} className="panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>{label}</span>
              <Icon size={18} style={{ color, opacity: 0.8 }} />
            </div>
            <div>
              <h2 style={{ fontSize: '24px', color, margin: '6px 0 2px 0', fontWeight: 800 }}>{value}</h2>
              <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 500 }}>{sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Attendance Records Controls Toolbar ── */}
      <div className="panel" style={{ marginTop: '24px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Record Mode Filter: Daily Attendance, Monthly Report, Attendance History */}
          <div style={{ display: 'flex', background: 'var(--panel-soft)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            {[
              ['daily', 'Daily Attendance'],
              ['monthly', 'Monthly Report'],
              ['history', 'Attendance History'],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setRecordMode(id)}
                style={{
                  padding: '6px 12px', border: 'none', borderRadius: '6px',
                  background: recordMode === id ? 'var(--blue)' : 'transparent',
                  color: recordMode === id ? '#fff' : 'var(--muted)',
                  fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="search-box" style={{ width: '260px' }}>
            <Search size={15} style={{ color: 'var(--muted)' }} />
            <input placeholder="Search employee name or role..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" className="secondary-button" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={exportCSV}>
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      {/* ── Attendance Records Table ── */}
      <div className="panel" style={{ marginTop: '16px', padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--panel-soft)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Employee</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Role</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Check-In</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Check-Out</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Verified By</th>
              <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
                  No attendance records found matching search query.
                </td>
              </tr>
            ) : (
              filteredRecords.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text)' }}>
                    {r.name}
                  </td>
                  <td style={{ padding: '14px', color: 'var(--blue)', fontWeight: 600 }}>
                    {r.role}
                  </td>
                  <td style={{ padding: '14px', fontWeight: 600, color: 'var(--text)' }}>
                    {r.checkIn}
                  </td>
                  <td style={{ padding: '14px', color: 'var(--muted)', fontWeight: 500 }}>
                    {r.checkOut}
                  </td>
                  <td style={{ padding: '14px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: r.status === 'Present' ? 'rgba(34,197,94,0.12)' : (r.status === 'Late' ? 'rgba(245,154,22,0.12)' : 'rgba(239,68,68,0.12)'),
                      color: r.status === 'Present' ? 'var(--green)' : (r.status === 'Late' ? 'var(--orange)' : 'var(--red)'),
                    }}>
                      {r.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldCheck size={15} style={{ color: 'var(--blue)' }} />
                      {r.verifiedBy}
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        type="button"
                        className="secondary-button"
                        style={{ fontSize: '11px', padding: '4px 8px', color: 'var(--green)' }}
                        onClick={() => handleVerifyEntry(r.id)}
                        title="Verify Entry"
                      >
                        Verify
                      </button>
                      <button
                        type="button"
                        className="secondary-button"
                        style={{ fontSize: '11px', padding: '4px 8px', color: '#EF4444' }}
                        onClick={() => handleRejectEntry(r.id)}
                        title="Reject Invalid Entry"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Verify QR Attendance Modal ── */}
      {showQRModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="panel" style={{ width: '100%', maxWidth: '440px', padding: '28px', borderRadius: '18px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '4px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <QrCode size={22} style={{ color: 'var(--blue)' }} /> Verify QR Attendance
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '18px' }}>Scan or enter worker ID / QR code badge for instant verification.</p>

            <form onSubmit={handleScanQR} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--muted)', marginBottom: '4px', fontWeight: 600 }}>Employee Name or QR Code Badge *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul (Worker QR-9021)"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
                  value={qrCodeInput}
                  onChange={e => setQrCodeInput(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="secondary-button" onClick={() => setShowQRModal(false)}>Cancel</button>
                <button type="submit" className="primary-button">Verify & Mark Present</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
