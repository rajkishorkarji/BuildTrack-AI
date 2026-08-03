import { Bell, Building2, MoonStar, Search, SunMedium } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function Topbar() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="topbar">
      <div className="search-box">
        <Search size={16} />
        <input placeholder="Search projects, workers, tasks..." />
      </div>

      <div className="topbar-actions">
        {/* Company Name Badge (Hidden for Super Admin) */}
        {user?.role !== 'SUPER_ADMIN' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--panel-soft)', padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}>
            <Building2 size={15} style={{ color: 'var(--blue)' }} />
            <span style={{ color: 'var(--muted)', fontWeight: 600 }}>Company:</span>
            <strong style={{ color: 'var(--text)', fontWeight: 700 }}>{user?.companyName || 'BuildTrack AI Platform'}</strong>
          </div>
        )}

        <button
          type="button"
          className="icon-button theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === 'light' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? <SunMedium size={16} /> : <MoonStar size={16} />}
        </button>

        <button type="button" className="icon-button" title="Notifications">
          <Bell size={16} />
          <span className="notification-dot" />
        </button>

        <div className="profile-chip">
          <div className="profile-avatar">{user?.avatar || 'SA'}</div>
          <div className="profile-copy">
            <strong>{user?.fullName || 'Super Admin'}</strong>
            <span style={{ color: 'var(--blue)', fontWeight: 600 }}>{user?.roleLabel || 'Super Admin'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}