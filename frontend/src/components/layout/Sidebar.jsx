import { NavLink } from 'react-router-dom';
import {
  Building2, Users, HardHat, FolderKanban, CheckSquare, Receipt,
  Gauge, ShieldCheck, FileText, Bell, LayoutDashboard, Settings,
  ChevronRight, Bot, Clock, Package, AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PERMISSIONS } from '../../config/rbac';

const roleMenus = {
  SUPER_ADMIN: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: PERMISSIONS.DASHBOARD_VIEW },
    { to: '/companies', label: 'Companies', icon: Building2, permission: PERMISSIONS.COMPANY_ADMIN_MANAGE },
    { to: '/projects', label: 'Projects', icon: FolderKanban, permission: PERMISSIONS.PROJECT_VIEW },
    { to: '/workforce', label: 'Workforce', icon: HardHat, permission: PERMISSIONS.WORKFORCE_VIEW },
    { to: '/finance', label: 'Finance', icon: Receipt, permission: PERMISSIONS.FINANCE_VIEW },
    { to: '/ai-insights', label: 'AI Insights', icon: Bot, permission: PERMISSIONS.AI_VIEW },
    { to: '/reports', label: 'Reports', icon: Gauge, permission: PERMISSIONS.REPORT_VIEW },
    { to: '/notifications', label: 'Notifications', icon: Bell, permission: PERMISSIONS.NOTIFICATION_VIEW },
    { to: '/users', label: 'Users', icon: Users, permission: PERMISSIONS.COMPANY_ADMIN_MANAGE },
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
    { to: '/task-management', label: 'Tasks', icon: CheckSquare, permission: PERMISSIONS.TASK_MANAGE },
    { to: '/site-workforce', label: 'Team', icon: Users, permission: PERMISSIONS.WORKFORCE_VIEW },
    { to: '/equipment', label: 'Equipment', icon: ShieldCheck, permission: PERMISSIONS.EQUIPMENT_VIEW },
    { to: '/reports', label: 'Reports', icon: Gauge, permission: PERMISSIONS.REPORT_VIEW },
    { to: '/documents', label: 'Documents', icon: FileText, permission: PERMISSIONS.DOCUMENT_VIEW },
    { to: '/notifications', label: 'Notifications', icon: Bell, permission: PERMISSIONS.NOTIFICATION_VIEW },
    { to: '/settings', label: 'Settings', icon: Settings, permission: PERMISSIONS.PROFILE_EDIT },
  ],
  SITE_ENGINEER: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: PERMISSIONS.DASHBOARD_VIEW },
    { to: '/daily-report', label: 'Daily Logs', icon: FileText, permission: PERMISSIONS.TASK_MANAGE },
    { to: '/attendance', label: 'Attendance', icon: Clock, permission: PERMISSIONS.ATTENDANCE_MARK },
    { to: '/equipment', label: 'Equipment', icon: ShieldCheck, permission: PERMISSIONS.EQUIPMENT_VIEW },
    { to: '/materials', label: 'Materials', icon: Package, permission: PERMISSIONS.WORKFORCE_VIEW },
    { to: '/safety', label: 'Issues', icon: AlertTriangle, permission: PERMISSIONS.WORKFORCE_MANAGE },
    { to: '/documents', label: 'Documents', icon: FileText, permission: PERMISSIONS.DOCUMENT_VIEW },
    { to: '/notifications', label: 'Notifications', icon: Bell, permission: PERMISSIONS.NOTIFICATION_VIEW },
    { to: '/settings', label: 'Settings', icon: Settings, permission: PERMISSIONS.PROFILE_EDIT },
  ],
  CONTRACTOR: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: PERMISSIONS.DASHBOARD_VIEW },
    { to: '/projects', label: 'Assigned Projects', icon: FolderKanban, permission: PERMISSIONS.PROJECT_VIEW },
    { to: '/workforce', label: 'Team', icon: Users, permission: PERMISSIONS.WORKFORCE_VIEW },
    { to: '/attendance', label: 'Attendance', icon: Clock, permission: PERMISSIONS.ATTENDANCE_MARK },
    { to: '/task-management', label: 'Tasks', icon: CheckSquare, permission: PERMISSIONS.TASK_MANAGE },
    { to: '/equipment', label: 'Equipment', icon: ShieldCheck, permission: PERMISSIONS.EQUIPMENT_VIEW },
    { to: '/materials', label: 'Materials', icon: Package, permission: PERMISSIONS.WORKFORCE_VIEW },
    { to: '/safety', label: 'Issues', icon: AlertTriangle, permission: PERMISSIONS.WORKFORCE_MANAGE },
    { to: '/documents', label: 'Documents', icon: FileText, permission: PERMISSIONS.DOCUMENT_VIEW },
    { to: '/notifications', label: 'Notifications', icon: Bell, permission: PERMISSIONS.NOTIFICATION_VIEW },
    { to: '/settings', label: 'Settings', icon: Settings, permission: PERMISSIONS.PROFILE_EDIT },
  ],
  WORKER: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: PERMISSIONS.DASHBOARD_VIEW },
    { to: '/attendance', label: 'Attendance', icon: Clock, permission: PERMISSIONS.ATTENDANCE_MARK },
    { to: '/equipment', label: 'Equipment', icon: ShieldCheck, permission: PERMISSIONS.EQUIPMENT_VIEW },
    { to: '/materials', label: 'Materials', icon: Package, permission: PERMISSIONS.WORKFORCE_VIEW },
    { to: '/documents', label: 'Documents', icon: FileText, permission: PERMISSIONS.DOCUMENT_VIEW },
    { to: '/notifications', label: 'Notifications', icon: Bell, permission: PERMISSIONS.NOTIFICATION_VIEW },
    { to: '/settings', label: 'Settings', icon: Settings, permission: PERMISSIONS.PROFILE_EDIT },
  ],
};

export default function Sidebar() {
  const { user } = useAuth();
  const currentRole = user?.role || 'SUPER_ADMIN';
  const menuItems = roleMenus[currentRole] || roleMenus.SUPER_ADMIN;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand" aria-label="BuildTrack AI">
        <img
          src="/logo-brand.svg"
          alt="BuildTrack AI"
          className="brand-logo-full"
        />
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">Workspace</div>
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
