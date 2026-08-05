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
  CreditCard,
  ShieldAlert,
  FileCheck,
  Truck,
  CheckSquare,
  Camera,
  Bot,
  User,
  Activity,
  Database,
  Zap,
  Folder,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PERMISSIONS } from '../../config/rbac';

const roleMenus = {
  SUPER_ADMIN: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: PERMISSIONS.DASHBOARD_VIEW },
    { to: '/projects', label: 'Projects', icon: FolderKanban, permission: PERMISSIONS.PROJECT_VIEW },
    { to: '/workforce', label: 'Workforce', icon: HardHat, permission: PERMISSIONS.WORKFORCE_VIEW },
    { to: '/equipment', label: 'Equipment', icon: ShieldCheck, permission: PERMISSIONS.EQUIPMENT_VIEW },
    { to: '/finance', label: 'Finance', icon: Receipt, permission: PERMISSIONS.FINANCE_VIEW },
    { to: '/ai-insights', label: 'AI Insights', icon: Bot, permission: PERMISSIONS.AI_VIEW },
    { to: '/reports', label: 'Reports', icon: Gauge, permission: PERMISSIONS.REPORT_VIEW },
    { to: '/notifications', label: 'Notifications', icon: Bell, permission: PERMISSIONS.NOTIFICATION_VIEW },
    { to: '/documents', label: 'Documents', icon: FileText, permission: PERMISSIONS.DOCUMENT_VIEW },
    { to: '/settings', label: 'Settings', icon: Settings, permission: PERMISSIONS.SYSTEM_ADMIN_MANAGE },
  ],
  COMPANY_ADMIN: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: PERMISSIONS.DASHBOARD_VIEW },
    { to: '/projects', label: 'Projects', icon: FolderKanban, permission: PERMISSIONS.PROJECT_VIEW },
    { to: '/workforce', label: 'Workforce', icon: Users, permission: PERMISSIONS.WORKFORCE_VIEW },
    { to: '/equipment', label: 'Equipment', icon: ShieldCheck, permission: PERMISSIONS.EQUIPMENT_VIEW },
    { to: '/finance', label: 'Finance', icon: Receipt, permission: PERMISSIONS.FINANCE_VIEW },
    { to: '/ai-insights', label: 'AI Insights', icon: Bot, permission: PERMISSIONS.AI_VIEW },
    { to: '/reports', label: 'Reports', icon: Gauge, permission: PERMISSIONS.REPORT_VIEW },
    { to: '/notifications', label: 'Notifications', icon: Bell, permission: PERMISSIONS.NOTIFICATION_VIEW },
    { to: '/documents', label: 'Documents', icon: FileText, permission: PERMISSIONS.DOCUMENT_VIEW },
    { to: '/company-settings', label: 'Settings', icon: Settings, permission: PERMISSIONS.COMPANY_ADMIN_MANAGE },
  ],
  PROJECT_MANAGER: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: PERMISSIONS.DASHBOARD_VIEW },
    { to: '/projects', label: 'Projects', icon: FolderKanban, permission: PERMISSIONS.PROJECT_VIEW },
    { to: '/workforce', label: 'Workforce', icon: Users, permission: PERMISSIONS.WORKFORCE_VIEW },
    { to: '/equipment', label: 'Equipment', icon: HardHat, permission: PERMISSIONS.EQUIPMENT_VIEW },
    { to: '/finance', label: 'Finance (limited)', icon: Receipt, permission: PERMISSIONS.FINANCE_VIEW },
    { to: '/ai-insights', label: 'AI Insights', icon: Bot, permission: PERMISSIONS.AI_VIEW },
    { to: '/reports', label: 'Reports', icon: Gauge, permission: PERMISSIONS.REPORT_VIEW },
    { to: '/notifications', label: 'Notifications', icon: Bell, permission: PERMISSIONS.NOTIFICATION_VIEW },
    { to: '/documents', label: 'Documents', icon: FileText, permission: PERMISSIONS.DOCUMENT_VIEW },
    { to: '/settings', label: 'Settings', icon: Settings, permission: PERMISSIONS.PROFILE_EDIT },
  ],
  SITE_ENGINEER: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: PERMISSIONS.DASHBOARD_VIEW },
    { to: '/projects', label: 'Projects', icon: FolderKanban, permission: PERMISSIONS.PROJECT_VIEW },
    { to: '/site-workforce', label: 'Workforce', icon: Users, permission: PERMISSIONS.WORKFORCE_VIEW },
    { to: '/equipment', label: 'Equipment', icon: HardHat, permission: PERMISSIONS.EQUIPMENT_VIEW },
    { to: '/notifications', label: 'Notifications', icon: Bell, permission: PERMISSIONS.NOTIFICATION_VIEW },
    { to: '/documents', label: 'Documents', icon: Folder, permission: PERMISSIONS.DOCUMENT_VIEW },
    { to: '/settings', label: 'Settings', icon: Settings, permission: PERMISSIONS.PROFILE_EDIT },
  ],
  CONTRACTOR: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: PERMISSIONS.DASHBOARD_VIEW },
    { to: '/projects', label: 'Projects', icon: FolderKanban, permission: PERMISSIONS.PROJECT_VIEW },
    { to: '/site-workforce', label: 'Workforce', icon: Users, permission: PERMISSIONS.WORKFORCE_VIEW },
    { to: '/finance', label: 'Finance', icon: Receipt, permission: PERMISSIONS.FINANCE_VIEW },
    { to: '/notifications', label: 'Notifications', icon: Bell, permission: PERMISSIONS.NOTIFICATION_VIEW },
    { to: '/documents', label: 'Documents', icon: Folder, permission: PERMISSIONS.DOCUMENT_VIEW },
    { to: '/settings', label: 'Settings', icon: Settings, permission: PERMISSIONS.PROFILE_EDIT },
  ],
  WORKER: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: PERMISSIONS.DASHBOARD_VIEW },
    { to: '/attendance', label: 'Workforce', icon: ClipboardList, permission: PERMISSIONS.ATTENDANCE_MARK },
    { to: '/notifications', label: 'Notifications', icon: Bell, permission: PERMISSIONS.NOTIFICATION_VIEW },
    { to: '/documents', label: 'Documents', icon: Folder, permission: PERMISSIONS.DOCUMENT_VIEW },
    { to: '/settings', label: 'Settings', icon: Settings, permission: PERMISSIONS.PROFILE_EDIT },
  ],
};

export default function Sidebar() {
  const { user, hasPermission } = useAuth();
  const currentRole = user?.role || 'SUPER_ADMIN';
  const menuList = roleMenus[currentRole] || roleMenus.SUPER_ADMIN;

  // Filter items by user permissions
  const filteredMenuItems = menuList.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img className="brand-mark brand-mark--wide" src="/logo.png" alt="BuildTrack AI" />
      </div>

      <nav className="sidebar-nav">
        {filteredMenuItems.map(({ to, label, icon: Icon }) => (
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