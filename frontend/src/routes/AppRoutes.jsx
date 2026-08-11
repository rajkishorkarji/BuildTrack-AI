import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';

import SuperAdminDashboard from '../pages/super-admin/Dashboard';
import SuperAdminCompanies from '../pages/super-admin/Companies';
import SuperAdminProjects from '../pages/super-admin/Projects';
import SuperAdminFinance from '../pages/super-admin/Finance';
import SuperAdminReports from '../pages/super-admin/Reports';
import SuperAdminAIInsights from '../pages/super-admin/AIInsights';
import SuperAdminUsers from '../pages/super-admin/Users';
import SuperAdminSettings from '../pages/super-admin/Settings';
import SuperAdminWorkforce from '../pages/super-admin/Workforce';
import SuperAdminNotifications from '../pages/super-admin/Notifications';

import CompanyAdminDashboard from '../pages/company-admin/Dashboard';
import CompanyAdminProjects from '../pages/company-admin/Projects';
import CompanyAdminWorkforce from '../pages/company-admin/Workforce';
import CompanyAdminEquipment from '../pages/company-admin/Equipment';
import CompanyAdminMaterials from '../pages/company-admin/Materials';
import CompanyAdminFinance from '../pages/company-admin/Finance';
import CompanyAdminAIInsights from '../pages/company-admin/AIInsights';
import CompanyAdminReports from '../pages/company-admin/Reports';
import CompanyAdminNotifications from '../pages/company-admin/Notifications';
import CompanyAdminDocuments from '../pages/company-admin/Documents';
import CompanyAdminSettings from '../pages/company-admin/Settings';
import CompanyAdminAttendance from '../pages/company-admin/Attendance';
import CompanyAdminTaskManagement from '../pages/company-admin/TaskManagement';
import PersonnelInvitations from '../pages/company-admin/PersonnelInvitations';

import PMDashboard from '../pages/project-manager/Dashboard';
import PMProjects from '../pages/project-manager/Projects';
import PMTaskManagement from '../pages/project-manager/TaskManagement';
import PMSiteWorkforce from '../pages/project-manager/SiteWorkforce';
import PMDailyProgressReport from '../pages/project-manager/DailyProgressReport';
import PMReports from '../pages/project-manager/Reports';
import PMEquipment from '../pages/project-manager/Equipment';
import PMDocuments from '../pages/project-manager/Documents';
import PMNotifications from '../pages/project-manager/Notifications';
import PMSettings from '../pages/project-manager/Settings';
import PMAttendance from '../pages/project-manager/Attendance';

import SEDashboard from '../pages/site-engineer/Dashboard';
import SEInspectionImages from '../pages/site-engineer/InspectionImages';
import SESiteIssues from '../pages/site-engineer/SiteIssues';
import SEDailyProgressReport from '../pages/site-engineer/DailyProgressReport';
import SEMaterials from '../pages/site-engineer/Materials';
import SEAttendance from '../pages/site-engineer/Attendance';
import SEEquipment from '../pages/site-engineer/Equipment';
import SEDocuments from '../pages/site-engineer/Documents';
import SETaskManagement from '../pages/site-engineer/TaskManagement';
import SESettings from '../pages/site-engineer/Settings';

import ContractorDashboard from '../pages/contractor/Dashboard';
import ContractorWorkforce from '../pages/contractor/Workforce';
import ContractorAttendance from '../pages/contractor/Attendance';
import ContractorTasks from '../pages/contractor/Tasks';
import ContractorMaterials from '../pages/contractor/Materials';
import ContractorProjects from '../pages/contractor/Projects';
import ContractorSettings from '../pages/contractor/Settings';

import WorkerDashboard from '../pages/worker/Dashboard';
import WorkerTasks from '../pages/worker/Tasks';
import WorkerAttendance from '../pages/worker/Attendance';
import WorkerEquipment from '../pages/worker/Equipment';
import WorkerDocuments from '../pages/worker/Documents';
import WorkerMaterials from '../pages/worker/Materials';
import WorkerSettings from '../pages/worker/Settings';

