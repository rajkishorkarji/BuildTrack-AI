import { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Key,
  Globe,
  AlertOctagon,
  RefreshCw,
  Sliders,
  CheckCircle2,
  XCircle,
  Eye,
} from 'lucide-react';

const activeSessions = [
  { id: 1, user: 'System Master Admin (superadmin@buildtrack.ai)', ip: '103.24.120.44', location: 'Bhubaneswar, IN', device: 'Chrome on Windows 11', time: 'Active now' },
  { id: 2, user: 'Rajkishor Karji (rajkishor@buildtrack.ai)', ip: '182.73.44.12', location: 'Bhubaneswar, IN', device: 'Firefox on macOS', time: '12 mins ago' },
  { id: 3, user: 'Vikram Nair (vikram@buildtrack.ai)', ip: '49.36.210.99', location: 'Bengaluru, IN', device: 'Safari on iPhone 15 Pro', time: '45 mins ago' },
];

const failedLogins = [
  { id: 101, attemptedEmail: 'admin@buildtrack.ai', ip: '198.51.100.22', location: 'Frankfurt, DE', reason: 'Invalid Password (3 attempts)', timestamp: '2026-08-03 08:30:14' },
  { id: 102, attemptedEmail: 'root@buildtrack.ai', ip: '203.0.113.88', location: 'Moscow, RU', reason: 'User Not Found (Automated Bot)', timestamp: '2026-08-03 07:15:02' },
];

const blockedIPs = [
  { id: 201, ip: '198.51.100.22', origin: 'Frankfurt, DE', reason: 'Brute Force Attack Detected', addedOn: '2026-08-03' },
  { id: 202, ip: '203.0.113.88', origin: 'Moscow, RU', reason: 'Credential Stuffing Bot', addedOn: '2026-08-03' },
];

