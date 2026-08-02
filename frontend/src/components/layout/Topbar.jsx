import { Bell, ChevronDown, MessageSquareMore, MoonStar, Search, SunMedium, UserCheck } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function Topbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, switchRole } = useAuth();

  return (
    <header className="topbar">
      <div className="search-box">
        <Search size={16} />
        <input placeholder="Search projects, workers, tasks..." />
      </div>

      <div className="topbar-actions">
        {/* Dynamic Role Switcher Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--panel-soft)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}>
          <UserCheck size={14} style={{ color: 'var(--blue)' }} />
          <span style={{ color: 'var(--muted)', fontWeight: 600 }}>Active Role:</span>
          <select
            value={user?.role || 'SUPER_ADMIN'}
            onChange={(e) => switchRole(e.target.value)}
            style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontWeight: 700, cursor: 'pointer' }}
          >
            <option value="SUPER_ADMIN">1. Super Admin</option>
            <option value="COMPANY_ADMIN">2. Company Admin</option>
            <option value="PROJECT_MANAGER">3. Project Manager</option>
            <option value="SITE_ENGINEER">4. Site Engineer</option>
            <option value="CONTRACTOR">5. Contractor</option>
            <option value="WORKER">6. Worker</option>
          </select>
        </div>

        <button
          type="button"
          className="icon-button theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
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