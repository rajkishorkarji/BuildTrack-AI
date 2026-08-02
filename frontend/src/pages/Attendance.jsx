import { useState } from 'react';
import { QrCode, CheckCircle, Clock, Calendar, AlertCircle } from 'lucide-react';

const initialLogs = [
  { id: 1, workerName: 'Rose Smith', trade: 'Senior Mason', checkIn: '08:12 AM', checkOut: '04:15 PM', hours: 8.0, status: 'Present', date: '2025-06-21' },
  { id: 2, workerName: 'Robert Fox', trade: 'Structural Welder', checkIn: '08:25 AM', checkOut: '03:30 PM', hours: 7.0, status: 'Present', date: '2025-06-21' },
  { id: 3, workerName: 'Ronald Richards', trade: 'Heavy Equipment Operator', checkIn: '07:45 AM', checkOut: '05:45 PM', hours: 10.0, status: 'Overtime', date: '2025-06-21' },
  { id: 4, workerName: 'Theresa Webb', trade: 'Electrician', checkIn: '-', checkOut: '-', hours: 0.0, status: 'Absent', date: '2025-06-21' },
];

export default function Attendance() {
  const [logs, setLogs] = useState(initialLogs);
  const [showQrModal, setShowQrModal] = useState(false);
  const [scannedToken, setScannedToken] = useState('');
  const [scanMessage, setScanMessage] = useState('');

  const handleSimulateScan = () => {
    if (!scannedToken) return;
    const newLog = {
      id: logs.length + 1,
      workerName: `Worker (${scannedToken})`,
      trade: 'Site Worker',
      checkIn: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      checkOut: 'In Progress',
      hours: 8.0,
      status: 'Present',
      date: new Date().toISOString().split('T')[0],
    };
    setLogs([newLog, ...logs]);
    setScanMessage(`Attendance verified for token ${scannedToken}! Clock-in recorded.`);
    setTimeout(() => {
      setShowQrModal(false);
      setScannedToken('');
      setScanMessage('');
    }, 1500);
  };

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow">Digital Site Check-In</p>
          <h1>QR Code Attendance System</h1>
        </div>
        <button type="button" className="primary-button" onClick={() => setShowQrModal(true)}>
          <QrCode size={16} /> Scan QR Attendance
        </button>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Total Present Today</span>
          <h2 style={{ fontSize: '26px', color: 'var(--green)', marginTop: '6px' }}>134 / 140</h2>
        </div>
        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>On Time Check-ins</span>
          <h2 style={{ fontSize: '26px', color: 'var(--blue)', marginTop: '6px' }}>94.2%</h2>
        </div>
        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Overtime Hours</span>
          <h2 style={{ fontSize: '26px', color: 'var(--orange)', marginTop: '6px' }}>18.5 Hrs</h2>
        </div>
      </div>

      <div className="panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Daily Attendance Log (Today)</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: 'var(--panel-soft)', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '14px 20px' }}>Worker</th>
              <th style={{ padding: '14px 20px' }}>Trade</th>
              <th style={{ padding: '14px 20px' }}>Clock In</th>
              <th style={{ padding: '14px 20px' }}>Clock Out</th>
              <th style={{ padding: '14px 20px' }}>Total Hours</th>
              <th style={{ padding: '14px 20px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text)' }}>{log.workerName}</td>
                <td style={{ padding: '14px 20px', color: 'var(--muted)' }}>{log.trade}</td>
                <td style={{ padding: '14px 20px' }}>{log.checkIn}</td>
                <td style={{ padding: '14px 20px' }}>{log.checkOut}</td>
                <td style={{ padding: '14px 20px', fontWeight: 600 }}>{log.hours} hrs</td>
                <td style={{ padding: '14px 20px' }}>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: log.status === 'Present' ? 'rgba(36, 196, 107, 0.15)' : log.status === 'Overtime' ? 'rgba(245, 154, 22, 0.15)' : 'rgba(239, 82, 82, 0.15)',
                      color: log.status === 'Present' ? 'var(--green)' : log.status === 'Overtime' ? 'var(--orange)' : 'var(--red)',
                    }}
                  >
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showQrModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="panel" style={{ width: '100%', maxWidth: '420px', padding: '28px', textAlign: 'center' }}>
            <QrCode size={48} style={{ color: 'var(--blue)', marginBottom: '12px' }} />
            <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>Scan Worker QR Code</h2>
            <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '20px' }}>
              Hold worker badge QR code in front of camera or enter token manually.
            </p>

            {scanMessage && (
              <div style={{ background: 'rgba(36, 196, 107, 0.15)', color: 'var(--green)', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
                {scanMessage}
              </div>
            )}

            <input
              type="text"
              placeholder="Enter QR Token e.g. QR-WRK-001"
              value={scannedToken}
              onChange={(e) => setScannedToken(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)', marginBottom: '16px' }}
            />

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button type="button" onClick={() => setShowQrModal(false)} style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="button" className="primary-button" onClick={handleSimulateScan}>
                Verify Clock-In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
