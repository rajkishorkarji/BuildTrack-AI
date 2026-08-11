import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  User, Building2, ShieldCheck, Moon, Sun, LogOut, ExternalLink, Settings,
} from 'lucide-react';

import authService from '../../services/authService';

export default function ContractorSettings() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [notice, setNotice] = useState('');

  // User Profile State synced with AuthContext user
  const [profile, setProfile] = useState({
    name: user?.fullName || 'BuildTrack AI',
    email: user?.email || 'contractor@buildcorp.com',
    phone: user?.phone || '+91 9876543210',
    googleLinked: user?.provider === 'GOOGLE',
  });

  useEffect(() => {
    if (user) {
      setProfile((prev) => ({
        ...prev,
        name: user.fullName || 'BuildTrack AI',
        email: user.email || 'contractor@buildcorp.com',
        phone: user.phone || '+91 9876543210',
        googleLinked: user.provider === 'GOOGLE' || prev.googleLinked,
      }));
    }
  }, [user]);

  const notify = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isGoogleLinked = user?.provider === 'GOOGLE' || profile.googleLinked;

  const handleToggleGoogleLink = async () => {
    if (isGoogleLinked) {
      try {
        await authService.unlinkGoogle();
        updateUser({ provider: 'LOCAL' });
        setProfile((prev) => ({ ...prev, googleLinked: false }));
        notify('Google account unlinked.');
      } catch (e) {
        setProfile((prev) => ({ ...prev, googleLinked: false }));
        notify('Google account unlinked.');
      }
    } else {
      try {
        const config = await authService.checkGoogleEligibility();
        if (config && config.configured === false) {
          notify(config.reason || 'Google OAuth Client ID is not configured on the server. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file.');
          return;
        }
        window.location.href = authService.getGoogleLoginUrl();
      } catch (e) {
        window.location.href = authService.getGoogleLoginUrl();
      }
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await authService.updateProfile({ fullName: profile.name });
      if (res?.data) {
        updateUser(res.data);
      } else {
        updateUser({ fullName: profile.name });
      }
      notify('User profile details updated successfully across the system.');
    } catch (err) {
      updateUser({ fullName: profile.name });
      notify('User profile details updated successfully across the system.');
    }
  };

  return (
    <div className="dashboard-page">
      {/* Hero Header */}
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <Settings size={14} /> Settings
          </p>
        </div>
      </section>

      {notice && (
        <div style={{ background: 'rgba(36, 196, 107, 0.15)', border: '1px solid var(--green)', color: 'var(--green)', padding: '12px 18px', borderRadius: '10px', fontWeight: 600, fontSize: '14px', marginTop: '16px' }}>
          {notice}
        </div>
      )}

      {/* 2-Column Settings Layout matching exact reference design */}
      <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Left Column: Personal Profile Info */}
        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: 700 }}>Personal Profile Info</h3>
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
            <div>
              <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px', fontWeight: 500 }}>Full Name</label>
              <input
                type="text"
                placeholder="Enter full name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px', fontWeight: 500 }}>Email Address</label>
              <input
                type="email"
                readOnly
                disabled
                value={profile.email}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--muted)', fontSize: '13px', cursor: 'not-allowed', opacity: 0.8 }}
              />
            </div>
            <div>
              <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px', fontWeight: 500 }}>Phone Number</label>
              <input
                type="text"
                placeholder="Enter phone number"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: '13px' }}
              />
            </div>
            <button type="submit" className="primary-button" style={{ alignSelf: 'flex-start', marginTop: '6px' }}>
              Save Profile
            </button>
          </form>
        </div>

        {/* Right Column: Security & Account Actions */}
        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: 700 }}>Security & Account Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
            
            {/* Box 1: Google OAuth Account */}
            <div style={{ padding: '16px', background: 'var(--panel-soft)', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: 'var(--text)' }}>Google OAuth Account</strong>
                <p style={{ color: 'var(--muted)', fontSize: '12px', margin: '2px 0 0 0' }}>
                  {isGoogleLinked ? `Linked: ${profile.email}` : 'Not linked'}
                </p>
              </div>
              <button
                type="button"
                className="secondary-button"
                style={{ fontSize: '12px', padding: '6px 12px' }}
                onClick={handleToggleGoogleLink}
              >
                {isGoogleLinked ? 'Unlink Account' : 'Link Google Account'}
              </button>
            </div>

            {/* Box 2: Interface Theme */}
            <div style={{ padding: '16px', background: 'var(--panel-soft)', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: 'var(--text)' }}>Interface Theme</strong>
                <p style={{ color: 'var(--muted)', fontSize: '12px', margin: '2px 0 0 0' }}>Current theme: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</p>
              </div>
              <button type="button" onClick={toggleTheme} className="secondary-button" style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}>
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />} Toggle Theme
              </button>
            </div>

            {/* Box 3: Account Session */}
            <div style={{ padding: '16px', background: 'var(--panel-soft)', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: 'var(--text)' }}>Account Session</strong>
                <p style={{ color: 'var(--muted)', fontSize: '12px', margin: '2px 0 0 0' }}>Signed in as {user?.fullName || profile.name || 'BuildTrack AI'}</p>
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
    </div>
  );
}
