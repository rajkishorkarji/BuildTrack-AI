import { useState } from 'react';
import { QrCode, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export default function WorkerAttendance() {
  const { user } = useAuth();
  const { attendanceLogs = [], logWorkerCheckIn, logWorkerCheckOut, projects = [] } = useData();
  const [notice, setNotice] = useState('');
  const workerName = user?.fullName || 'Worker';

  const history = attendanceLogs
    .filter((entry) => !entry.workerName || entry.workerName === workerName)
    .map((entry) => ({
      id: entry.id,
      date: entry.date || (entry.checkIn ? new Date(entry.checkIn).toLocaleDateString() : 'Today'),
      checkIn: entry.checkInTime || (entry.checkIn ? new Date(entry.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'),
      checkOut: entry.checkOutTime || (entry.checkOut ? new Date(entry.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'),
      status: String(entry.status || 'Present').replace(/_/g, ' '),
    }));
  const activeLog = history.find((entry) => entry.checkOut === 'Active On Site' || entry.checkOut === '—');
  const isCheckedIn = Boolean(activeLog);

  const toggleCheckIn = () => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isCheckedIn) {
      logWorkerCheckOut(activeLog.id);
      setNotice(`Checked out at ${time}. Your team can see the completed shift now.`);
    } else {
      logWorkerCheckIn(workerName, projects[0]?.name);
      setNotice(`Checked in at ${time}. Your site team has been notified.`);
    }
    window.setTimeout(() => setNotice(''), 3000);
  };

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div><p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--blue)', fontWeight: 700 }}><UserCheck size={14} /> Attendance</p></div>
      </section>

      {notice && <div style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid var(--green)', color: 'var(--green)', padding: '12px 18px', borderRadius: 10, fontWeight: 700, fontSize: 14, marginTop: 16 }}>{notice}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginTop: 20 }}>
        <div className="panel" style={{ padding: 28, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: isCheckedIn ? 'rgba(34,197,94,0.15)' : 'rgba(37,99,235,0.15)', color: isCheckedIn ? 'var(--green)' : 'var(--blue)', display: 'grid', placeItems: 'center', marginBottom: 14 }}><QrCode size={32} /></div>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Daily QR Attendance</h3>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 20 }}>Your check-in and check-out are shared instantly with the contractor, site engineer, and project manager.</p>
          <button type="button" className="primary-button" onClick={toggleCheckIn} style={{ width: '100%', padding: 12, fontSize: 14, fontWeight: 800, background: isCheckedIn ? '#EF4444' : 'var(--blue)' }}>{isCheckedIn ? 'Check Out of Shift' : 'Check In for Shift'}</button>
        </div>

        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', fontWeight: 700, borderBottom: '1px solid var(--border)' }}>Attendance History</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
            <thead><tr style={{ background: 'var(--panel-soft)', color: 'var(--muted)' }}><th style={{ padding: '12px 18px' }}>Date</th><th style={{ padding: 12 }}>Check in</th><th style={{ padding: 12 }}>Check out</th><th style={{ padding: '12px 18px' }}>Status</th></tr></thead>
            <tbody>{history.length ? history.map((entry) => <tr key={entry.id} style={{ borderBottom: '1px solid var(--border)' }}><td style={{ padding: '12px 18px', fontWeight: 700 }}>{entry.date}</td><td style={{ padding: 12 }}>{entry.checkIn}</td><td style={{ padding: 12, color: 'var(--muted)' }}>{entry.checkOut}</td><td style={{ padding: '12px 18px' }}><span style={{ padding: '3px 8px', borderRadius: 8, background: 'rgba(34,197,94,0.12)', color: 'var(--green)', fontSize: 11, fontWeight: 700 }}>{entry.status}</span></td></tr>) : <tr><td colSpan={4} style={{ padding: 28, textAlign: 'center', color: 'var(--muted)' }}>No attendance recorded yet.</td></tr>}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