import Login from '../pages/Login';
import VerifyEmail from '../pages/VerifyEmail';
import ResetPassword from '../pages/ResetPassword';
import OAuthRedirect from '../pages/OAuthRedirect';
import Notifications from '../pages/Notifications';
import Documents from '../pages/Documents';
import Profile from '../pages/Profile';
import Step7DailyLogs from '../pages/Step7DailyLogs';
import AcceptInvitation from '../pages/AcceptInvitation';

import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import { PERMISSIONS } from '../config/rbac';

function RoleAccessDenied() {
  return (
    <div className="page-content">
      <div className="panel">
        <h2>Access denied</h2>
        <p>Your role does not have access to this feature.</p>
      </div>
    </div>
  );
}

function roleComponent(user, allowedRoles, Component) {
  const role = String(user?.role || '').toUpperCase();
  return allowedRoles.includes(role) ? <Component /> : <RoleAccessDenied />;
}

function RoleDashboard() {
  const { user } = useAuth();

  const map = {
    SUPER_ADMIN: SuperAdminDashboard,
    COMPANY_ADMIN: CompanyAdminDashboard,
    PROJECT_MANAGER: PMDashboard,
    SITE_ENGINEER: SEDashboard,
    CONTRACTOR: ContractorDashboard,
    WORKER: WorkerDashboard,
  };

  const Component = map[String(user?.role || '').toUpperCase()];
  return Component ? <Component /> : <RoleAccessDenied />;
}

function RoleCompanies() {
  const { user } = useAuth();
  return roleComponent(user, ['SUPER_ADMIN'], SuperAdminCompanies);
}

function RoleFinance() {
  const { user } = useAuth();
  const map = {
    SUPER_ADMIN: SuperAdminFinance,
    COMPANY_ADMIN: CompanyAdminFinance,
  };
  const Component = map[String(user?.role || '').toUpperCase()];
  return roleComponent(user, Object.keys(map), Component || RoleAccessDenied);
}

function RoleReports() {
  const { user } = useAuth();
  const map = {
    SUPER_ADMIN: SuperAdminReports,
    COMPANY_ADMIN: CompanyAdminReports,
    PROJECT_MANAGER: PMReports,
  };
  const Component = map[String(user?.role || '').toUpperCase()];
  return roleComponent(user, Object.keys(map), Component || RoleAccessDenied);
}

function RoleAIInsights() {
  const { user } = useAuth();
  const map = {
    SUPER_ADMIN: SuperAdminAIInsights,
    COMPANY_ADMIN: CompanyAdminAIInsights,
  };
  const Component = map[String(user?.role || '').toUpperCase()];
  return roleComponent(user, Object.keys(map), Component || RoleAccessDenied);
}

function RoleUsers() {
  const { user } = useAuth();
  return roleComponent(user, ['SUPER_ADMIN'], SuperAdminUsers);
}

function RoleSettings() {
  const { user } = useAuth();
  const map = {
    SUPER_ADMIN: SuperAdminSettings,
    COMPANY_ADMIN: CompanyAdminSettings,
    PROJECT_MANAGER: PMSettings,
    SITE_ENGINEER: SESettings,
    CONTRACTOR: ContractorSettings,
    WORKER: WorkerSettings,
  };
  const Component = map[String(user?.role || '').toUpperCase()];
  return roleComponent(user, Object.keys(map), Component || RoleAccessDenied);
}

function RoleProjects() {
  const { user } = useAuth();
  const map = {
    SUPER_ADMIN: SuperAdminProjects,
    COMPANY_ADMIN: CompanyAdminProjects,
    PROJECT_MANAGER: PMProjects,
    CONTRACTOR: ContractorProjects,
  };
  const Component = map[String(user?.role || '').toUpperCase()];
  return roleComponent(user, Object.keys(map), Component || RoleAccessDenied);
}

function RoleWorkforce() {
  const { user } = useAuth();
  const map = {
    SUPER_ADMIN: SuperAdminWorkforce,
    COMPANY_ADMIN: CompanyAdminWorkforce,
    PROJECT_MANAGER: PMSiteWorkforce,
    CONTRACTOR: ContractorWorkforce,
  };
  const Component = map[String(user?.role || '').toUpperCase()];
  return roleComponent(user, Object.keys(map), Component || RoleAccessDenied);
}

