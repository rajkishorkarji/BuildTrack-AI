import { NavLink } from 'react-router-dom';
import {
  Building2, LayoutDashboard, FileText, Clock, ShieldCheck,
  Package, AlertTriangle, Settings, ChevronRight,
} from 'lucide-react';

const menuItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/attendance', label: 'Attendance', icon: Clock },
  { to: '/materials', label: 'Materials', icon: Package },
  { to: '/documents', label: 'Documents', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function WorkerSidebar() {
  return (
    <aside className="sidebar">
      <div>
  <img
    src="/logo.png"
    alt="BuildTrack AI"
    style={{
      maxWidth: "100%",
      maxHeight: "100%",
      width: "100%",
      height: "100%",
      objectFit: "cover",
      borderRadius: "18px",
      filter: "drop-shadow(0 0 5px rgba(0,0,0,0.5))",
      display: "block",
    }}
  />
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
