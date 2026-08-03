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
  Activity,
  Database,
  Zap,
  Folder,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const roleMenus = {
  SUPER_ADMIN: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/companies', label: 'Companies', icon: Building2 },
    { to: '/users', label: 'Users', icon: Users },
    { to: '/projects', label: 'Projects', icon: FolderKanban },
    { to: '/ai-insights', label: 'Analytics', icon: Bot },
    { to: '/subscriptions', label: 'Subscriptions', icon: CreditCard },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/audit-logs', label: 'Audit Logs', icon: FileCheck },
    { to: '/security', label: 'Security Center', icon: ShieldCheck },
    { to: '/settings', label: 'Platform Settings', icon: Settings },
    { to: '/files', label: 'File Manager', icon: Folder },
    { to: '/integrations', label: 'Integrations', icon: Zap },
    { to: '/system-monitoring', label: 'System Monitoring', icon: Activity },
    { to: '/backup', label: 'Backup & Restore', icon: Database },
    { to: '/reports', label: 'Reports', icon: Gauge },
    { to: '/profile', label: 'Profile', icon: User },
  ],
  COMPANY_ADMIN: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/company-profile', label: 'Company Profile', icon: Building2 },
    { to: '/workforce', label: 'Employees', icon: Users },
    { to: '/projects', label: 'Projects', icon: FolderKanban },
    { to: '/task-management', label: 'Tasks', icon: CheckSquare },
    { to: '/site-workforce', label: 'Workforce', icon: HardHat },
    { to: '/attendance', label: 'Attendance', icon: ClipboardList },
    { to: '/equipment', label: 'Equipment', icon: ShieldCheck },
    { to: '/materials', label: 'Materials', icon: Truck },
    { to: '/finance', label: 'Finance', icon: Receipt },
    { to: '/documents', label: 'Documents', icon: FileText },
    { to: '/reports', label: 'Reports', icon: Gauge },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/ai-insights', label: 'AI Insights', icon: Bot },
    { to: '/company-settings', label: 'Settings', icon: Settings },
    { to: '/profile', label: 'Profile', icon: User },
  ],
  PROJECT_MANAGER: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/projects', label: 'My Project', icon: FolderKanban },
    { to: '/task-management', label: 'Tasks', icon: CheckSquare },
    { to: '/team-management', label: 'Team Management', icon: Users },
    { to: '/attendance', label: 'Attendance', icon: ClipboardList },
    { to: '/equipment', label: 'Equipment', icon: HardHat },
    { to: '/materials', label: 'Materials', icon: Truck },
    { to: '/documents', label: 'Documents', icon: FileText },
    { to: '/reports', label: 'Reports', icon: Gauge },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/ai-insights', label: 'AI Insights', icon: Bot },
    { to: '/profile', label: 'Profile', icon: User },
  ],
  SITE_ENGINEER: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/task-management', label: 'Daily Tasks', icon: CheckSquare },
    { to: '/site-workforce', label: 'Workers', icon: Users },
    { to: '/attendance', label: 'Attendance', icon: ClipboardList },
    { to: '/daily-report', label: 'Site Progress', icon: FileText },
    { to: '/equipment', label: 'Equipment', icon: HardHat },
    { to: '/materials', label: 'Materials', icon: Truck },
    { to: '/documents', label: 'Site Documents', icon: Folder },
    { to: '/inspection', label: 'Site Images', icon: Camera },
    { to: '/safety', label: 'Issues', icon: ShieldAlert },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/profile', label: 'Profile', icon: User },
  ],
  CONTRACTOR: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/task-management', label: 'My Tasks', icon: CheckSquare },
    { to: '/site-workforce', label: 'My Workers', icon: Users },
    { to: '/attendance', label: 'Attendance', icon: ClipboardList },
    { to: '/daily-report', label: 'Work Progress', icon: FileText },
    { to: '/equipment', label: 'Equipment', icon: HardHat },
    { to: '/materials', label: 'Materials', icon: Truck },
    { to: '/documents', label: 'Documents', icon: Folder },
    { to: '/safety', label: 'Issues', icon: ShieldAlert },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/profile', label: 'Profile', icon: User },
  ],
  WORKER: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/task-management', label: 'My Tasks', icon: CheckSquare },
    { to: '/attendance', label: 'Attendance', icon: ClipboardList },
    { to: '/daily-report', label: 'Work Progress', icon: FileText },
    { to: '/materials', label: 'Materials', icon: Truck },
    { to: '/documents', label: 'Documents', icon: Folder },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/profile', label: 'Profile', icon: User },
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


    </aside>
  );
}