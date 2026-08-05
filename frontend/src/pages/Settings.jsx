import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import {
  User,
  Building2,
  ShieldCheck,
  Moon,
  Sun,
  LogOut,
  ExternalLink,
} from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { addCompany } = useData();

  const role = user?.role || 'SUPER_ADMIN';

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'company' | 'system'
  const [notice, setNotice] = useState('');

  // User Profile State synced with AuthContext user
  const [profile, setProfile] = useState({
    name: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    googleLinked: false,
  });

  useEffect(() => {
    if (user) {
      setProfile((prev) => ({
        ...prev,
        name: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
      }));
    }
  }, [user]);

  // Company Settings State
  const [company, setCompany] = useState({
    name: user?.companyName || '',
    gstNo: '',
    address: '',
    shiftTemplate: '1 Shift (Day Only)',
    overtimeMultiplier: '',
  });

  // System Admin State
  const [newCompanyName, setNewCompanyName] = useState('');
  const [rateLimit, setRateLimit] = useState(100);

  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isCompanyAdmin = role === 'COMPANY_ADMIN';

  const notify = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateUser({
      fullName: profile.name,
      email: profile.email,
      phone: profile.phone,
    });
    notify('User profile details updated successfully across the system.');
  };

  const handleRegisterCompany = (e) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;
    addCompany({ name: newCompanyName.trim() });
    notify(`New Tenant Company "${newCompanyName}" registered successfully! Total Companies updated.`);
    setNewCompanyName('');
  };

  return (
    <div className="dashboard-page">
      {/* Hero Header */}
      <section className="hero-row">
        <div>
          <p className="eyebrow">Platform Governance & Configuration</p>
          <h1>Settings & Administration</h1>
        </div>
      </section>

      {notice && (
        <div style={{ background: 'rgba(36, 196, 107, 0.15)', border: '1px solid var(--green)', color: 'var(--green)', padding: '12px 18px', borderRadius: '10px', fontWeight: 600, fontSize: '14px', marginTop: '16px' }}>
          {notice}
        </div>
      )}

      {/* Tabs Header */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'profile' ? 'var(--blue)' : 'var(--panel)',
            color: activeTab === 'profile' ? '#fff' : 'var(--muted)',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <User size={15} /> My Profile & Security
        </button>

        {(isCompanyAdmin || isSuperAdmin) && (
          <button
            type="button"
            onClick={() => setActiveTab('company')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'company' ? 'var(--blue)' : 'var(--panel)',
              color: activeTab === 'company' ? '#fff' : 'var(--muted)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Building2 size={15} /> Company Governance
          </button>
        )}

        {isSuperAdmin && (
          <button
            type="button"
            onClick={() => setActiveTab('system')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'system' ? 'var(--blue)' : 'var(--panel)',
              color: activeTab === 'system' ? '#fff' : 'var(--muted)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <ShieldCheck size={15} /> System Admin & Telemetry
          </button>
        )}
      </div>

      {/* TAB 1: USER PROFILE & OAUTH */}
      {activeTab === 'profile' && (
        <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Personal Profile Info</h3>
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div>
                <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Full Name</label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
                />
              </div>
              <div>
                <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Email Address</label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
                />
              </div>
              <div>
                <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Phone Number</label>
                <input
                  type="text"
                  placeholder="Enter phone number"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
                />
              </div>
              <button type="submit" className="primary-button" style={{ alignSelf: 'flex-start', marginTop: '6px' }}>
                Save Profile
              </button>
            </form>
          </div>

          <div className="panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Security & Account Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
              <div style={{ padding: '16px', background: 'var(--panel-soft)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>Google OAuth Account</strong>
                  <p style={{ color: 'var(--muted)', fontSize: '12px', margin: '2px 0 0 0' }}>
                    {profile.googleLinked ? `Linked: ${profile.email}` : 'Not linked'}
                  </p>
                </div>
                <button
                  type="button"
                  className="secondary-button"
                  style={{ fontSize: '12px' }}
                  onClick={() => {
                    setProfile({ ...profile, googleLinked: !profile.googleLinked });
                    notify(profile.googleLinked ? 'Google account unlinked.' : 'Google account linked!');
                  }}
                >
                  {profile.googleLinked ? 'Unlink Account' : 'Link Google Account'}
                </button>
              </div>

              <div style={{ padding: '16px', background: 'var(--panel-soft)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>Interface Theme</strong>
                  <p style={{ color: 'var(--muted)', fontSize: '12px', margin: '2px 0 0 0' }}>Current theme: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</p>
                </div>
                <button type="button" onClick={toggleTheme} className="secondary-button" style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />} Toggle Theme
                </button>
              </div>

              {/* Account Logout Option */}
              <div style={{ padding: '16px', background: 'var(--panel-soft)', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: 'var(--text)' }}>Account Session</strong>
                  <p style={{ color: 'var(--muted)', fontSize: '12px', margin: '2px 0 0 0' }}>Signed in as {user?.fullName || user?.email || 'User'}</p>
                </div>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleLogout}
                  style={{
                    color: 'var(--text)',
                    borderColor: 'var(--border)',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    fontWeight: 600,
                  }}
                >
                  <LogOut size={14} style={{ color: 'var(--muted)' }} /> Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COMPANY GOVERNANCE */}
      {activeTab === 'company' && (isCompanyAdmin || isSuperAdmin) && (
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '750px' }}>
          <div className="panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Company Information & Tax Settings</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (company.name) {
                  addCompany({ name: company.name, gstNo: company.gstNo, address: company.address });
                }
                notify('Company configuration updated.');
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}
            >
              <div>
                <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Company Legal Name</label>
                <input
                  type="text"
                  placeholder="Enter company legal name"
                  value={company.name}
                  onChange={(e) => setCompany({ ...company, name: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
                />
              </div>
              <div>
                <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>GST Tax Registration Number</label>
                <input
                  type="text"
                  placeholder="e.g. 21AAACS1234F1Z9"
                  value={company.gstNo}
                  onChange={(e) => setCompany({ ...company, gstNo: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
                />
              </div>
              <div>
                <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Default Shift Template</label>
                <select
                  value={company.shiftTemplate}
                  onChange={(e) => setCompany({ ...company, shiftTemplate: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
                >
                  <option value="1 Shift (Day Only)">1 Shift (Day Only: 08:00 AM - 05:00 PM)</option>
                  <option value="2 Shifts (Day & Night)">2 Shifts (Day & Night)</option>
                  <option value="3 Shifts (24/7 Continuous)">3 Shifts (24/7 Continuous)</option>
                </select>
              </div>
              <button type="submit" className="primary-button" style={{ alignSelf: 'flex-start', marginTop: '6px' }}>
                Save Company Settings
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: SYSTEM ADMIN & MONITORING */}
      {activeTab === 'system' && isSuperAdmin && (
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '14px' }}>Multi-Tenant Company Registration</h3>
              <form onSubmit={handleRegisterCompany} style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                <input
                  type="text"
                  placeholder="New Tenant Company Name"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  required
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
                />
                <button type="submit" className="primary-button" style={{ alignSelf: 'flex-start' }}>
                  Register Company Tenant
                </button>
              </form>
            </div>

            <div className="panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '14px' }}>API Rate Limiting & Monitoring Links</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                <div>
                  <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Global Rate Limit (Req/Min)</label>
                  <input
                    type="number"
                    value={rateLimit}
                    onChange={(e) => setRateLimit(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <a
                    href="http://localhost:9090"
                    target="_blank"
                    rel="noreferrer"
                    className="secondary-button"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', textDecoration: 'none' }}
                  >
                    <ExternalLink size={14} /> Prometheus Metrics
                  </a>
                  <a
                    href="http://localhost:3000"
                    target="_blank"
                    rel="noreferrer"
                    className="secondary-button"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', textDecoration: 'none' }}
                  >
                    <ExternalLink size={14} /> Grafana Dashboards
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
