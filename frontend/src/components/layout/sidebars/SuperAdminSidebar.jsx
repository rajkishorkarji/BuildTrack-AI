import { NavLink } from 'react-router-dom';
import {
  Building2, Users, HardHat, FolderKanban, Receipt, Gauge,
  ShieldCheck, FileText, Bell, LayoutDashboard, Settings,
  ChevronRight, Bot,
} from 'lucide-react';

const menuItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/companies', label: 'Companies', icon: Building2 },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/workforce', label: 'Workforce', icon: HardHat },
  { to: '/finance', label: 'Finance', icon: Receipt },
  { to: '/ai-insights', label: 'AI Insights', icon: Bot },
  { to: '/reports', label: 'Reports', icon: Gauge },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function SuperAdminSidebar() {
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
