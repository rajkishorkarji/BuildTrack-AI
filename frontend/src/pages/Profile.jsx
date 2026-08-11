import { useState } from 'react';
import {
  User,
  Mail,
  ShieldCheck,
  Key,
  LogOut,
  Save,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(user?.fullName || 'User Account');
  const [email, setEmail] = useState(user?.email || 'user@buildtrack.ai');
  const [twoFactor, setTwoFactor] = useState(true);
  const [notice, setNotice] = useState('');

  const notify = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3500);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    notify('Profile account credentials updated successfully!');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <p className="eyebrow" style={{ color: 'var(--blue)', fontWeight: 600 }}>USER ACCOUNT & SECURITY</p>
        <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Profile & Credentials</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '4px' }}>
          Manage your personal details, credentials, security settings, or log out of your session.
        </p>
      </div>

      {notice && (
        <div style={{ background: 'rgba(36, 196, 107, 0.15)', border: '1px solid var(--green)', color: 'var(--green)', padding: '12px 18px', borderRadius: '10px', fontWeight: 600, fontSize: '14px' }}>
          {notice}
        </div>
      )}

      {/* User Card Header */}
      <div className="panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--blue), var(--purple))', color: '#fff', fontSize: '24px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {user?.avatar || 'BU'}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '20px', margin: 0 }}>{user?.fullName || 'BuildTrack User'}</h2>
          <span style={{ color: 'var(--blue)', fontWeight: 600, fontSize: '14px' }}>{user?.roleLabel || 'Active Session'}</span>
          <p style={{ color: 'var(--muted)', fontSize: '13px', margin: '4px 0 0 0' }}>{user?.companyName || 'Company'}</p>
        </div>
        <button
          type="button"
          className="primary-button"
          style={{ background: 'var(--red)', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontSize: '14px', fontWeight: 700 }}
          onClick={handleLogout}
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      {/* Edit Form */}
      <div className="panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={20} style={{ color: 'var(--blue)' }} /> Personal Details
        </h3>

        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button type="submit" className="primary-button" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Save size={16} /> Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Security & 2FA */}
      <div className="panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lock size={20} style={{ color: 'var(--purple)' }} /> Account Security & Password
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--panel-soft)', padding: '16px', borderRadius: '10px' }}>
            <div>
              <strong style={{ fontSize: '14px', display: 'block' }}>Two-Factor Authentication (2FA)</strong>
              <span style={{ color: 'var(--muted)' }}>Protect account using TOTP app or SMS verification</span>
            </div>
            <input
              type="checkbox"
              checked={twoFactor}
              onChange={(e) => {
                setTwoFactor(e.target.checked);
                notify(`Two-Factor Authentication set to ${e.target.checked ? 'ENABLED' : 'DISABLED'}`);
              }}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>Password Change</strong>
              <span style={{ color: 'var(--muted)', display: 'block', fontSize: '12px' }}>Update your secret login password</span>
            </div>
            <button
              type="button"
              className="secondary-button"
              onClick={() => notify('Sent password reset link to your email')}
            >
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
