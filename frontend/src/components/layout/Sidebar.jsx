import { NavLink, useNavigate } from 'react-router-dom';
import {
  Bell,
  Building2,
  ClipboardList,
  FileText,
  FolderKanban,
  Gauge,
  HardHat,
  LayoutDashboard,
  Receipt,
  Settings,
  ShieldCheck,
  Users,
  LogOut,
  CreditCard,
  LifeBuoy,
  ShieldAlert,
  FileCheck,
  Truck,
  CheckSquare,
  DollarSign,
  Briefcase,
  Camera,
  Bot,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const roleMenus = {
  SUPER_ADMIN: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/companies', label: 'Companies', icon: Building2 },
    { to: '/projects', label: 'Projects', icon: FolderKanban },
    { to: '/users', label: 'Users', icon: Users },
    { to: '/subscriptions', label: 'Subscriptions', icon: CreditCard },
    { to: '/finance', label: 'Payments', icon: Receipt },
    { to: '/support', label: 'Support Tickets', icon: LifeBuoy },
    { to: '/settings', label: 'System Settings', icon: Settings },
    { to: '/roles', label: 'Roles & Permissions', icon: ShieldCheck },
    { to: '/reports', label: 'Reports', icon: Gauge },
    { to: '/audit-logs', label: 'Audit Logs', icon: FileCheck },
    { to: '/ai-insights', label: 'AI Analytics', icon: Bot },
    { to: '/notifications', label: 'Notifications', icon: Bell },
  ],
  COMPANY_ADMIN: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/projects', label: 'Projects', icon: FolderKanban },
    { to: '/workforce', label: 'Employees', icon: Users },
    { to: '/departments', label: 'Departments', icon: Building2 },
    { to: '/attendance', label: 'Attendance', icon: ClipboardList },
    { to: '/equipment', label: 'Equipment', icon: HardHat },
    { to: '/finance', label: 'Finance', icon: Receipt },
    { to: '/documents', label: 'Documents', icon: FileText },
    { to: '/reports', label: 'Reports', icon: Gauge },
    { to: '/ai-insights', label: 'AI Insights', icon: Bot },
    { to: '/settings', label: 'Settings', icon: Settings },
  ],
  PROJECT_MANAGER: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/projects', label: 'My Projects', icon: FolderKanban },
    { to: '/task-management', label: 'Tasks', icon: ShieldCheck },
    { to: '/workforce', label: 'Workers', icon: Users },
    { to: '/attendance', label: 'Attendance', icon: ClipboardList },
    { to: '/equipment', label: 'Equipment', icon: HardHat },
    { to: '/materials', label: 'Materials', icon: Truck },
    { to: '/documents', label: 'Documents', icon: FileText },
    { to: '/reports', label: 'Site Reports', icon: Gauge },
    { to: '/ai-insights', label: 'AI Insights', icon: Bot },
    { to: '/notifications', label: 'Notifications', icon: Bell },
  ],
  SITE_ENGINEER: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/task-management', label: 'Tasks', icon: CheckSquare },
    { to: '/daily-report', label: 'Daily Report', icon: FileText },
    { to: '/attendance', label: 'Attendance', icon: ClipboardList },
    { to: '/inspection', label: 'Inspection', icon: Camera },
    { to: '/equipment', label: 'Equipment', icon: HardHat },
    { to: '/materials', label: 'Materials', icon: Truck },
    { to: '/documents', label: 'Documents', icon: FileText },
    { to: '/safety', label: 'Safety', icon: ShieldAlert },
    { to: '/notifications', label: 'Notifications', icon: Bell },
  ],
  CONTRACTOR: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/workforce', label: 'Workers', icon: Users },
    { to: '/attendance', label: 'Attendance', icon: ClipboardList },
    { to: '/task-management', label: 'Tasks', icon: CheckSquare },
    { to: '/finance', label: 'Payments', icon: DollarSign },
    { to: '/invoices', label: 'Invoices', icon: Receipt },
    { to: '/equipment-requests', label: 'Equipment Requests', icon: HardHat },
    { to: '/documents', label: 'Documents', icon: FileText },
    { to: '/notifications', label: 'Notifications', icon: Bell },
  ],
  WORKER: [
    { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { to: '/task-management', label: 'My Tasks', icon: CheckSquare },
    { to: '/attendance', label: 'Attendance', icon: ClipboardList },
    { to: '/leave', label: 'Leave', icon: Briefcase },
    { to: '/salary', label: 'Salary', icon: DollarSign },
    { to: '/documents', label: 'Documents', icon: FileText },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/settings', label: 'Profile', icon: User },
  ],
};

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const currentRole = user?.role || 'SUPER_ADMIN';
  const menuItems = roleMenus[currentRole] || roleMenus.SUPER_ADMIN;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img className="brand-mark brand-mark--wide" src="/logo.png" alt="BuildTrack AI" />
      </div>

      <div className="project-switcher">
        <div className="project-badge">{currentRole[0]}</div>
        <div className="project-switcher-text">
          <strong>{user?.companyName || 'BuildTrack AI'}</strong>
          <span>{user?.roleLabel || 'Active Session'}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-card" style={{ cursor: 'pointer' }} onClick={handleLogout} title="Click to Logout">
          <div className="user-avatar">{user?.avatar || 'SA'}</div>
          <div style={{ flex: 1 }}>
            <div className="user-name">{user?.fullName || 'Super Admin'}</div>
            <div className="user-role" style={{ color: 'var(--blue)', fontWeight: 600 }}>{user?.roleLabel || 'Super Admin'}</div>
          </div>
          <button type="button" className="user-more" title="Logout" onClick={handleLogout}>
            <LogOut size={16} style={{ color: 'var(--red)' }} />
          </button>
        </div>
      </div>
    </aside>
  );
}