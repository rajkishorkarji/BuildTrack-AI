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
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

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
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px',
        marginBottom: '20px',
        background: 'var(--panel)',
        color: 'var(--text)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-soft)',
        gap: '16px',
        flexWrap: 'nowrap',
      }}
    >
      {/* Left: Global Search Input */}
      <div style={{ position: 'relative', flex: '0 1 380px' }} ref={searchRef}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 14px',
            background: 'var(--panel-soft)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            transition: '0.2s ease',
          }}
        >
          <Search size={16} style={{ color: 'var(--muted)', flexShrink: 0 }} />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            placeholder="Search projects, workers, equipment, documents..."
            style={{
              border: 0,
              outline: 0,
              background: 'transparent',
              color: 'var(--text)',
              fontSize: '13px',
              width: '100%',
            }}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSearchOpen(false);
              }}
              style={{ border: 'none', background: 'transparent', color: 'var(--muted)', cursor: 'pointer', display: 'flex', padding: 0 }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Global Live Search Dropdown */}
        {searchOpen && query.trim() !== '' && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              width: '380px',
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              boxShadow: 'var(--shadow)',
              padding: '8px',
              zIndex: 1000,
              maxHeight: '320px',
              overflowY: 'auto',
            }}
          >
            {filteredSearch.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
                No matching results found for &quot;{query}&quot;
              </div>
            ) : (
              filteredSearch.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      navigate(item.link);
                      setQuery('');
                      setSearchOpen(false);
                    }}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '4px',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--panel-soft)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ background: 'var(--panel-soft)', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}>
                      <IconComponent size={16} style={{ color: 'var(--blue)' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ fontSize: '13px', display: 'block', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.title}
                      </strong>
                      <small style={{ color: 'var(--muted)', fontSize: '11px' }}>{item.type} • {item.sub}</small>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Right: Actions in a single unbroken horizontal line */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'nowrap',
          flexShrink: 0,
        }}
      >
        {/* Company Tenant Name Badge */}
        <div
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--blue)',
            background: 'var(--panel-soft)',
            padding: '7px 14px',
            borderRadius: '20px',
            border: '1px solid var(--border)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
          }}
        >
          <Building2 size={13} style={{ color: 'var(--blue)' }} />
          <span>{user?.companyName || 'Solviontech Infrastructure Ltd'}</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Switch Theme"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
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
          {theme === 'dark' ? <SunMedium size={16} /> : <MoonStar size={16} />}
        </button>

        {/* Notifications Center Button */}
        <button
          type="button"
          title="Notifications"
          onClick={() => navigate('/notifications')}
          style={{
            position: 'relative',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
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
          <Bell size={16} />
          <span
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: 'var(--red)',
              border: '2px solid var(--panel)',
            }}
          />
        </button>

        {/* User Profile Pill Dropdown Trigger */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <div
            onClick={() => setDropdownOpen((prev) => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '5px 12px 5px 6px',
              background: 'var(--panel-soft)',
              border: '1px solid var(--border)',
              borderRadius: '24px',
              cursor: 'pointer',
              userSelect: 'none',
              transition: '0.2s ease',
            }}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {userInitials}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
              <strong style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap' }}>
                {userFullName}
              </strong>
              <span style={{ fontSize: '11px', color: 'var(--blue)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                {userRoleLabel}
              </span>
            </div>

            <ChevronDown size={14} style={{ color: 'var(--muted)', marginLeft: '2px' }} />
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