export default function SecurityCenter() {
  const [sessions, setSessions] = useState(activeSessions);
  const [blocked, setBlocked] = useState(blockedIPs);
  const [notice, setNotice] = useState('');
  const [jwtExpiry, setJwtExpiry] = useState('24h');
  const [rateLimit, setRateLimit] = useState('100 req / min');
  const [twoFactorRequired, setTwoFactorRequired] = useState(true);

  const notify = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3500);
  };

  const handleRevokeSession = (id) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    notify('Revoked active user session successfully!');
  };

  const handleUnblockIP = (id) => {
    setBlocked((prev) => prev.filter((b) => b.id !== id));
    notify('Unblocked IP address from firewall.');
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <p className="eyebrow" style={{ color: 'var(--blue)', fontWeight: 600 }}>PLATFORM DEFENSE</p>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Security Center & Threat Protection</h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '4px' }}>
            System Admin security vault: manage active sessions, IP firewall blocks, JWT parameters, and OAuth security.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          style={{ background: 'var(--purple)', display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={() => notify('Triggered Platform Security Scan: 0 vulnerabilities found')}
        >
          <ShieldCheck size={16} /> Run Security Scan
        </button>
      </div>

      {notice && (
        <div style={{ background: 'rgba(36, 196, 107, 0.15)', border: '1px solid var(--green)', color: 'var(--green)', padding: '12px 18px', borderRadius: '10px', fontWeight: 600, fontSize: '14px' }}>
          {notice}
        </div>
      )}

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="panel" style={{ padding: '18px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Active User Sessions</span>
          <h2 style={{ fontSize: '26px', color: 'var(--green)', marginTop: '4px' }}>{sessions.length} Sessions</h2>
          <small style={{ color: 'var(--muted)' }}>Zero suspicious activity</small>
        </div>
        <div className="panel" style={{ padding: '18px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Failed Logins (24h)</span>
          <h2 style={{ fontSize: '26px', color: 'var(--orange)', marginTop: '4px' }}>{failedLogins.length} Attempts</h2>
          <small style={{ color: 'var(--orange)' }}>Blocked by WAF</small>
        </div>
        <div className="panel" style={{ padding: '18px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Firewall Blocked IPs</span>
          <h2 style={{ fontSize: '26px', color: 'var(--red)', marginTop: '4px' }}>{blocked.length} IPs</h2>
          <small style={{ color: 'var(--red)' }}>Auto-banned</small>
        </div>
        <div className="panel" style={{ padding: '18px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>SSL / TLS Compliance</span>
          <h2 style={{ fontSize: '26px', color: 'var(--blue)', marginTop: '4px' }}>TLS v1.3</h2>
          <small style={{ color: 'var(--green)' }}>256-bit Encryption</small>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Left column: Active Sessions & Failed Logins */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Active Sessions */}
          <div className="panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={18} style={{ color: 'var(--blue)' }} /> Active User Sessions
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '10px' }}>User</th>
                    <th style={{ padding: '10px' }}>IP & Location</th>
                    <th style={{ padding: '10px' }}>Device</th>
                    <th style={{ padding: '10px' }}>Activity</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 10px', fontWeight: 600 }}>{s.user}</td>
                      <td style={{ padding: '12px 10px', color: 'var(--muted)' }}>
                        {s.ip} <br /> <small>{s.location}</small>
                      </td>
                      <td style={{ padding: '12px 10px' }}>{s.device}</td>
                      <td style={{ padding: '12px 10px', color: 'var(--green)', fontWeight: 600 }}>{s.time}</td>
                      <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                        <button
                          type="button"
                          className="secondary-button"
                          style={{ padding: '4px 8px', fontSize: '12px', color: 'var(--red)' }}
                          onClick={() => handleRevokeSession(s.id)}
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Failed Logins & Threat Log */}
          <div className="panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} style={{ color: 'var(--orange)' }} /> Recent Failed Login Attempts
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '10px' }}>Target Email</th>
                    <th style={{ padding: '10px' }}>Origin IP</th>
                    <th style={{ padding: '10px' }}>Failure Reason</th>
                    <th style={{ padding: '10px' }}>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {failedLogins.map((f) => (
                    <tr key={f.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 10px', fontWeight: 600, color: 'var(--red)' }}>{f.attemptedEmail}</td>
                      <td style={{ padding: '12px 10px' }}>{f.ip} ({f.location})</td>
                      <td style={{ padding: '12px 10px', color: 'var(--orange)' }}>{f.reason}</td>
                      <td style={{ padding: '12px 10px', color: 'var(--muted)', fontSize: '12px' }}>{f.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column: Security Configurations & Firewall */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* JWT & Policy Controls */}
          <div className="panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={18} style={{ color: 'var(--purple)' }} /> Auth & Policy Settings
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>JWT Access Token Expiry</label>
                <select
                  value={jwtExpiry}
                  onChange={(e) => {
                    setJwtExpiry(e.target.value);
                    notify('Updated JWT Access Token Expiry setting.');
                  }}
                  style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)' }}
                >
                  <option value="1h">1 Hour (Strict Security)</option>
                  <option value="12h">12 Hours</option>
                  <option value="24h">24 Hours (Recommended)</option>
                  <option value="7d">7 Days</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>API Gateway Rate Limit</label>
                <select
                  value={rateLimit}
                  onChange={(e) => {
                    setRateLimit(e.target.value);
                    notify('Updated API Gateway Rate Limiting threshold.');
                  }}
                  style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)' }}
                >
                  <option value="60 req / min">60 req / min</option>
                  <option value="100 req / min">100 req / min (Default)</option>
                  <option value="300 req / min">300 req / min (High Traffic)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <div>
                  <strong style={{ display: 'block' }}>Mandatory 2FA for Admins</strong>
                  <span style={{ color: 'var(--muted)', fontSize: '12px' }}>Enforce TOTP for Super & Company Admins</span>
                </div>
                <input
                  type="checkbox"
                  checked={twoFactorRequired}
                  onChange={(e) => {
                    setTwoFactorRequired(e.target.checked);
                    notify(`Enforce 2FA set to ${e.target.checked ? 'ENABLED' : 'DISABLED'}`);
                  }}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>

          {/* Blocked IPs */}
          <div className="panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertOctagon size={18} style={{ color: 'var(--red)' }} /> Blocked IP Firewall
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              {blocked.map((b) => (
                <div key={b.id} style={{ padding: '12px', borderRadius: '8px', background: 'var(--panel-soft)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: 'var(--red)' }}>{b.ip}</strong>
                    <div style={{ color: 'var(--muted)', fontSize: '12px' }}>{b.reason}</div>
                  </div>
                  <button
                    type="button"
                    className="secondary-button"
                    style={{ padding: '4px 8px', fontSize: '11px' }}
                    onClick={() => handleUnblockIP(b.id)}
                  >
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