function RoleEquipment() {
  const { user } = useAuth();
  const map = {
    COMPANY_ADMIN: CompanyAdminEquipment,
    PROJECT_MANAGER: PMEquipment,
    SITE_ENGINEER: SEEquipment,
    WORKER: WorkerEquipment,
  };
  const Component = map[String(user?.role || '').toUpperCase()];
  return roleComponent(user, Object.keys(map), Component || RoleAccessDenied);
}

function RoleMaterials() {
  const { user } = useAuth();
  const map = {
    COMPANY_ADMIN: CompanyAdminMaterials,
    SITE_ENGINEER: SEMaterials,
    CONTRACTOR: ContractorMaterials,
    WORKER: WorkerMaterials,
  };
  const Component = map[String(user?.role || '').toUpperCase()];
  return roleComponent(user, Object.keys(map), Component || RoleAccessDenied);
}

function RoleTaskManagement() {
  const { user } = useAuth();
  const map = {
    COMPANY_ADMIN: CompanyAdminTaskManagement,
    PROJECT_MANAGER: PMTaskManagement,
    SITE_ENGINEER: SETaskManagement,
    CONTRACTOR: ContractorTasks,
    WORKER: WorkerTasks,
  };
  const Component = map[String(user?.role || '').toUpperCase()];
  return roleComponent(user, Object.keys(map), Component || RoleAccessDenied);
}

function RoleAttendance() {
  const { user } = useAuth();
  const map = {
    COMPANY_ADMIN: CompanyAdminAttendance,
    PROJECT_MANAGER: PMAttendance,
    SITE_ENGINEER: SEAttendance,
    CONTRACTOR: ContractorAttendance,
    WORKER: WorkerAttendance,
  };
  const Component = map[String(user?.role || '').toUpperCase()];
  return roleComponent(user, Object.keys(map), Component || RoleAccessDenied);
}

function RoleDailyReport() {
  const { user } = useAuth();
  const map = {
    COMPANY_ADMIN: Step7DailyLogs,
    PROJECT_MANAGER: PMDailyProgressReport,
    SITE_ENGINEER: SEDailyProgressReport,
  };
  const Component = map[String(user?.role || '').toUpperCase()];
  return roleComponent(user, Object.keys(map), Component || RoleAccessDenied);
}

function RoleSafety() {
  const { user } = useAuth();
  const map = {
    SUPER_ADMIN: SESiteIssues,
    COMPANY_ADMIN: SESiteIssues,
    PROJECT_MANAGER: SESiteIssues,
    SITE_ENGINEER: SESiteIssues,
    CONTRACTOR: SESiteIssues,
  };
  const Component = map[String(user?.role || '').toUpperCase()];
  return roleComponent(user, Object.keys(map), Component || RoleAccessDenied);
}

function RoleInspectionImages() {
  const { user } = useAuth();
  return roleComponent(user, ['SITE_ENGINEER'], SEInspectionImages);
}

function RoleNotifications() {
  const { user } = useAuth();
  const map = {
    SUPER_ADMIN: SuperAdminNotifications,
    COMPANY_ADMIN: CompanyAdminNotifications,
    PROJECT_MANAGER: PMNotifications,
    SITE_ENGINEER: Notifications,
    CONTRACTOR: Notifications,
    WORKER: Notifications,
  };
  const Component = map[String(user?.role || '').toUpperCase()];
  return roleComponent(user, Object.keys(map), Component || RoleAccessDenied);
}

function RoleDocuments() {
  const { user } = useAuth();
  const map = {
    COMPANY_ADMIN: CompanyAdminDocuments,
    PROJECT_MANAGER: PMDocuments,
    SITE_ENGINEER: SEDocuments,
    CONTRACTOR: Documents,
    WORKER: WorkerDocuments,
  };
  const Component = map[String(user?.role || '').toUpperCase()];
  return roleComponent(user, Object.keys(map), Component || RoleAccessDenied);
}

