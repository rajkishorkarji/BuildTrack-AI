import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Building2, Users, HardHat, FolderKanban, CheckSquare, Receipt,
  Gauge, ShieldCheck, FileText, Bell, LayoutDashboard, Settings,
  ChevronRight, Bot, Clock, Package, AlertTriangle, X,
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
    { to: '/settings', label: 'Settings', icon: Settings, permission: PERMISSIONS.COMPANY_ADMIN_MANAGE },
  ],
  PROJECT_MANAGER: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: PERMISSIONS.DASHBOARD_VIEW },
    { to: '/projects', label: 'Projects', icon: FolderKanban, permission: PERMISSIONS.PROJECT_VIEW },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare, permission: PERMISSIONS.TASK_MANAGE },
    { to: '/workforce', label: 'Team', icon: Users, permission: PERMISSIONS.WORKFORCE_VIEW },
    { to: '/equipment', label: 'Equipment', icon: ShieldCheck, permission: PERMISSIONS.EQUIPMENT_VIEW },
    { to: '/reports', label: 'Reports', icon: Gauge, permission: PERMISSIONS.REPORT_VIEW },
    { to: '/documents', label: 'Documents', icon: FileText, permission: PERMISSIONS.DOCUMENT_VIEW },
    { to: '/notifications', label: 'Notifications', icon: Bell, permission: PERMISSIONS.NOTIFICATION_VIEW },
    { to: '/settings', label: 'Settings', icon: Settings, permission: PERMISSIONS.PROFILE_EDIT },
  ],
  SITE_ENGINEER: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: PERMISSIONS.DASHBOARD_VIEW },
    { to: '/daily-logs', label: 'Daily Logs', icon: FileText, permission: PERMISSIONS.DAILY_LOG_VIEW },
    { to: '/attendance', label: 'Attendance', icon: Clock, permission: PERMISSIONS.ATTENDANCE_VIEW },
    { to: '/equipment', label: 'Equipment', icon: ShieldCheck, permission: PERMISSIONS.EQUIPMENT_VIEW },
    { to: '/materials', label: 'Materials', icon: Package, permission: PERMISSIONS.MATERIAL_VIEW },
    { to: '/site-issues', label: 'Issues', icon: AlertTriangle, permission: PERMISSIONS.SITE_ISSUE_VIEW },
    { to: '/documents', label: 'Documents', icon: FileText, permission: PERMISSIONS.DOCUMENT_VIEW },
    { to: '/notifications', label: 'Notifications', icon: Bell, permission: PERMISSIONS.NOTIFICATION_VIEW },
    { to: '/settings', label: 'Settings', icon: Settings, permission: PERMISSIONS.PROFILE_EDIT },
  ],
  CONTRACTOR: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: PERMISSIONS.DASHBOARD_VIEW },
    { to: '/projects', label: 'Assigned Projects', icon: FolderKanban, permission: PERMISSIONS.PROJECT_VIEW },
    { to: '/workforce', label: 'Team', icon: Users, permission: PERMISSIONS.WORKFORCE_VIEW },
    { to: '/attendance', label: 'Attendance', icon: Clock, permission: PERMISSIONS.ATTENDANCE_VIEW },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare, permission: PERMISSIONS.TASK_MANAGE },
    { to: '/equipment', label: 'Equipment', icon: ShieldCheck, permission: PERMISSIONS.EQUIPMENT_VIEW },
    { to: '/materials', label: 'Materials', icon: Package, permission: PERMISSIONS.MATERIAL_VIEW },
    { to: '/site-issues', label: 'Issues', icon: AlertTriangle, permission: PERMISSIONS.SITE_ISSUE_VIEW },
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

  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setMobileOpen(prev => !prev);
    const handleClose = () => setMobileOpen(false);

    window.addEventListener('buildtrack:toggle-sidebar', handleToggle);
    window.addEventListener('buildtrack:close-sidebar', handleClose);

    return () => {
      window.removeEventListener('buildtrack:toggle-sidebar', handleToggle);
      window.removeEventListener('buildtrack:close-sidebar', handleClose);
    };
  }, []);

  return (
    <>
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand-row">
          <div className="sidebar-brand" aria-label="BuildTrack AI">
            <img
              src="/logo-brand.svg"
              alt="BuildTrack AI"
              className="brand-logo-full"
            />
          </div>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Workspace</div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
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
    </>
  );
}
