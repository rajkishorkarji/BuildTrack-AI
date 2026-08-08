import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  MoonStar,
  Search,
  SunMedium,
  Settings,
  LogOut,
  FolderKanban,
  HardHat,
  ShieldCheck,
  FileText,
  X,
  ChevronDown,
  Building2,
  Radio,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

// Helper function to extract initials if avatar isn't explicitly set
const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const searchableItems = [
  { id: 'p1', type: 'Project', title: 'Metro Tower Complex', sub: 'Mumbai Central • 66% Complete', link: '/projects', icon: FolderKanban },
  { id: 'p2', type: 'Project', title: 'Riverside Apartments', sub: 'Pune Sector 4 • 82% Complete', link: '/projects', icon: FolderKanban },
  { id: 'p3', type: 'Project', title: 'Highland Highway Section B', sub: 'NH-48 • 34% Complete', link: '/projects', icon: FolderKanban },
  { id: 'w1', type: 'Worker', title: 'Rose Smith', sub: 'Senior Mason • Solviontech Ltd', link: '/workforce', icon: HardHat },
  { id: 'w2', type: 'Worker', title: 'Robert Fox', sub: 'Structural Welder • Fox Steel', link: '/workforce', icon: HardHat },
  { id: 'w3', type: 'Worker', title: 'Vikram Nair', sub: 'Project Manager • Solviontech Ltd', link: '/workforce', icon: HardHat },
  { id: 'e1', type: 'Equipment', title: 'Tower Crane TC-500', sub: 'Lifting • Operational', link: '/equipment', icon: ShieldCheck },
  { id: 'e2', type: 'Equipment', title: 'Mobile Concrete Pump 5000', sub: 'Pumping • Maintenance Scheduled', link: '/equipment', icon: ShieldCheck },
  { id: 'd1', type: 'Document', title: 'Structural_Blueprint_TowerA_v4.pdf', sub: 'Designs Folder • Uploaded by Divya', link: '/documents', icon: FileText },
  { id: 'd2', type: 'Document', title: 'Subcontractor_Agreement_FoxSteel.pdf', sub: 'Contracts Folder • Legal Approved', link: '/documents', icon: FileText },
];

export default function Topbar() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { realtimeStatus } = useData();

  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Fallbacks based on active user
  const userFullName = user?.fullName || 'Super Admin';
  const userRoleLabel = user?.roleLabel || user?.role?.replace(/_/g, ' ') || 'Super Admin';
  const userInitials = user?.avatar || getInitials(userFullName);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredSearch = query.trim()
    ? searchableItems.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()) || item.sub.toLowerCase().includes(query.toLowerCase()))
    : [];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      className="app-topbar"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 16px',
        marginBottom: '16px',
        background: 'var(--panel)',
        color: 'var(--text)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-soft)',
        gap: '12px',
        flexWrap: 'nowrap',
      }}
    >
      <div className="topbar-search" ref={searchRef}>
        <Search size={17} aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSearchOpen(true);
          }}
          onFocus={() => setSearchOpen(true)}
          placeholder="Search projects, people, equipment..."
          aria-label="Search workspace"
        />
        {query && (
          <button
            type="button"
            className="topbar-search-clear"
            onClick={() => {
              setQuery('');
              setSearchOpen(false);
            }}
            aria-label="Clear search"
          >
            <X size={15} />
          </button>
        )}

        {searchOpen && query.trim() && (
          <div className="topbar-search-results">
            {filteredSearch.length ? filteredSearch.map((item) => {
              const ItemIcon = item.icon;
              return (
                <button
                  type="button"
                  className="topbar-search-result"
                  key={item.id}
                  onClick={() => {
                    navigate(item.link);
                    setQuery('');
                    setSearchOpen(false);
                  }}
                >
                  <span className="topbar-search-result-icon"><ItemIcon size={16} /></span>
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.type} · {item.sub}</small>
                  </span>
                </button>
              );
            }) : (
              <div className="topbar-search-empty">No workspace matches found.</div>
            )}
          </div>
        )}
      </div>

      {/* Center: Company Tenant Name Badge */}
      <div
        className="topbar-company-wrap"
        style={{
          flex: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          className="topbar-company"
          style={{
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--blue)',
            background: 'var(--panel-soft)',
            padding: '5px 16px',
            borderRadius: '20px',
            border: '1px solid var(--border)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
          }}
        >
          <Building2 size={15} style={{ color: 'var(--blue)' }} />
          <span>{user?.companyName || 'Solviontech Infrastructure Ltd'}</span>
        </div>
      </div>

      {/* Right: Actions in a single unbroken horizontal line */}
      <div
        className="topbar-actions-inline"
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '8px',
          flexWrap: 'nowrap',
          flexShrink: 0,
        }}
      >
        <span
          className="connection-status"
          title={realtimeStatus?.connected ? 'Live updates connected' : 'Working offline — changes will sync when the server is available'}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: realtimeStatus?.connected ? 'var(--green)' : 'var(--muted)', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap' }}
        >
          <Radio size={13} /> {realtimeStatus?.connected ? 'Live' : 'Offline'}
        </span>
        {/* Theme Toggle Button */}
        <button
          className="topbar-icon-button"
          type="button"
          onClick={toggleTheme}
          aria-label="Switch Theme"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'var(--panel-soft)',
            color: 'var(--text)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          {theme === 'dark' ? <SunMedium size={15} /> : <MoonStar size={15} />}
        </button>

        {/* Notifications Center Button */}
        <button
          className="topbar-icon-button"
          type="button"
          title="Notifications"
          onClick={() => navigate('/notifications')}
          style={{
            position: 'relative',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'var(--panel-soft)',
            color: 'var(--text)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <Bell size={15} />
          <span
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--red)',
              border: '1.5px solid var(--panel)',
            }}
          />
        </button>

        {/* User Profile Pill Dropdown Trigger */}
        <div className="topbar-profile-wrap" style={{ position: 'relative' }} ref={dropdownRef}>
          <div
            className="topbar-profile-trigger"
            onClick={() => setDropdownOpen((prev) => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '3px 10px 3px 4px',
              background: 'var(--panel-soft)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              cursor: 'pointer',
              userSelect: 'none',
              transition: '0.2s ease',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {userInitials}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
              <strong style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap' }}>
                {userFullName}
              </strong>
              <span style={{ fontSize: '10px', color: 'var(--blue)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                {userRoleLabel}
              </span>
            </div>

            <ChevronDown size={13} style={{ color: 'var(--muted)', marginLeft: '1px' }} />
          </div>

          {/* Profile Dropdown Menu */}
          {dropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '210px',
                background: 'var(--panel)',
                border: '1px solid var(--border)',
                borderRadius: '14px',
                boxShadow: 'var(--shadow)',
                padding: '6px',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/settings');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text)',
                  fontSize: '13px',
                  fontWeight: 600,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--panel-soft)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Settings size={16} style={{ color: 'var(--muted)' }} />
                <span>Account Settings</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  handleLogout();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--red)',
                  fontSize: '13px',
                  fontWeight: 600,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
