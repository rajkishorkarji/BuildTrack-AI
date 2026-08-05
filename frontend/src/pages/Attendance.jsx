import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { QrCode, CheckCircle2, Clock, Calendar, Search } from 'lucide-react';

export default function Attendance() {
  const { attendanceLogs, recordAttendance } = useData();
  const { user } = useAuth();
  const [workerName, setWorkerName] = useState(user?.fullName || '');
  const [notice, setNotice] = useState('');

  const handleClockIn = (e) => {
    e.preventDefault();
    if (!workerName.trim()) return;

    recordAttendance({
      workerName: workerName.trim(),
      station: 'Site QR Station 1',
    });

    setNotice(`Attendance verified for ${workerName}! Clock-in logged.`);
    setTimeout(() => setNotice(''), 3500);
  };

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow">Biometric & QR Shift Verification</p>
          <h1>Field Attendance ({attendanceLogs.length})</h1>
        </div>
      </section>

      {notice && (
        <div style={{ background: 'rgba(36, 196, 107, 0.15)', border: '1px solid var(--green)', color: 'var(--green)', padding: '12px 18px', borderRadius: '10px', fontWeight: 600, fontSize: '14px', marginTop: '16px' }}>
          {notice}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        {/* Instant QR Check In Form */}
        <div className="panel" style={{ padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <QrCode size={48} style={{ color: 'var(--blue)', marginBottom: '12px' }} />
          <h2 style={{ fontSize: '18px', marginBottom: '4px' }}>Instant Shift Check-In</h2>
          <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '16px' }}>
            Verify shift attendance via digital biometric terminal.
          </p>
          <form onSubmit={handleClockIn} style={{ width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="text"
              placeholder="Enter worker name"
              value={workerName}
              onChange={(e) => setWorkerName(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)', textAlign: 'center' }}
            />
            <button type="submit" className="primary-button full-width" style={{ background: 'var(--green)' }}>
              ✓ Clock In Shift Attendance
            </button>
          </form>
        </div>

        {/* Live Shift Attendance Table */}
        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={20} style={{ color: 'var(--blue)' }} /> Shift Attendance Logs
          </h3>

          {attendanceLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--muted)', fontSize: '13px' }}>
              No attendance logs recorded for today&apos;s shift yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {attendanceLogs.map((log) => (
                <div key={log.id} style={{ background: 'var(--panel-soft)', padding: '12px 16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '14px', color: 'var(--text)' }}>{log.workerName}</strong>
                    <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block' }}>{log.station}</span>
                  </div>
                  <span className="schedule-pill" style={{ background: 'rgba(36, 196, 107, 0.15)', color: 'var(--green)' }}>
                    ✓ {log.timeIn}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
