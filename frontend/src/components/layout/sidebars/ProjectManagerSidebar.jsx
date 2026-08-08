import { NavLink } from 'react-router-dom';
import {
  Building2, Users, FolderKanban, CheckSquare, ShieldCheck,
  Gauge, FileText, Bell, LayoutDashboard, Settings, ChevronRight,
} from 'lucide-react';

const menuItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/task-management', label: 'Tasks', icon: CheckSquare },
  { to: '/site-workforce', label: 'Team', icon: Users },
  { to: '/equipment', label: 'Equipment', icon: ShieldCheck },
  { to: '/reports', label: 'Reports', icon: Gauge },
  { to: '/documents', label: 'Documents', icon: FileText },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function ProjectManagerSidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img src="/logo-brand.svg" alt="BuildTrack AI" className="brand-logo-full" />
      </div>

      <nav className="sidebar-nav">
  
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} className="nav-icon" />
              <span className="nav-label">{item.label}</span>
              <ChevronRight size={14} className="nav-arrow" />
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