function RoleInvitations() {
  const { user } = useAuth();
  return roleComponent(user, ['COMPANY_ADMIN'], PersonnelInvitations);
}

function ProtectedPage({ permission, children }) {
  return (
    <ProtectedRoute requiredPermission={permission}>
      {children}
    </ProtectedRoute>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public authentication routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/oauth2/redirect" element={<OAuthRedirect />} />
      <Route path="/accept-invitation" element={<AcceptInvitation />} />

      {/* Protected application routes */}
      <Route element={<DashboardLayout />}>
        <Route
          path="/dashboard"
          element={
            <ProtectedPage permission={PERMISSIONS.DASHBOARD_VIEW}>
              <RoleDashboard />
            </ProtectedPage>
          }
        />

        <Route
          path="/companies"
          element={
            <ProtectedPage permission={PERMISSIONS.COMPANY_ADMIN_MANAGE}>
              <RoleCompanies />
            </ProtectedPage>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedPage permission={PERMISSIONS.USER_VIEW}>
              <RoleUsers />
            </ProtectedPage>
          }
        />

        <Route
          path="/projects"
          element={
            <ProtectedPage permission={PERMISSIONS.PROJECT_VIEW}>
              <RoleProjects />
            </ProtectedPage>
          }
        />

        <Route
          path="/workforce"
          element={
            <ProtectedPage permission={PERMISSIONS.WORKFORCE_VIEW}>
              <RoleWorkforce />
            </ProtectedPage>
          }
        />

        <Route
          path="/attendance"
          element={
            <ProtectedPage permission={PERMISSIONS.ATTENDANCE_VIEW}>
              <RoleAttendance />
            </ProtectedPage>
          }
        />

        <Route
          path="/tasks"
          element={
            <ProtectedPage permission={PERMISSIONS.TASK_VIEW}>
              <RoleTaskManagement />
            </ProtectedPage>
          }
        />

        <Route
          path="/equipment"
          element={
            <ProtectedPage permission={PERMISSIONS.EQUIPMENT_VIEW}>
              <RoleEquipment />
            </ProtectedPage>
          }
        />

        <Route
          path="/materials"
          element={
            <ProtectedPage permission={PERMISSIONS.MATERIAL_VIEW}>
              <RoleMaterials />
            </ProtectedPage>
          }
        />

        <Route
          path="/finance"
          element={
            <ProtectedPage permission={PERMISSIONS.FINANCE_VIEW}>
              <RoleFinance />
            </ProtectedPage>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedPage permission={PERMISSIONS.REPORT_VIEW}>
              <RoleReports />
            </ProtectedPage>
          }
        />

        <Route
          path="/ai-insights"
          element={
            <ProtectedPage permission={PERMISSIONS.AI_VIEW}>
              <RoleAIInsights />
            </ProtectedPage>
          }
        />

        <Route
          path="/documents"
          element={
            <ProtectedPage permission={PERMISSIONS.DOCUMENT_VIEW}>
              <RoleDocuments />
            </ProtectedPage>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedPage permission={PERMISSIONS.NOTIFICATION_VIEW}>
              <RoleNotifications />
            </ProtectedPage>
          }
        />

        <Route
          path="/daily-logs"
          element={
            <ProtectedPage permission={PERMISSIONS.DAILY_LOG_VIEW}>
              <RoleDailyReport />
            </ProtectedPage>
          }
        />

        <Route
          path="/site-issues"
          element={
            <ProtectedPage permission={PERMISSIONS.SITE_ISSUE_VIEW}>
              <RoleSafety />
            </ProtectedPage>
          }
        />

        <Route
          path="/inspection-images"
          element={
            <ProtectedPage permission={PERMISSIONS.DOCUMENT_VIEW}>
              <RoleInspectionImages />
            </ProtectedPage>
          }
        />

        <Route
          path="/invitations"
          element={
            <ProtectedPage permission={PERMISSIONS.COMPANY_ADMIN_MANAGE}>
              <RoleInvitations />
            </ProtectedPage>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <RoleSettings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/company-settings"
          element={
            <ProtectedRoute>
              <RoleSettings />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}