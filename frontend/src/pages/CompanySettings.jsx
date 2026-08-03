import { useState } from 'react';
import {
  Settings,
  Clock,
  Calendar,
  Sliders,
  Bell,
  Save,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export default function CompanySettings() {
  const [workingHours, setWorkingHours] = useState('08:00 AM - 05:00 PM');
  const [shiftCount, setShiftCount] = useState('2 Shifts (Day & Night)');
  const [allowQrAttendance, setAllowQrAttendance] = useState(true);
  const [allowManualAttendance, setAllowManualAttendance] = useState(true);
  const [requireGeoFence, setRequireGeoFence] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [notice, setNotice] = useState('');

  const notify = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3500);
  };

  const handleSave = (e) => {
    e.preventDefault();
    notify('Company working hours, shift rules & attendance settings saved!');
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <p className="eyebrow" style={{ color: 'var(--blue)', fontWeight: 600 }}>COMPANY GOVERNANCE</p>
        <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Company Operations & Attendance Rules</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '4px' }}>
          Configure enterprise working hours, shifts, attendance geo-fencing, holiday calendars, and notification rules.
        </p>
      </div>

      {notice && (
        <div style={{ background: 'rgba(36, 196, 107, 0.15)', border: '1px solid var(--green)', color: 'var(--green)', padding: '12px 18px', borderRadius: '10px', fontWeight: 600, fontSize: '14px' }}>
          {notice}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Panel 1: Shift & Working Hours */}
        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={20} style={{ color: 'var(--blue)' }} /> Shift & Working Hours Configuration
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>Standard Shift Duration</label>
              <input
                type="text"
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>Active Daily Shifts</label>
              <select
                value={shiftCount}
                onChange={(e) => setShiftCount(e.target.value)}
                style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)' }}
              >
                <option value="1 Shift (Day Only)">1 Shift (Day Only: 08:00 AM - 05:00 PM)</option>
                <option value="2 Shifts (Day & Night)">2 Shifts (Day & Night)</option>
                <option value="3 Shifts (24/7 Continuous)">3 Shifts (24/7 Continuous Site Operations)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Panel 2: Attendance Verification Rules */}
        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={20} style={{ color: 'var(--purple)' }} /> Attendance & Verification Rules
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--panel-soft)', padding: '12px 16px', borderRadius: '8px' }}>
              <div>
                <strong style={{ display: 'block' }}>Instant QR Code Attendance Check-In</strong>
                <span style={{ color: 'var(--muted)', fontSize: '12px' }}>Allow workers to scan QR code on site mobile terminal</span>
              </div>
              <input
                type="checkbox"
                checked={allowQrAttendance}
                onChange={(e) => setAllowQrAttendance(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--panel-soft)', padding: '12px 16px', borderRadius: '8px' }}>
              <div>
                <strong style={{ display: 'block' }}>Site Geo-Fencing Enforcement</strong>
                <span style={{ color: 'var(--muted)', fontSize: '12px' }}>Verify worker GPS coordinates match site boundary before clock-in</span>
              </div>
              <input
                type="checkbox"
                checked={requireGeoFence}
                onChange={(e) => setRequireGeoFence(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--panel-soft)', padding: '12px 16px', borderRadius: '8px' }}>
              <div>
                <strong style={{ display: 'block' }}>Supervisor Manual Attendance Fallback</strong>
                <span style={{ color: 'var(--muted)', fontSize: '12px' }}>Allow Site Engineers to manually log worker attendance</span>
              </div>
              <input
                type="checkbox"
                checked={allowManualAttendance}
                onChange={(e) => setAllowManualAttendance(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>

        {/* Panel 3: Notifications */}
        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={20} style={{ color: 'var(--green)' }} /> Company Alert Notifications
          </h3>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
            <div>
              <strong style={{ display: 'block' }}>Low Stock & Overdue Task Alerts</strong>
              <span style={{ color: 'var(--muted)', fontSize: '12px' }}>Send automated email notifications to Company Admin & PMs</span>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="primary-button" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Save size={16} /> Save Company Settings
          </button>
        </div>
      </form>
    </div>
  );
}
