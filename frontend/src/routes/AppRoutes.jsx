import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';

// ── Super Admin Role Pages ──
import SuperAdminDashboard from '../pages/super-admin/Dashboard';
import SuperAdminCompanies from '../pages/super-admin/Companies';
import SuperAdminProjects from '../pages/super-admin/Projects';
import SuperAdminFinance from '../pages/super-admin/Finance';
import SuperAdminReports from '../pages/super-admin/Reports';
import SuperAdminAIInsights from '../pages/super-admin/AIInsights';
import SuperAdminUsers from '../pages/super-admin/Users';
import SuperAdminSettings from '../pages/super-admin/Settings';
import SuperAdminWorkforce from '../pages/super-admin/Workforce';

// ── Company Admin Role Pages ──
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

// ── Project Manager Role Pages ──
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

// ── Site Engineer Role Pages ──
import SEDashboard from '../pages/site-engineer/Dashboard';
import SEInspectionImages from '../pages/site-engineer/InspectionImages';
import SESiteIssues from '../pages/site-engineer/SiteIssues';
import SEDailyProgressReport from '../pages/site-engineer/DailyProgressReport';
import SEMaterials from '../pages/site-engineer/Materials';
import SEAttendance from '../pages/site-engineer/Attendance';
import SEEquipment from '../pages/site-engineer/Equipment';
import SEDocuments from '../pages/site-engineer/Documents';
import SESettings from '../pages/site-engineer/Settings';

// ── Contractor Role Pages ──
import ContractorDashboard from '../pages/contractor/Dashboard';
import ContractorWorkforce from '../pages/contractor/Workforce';
import ContractorAttendance from '../pages/contractor/Attendance';
import ContractorTasks from '../pages/contractor/Tasks';
import ContractorProjects from '../pages/contractor/Projects';
import ContractorSettings from '../pages/contractor/Settings';

// ── Worker Role Pages ──
import WorkerDashboard from '../pages/worker/Dashboard';
import WorkerTasks from '../pages/worker/Tasks';
import WorkerAttendance from '../pages/worker/Attendance';
import WorkerEquipment from '../pages/worker/Equipment';
import WorkerDocuments from '../pages/worker/Documents';
import WorkerMaterials from '../pages/worker/Materials';
import WorkerSettings from '../pages/worker/Settings';

// ── Core Utility Pages ──
import Login from '../pages/Login';
import VerifyEmail from '../pages/VerifyEmail';
import ResetPassword from '../pages/ResetPassword';
import OAuthRedirect from '../pages/OAuthRedirect';
import Notifications from '../pages/Notifications';
import Documents from '../pages/Documents';
import CompanyProfile from '../pages/CompanyProfile';
import SecurityCenter from '../pages/SecurityCenter';
import SystemMonitoring from '../pages/SystemMonitoring';
import BackupRestore from '../pages/BackupRestore';
import Integrations from '../pages/Integrations';
import FileManager from '../pages/FileManager';
import Subscriptions from '../pages/Subscriptions';
import Profile from '../pages/Profile';
import TeamManagement from '../pages/TeamManagement';

import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import { PERMISSIONS } from '../config/rbac';

// Role-Based Route Component Resolvers
function RoleDashboard() {
  const { user } = useAuth();
  switch (user?.role) {
    case 'SUPER_ADMIN': return <SuperAdminDashboard />;
    case 'COMPANY_ADMIN': return <CompanyAdminDashboard />;
    case 'PROJECT_MANAGER': return <PMDashboard />;
    case 'SITE_ENGINEER': return <SEDashboard />;
    case 'CONTRACTOR': return <ContractorDashboard />;
    case 'WORKER': return <WorkerDashboard />;
    default: return <SuperAdminDashboard />;
  }
}

function RoleCompanies() {
  return <SuperAdminCompanies />;
}

function RoleFinance() {
  const { user } = useAuth();
  return user?.role === 'SUPER_ADMIN' ? <SuperAdminFinance /> : <CompanyAdminFinance />;
}

function RoleReports() {
  const { user } = useAuth();
  switch (user?.role) {
    case 'SUPER_ADMIN': return <SuperAdminReports />;
    case 'COMPANY_ADMIN': return <CompanyAdminReports />;
    case 'PROJECT_MANAGER': return <PMReports />;
    default: return <SuperAdminReports />;
  }
}

function RoleAIInsights() {
  const { user } = useAuth();
  return user?.role === 'COMPANY_ADMIN' ? <CompanyAdminAIInsights /> : <SuperAdminAIInsights />;
}

function RoleUsers() {
  return <SuperAdminUsers />;
}

function RoleSettings() {
  const { user } = useAuth();
  switch (user?.role) {
    case 'SUPER_ADMIN': return <SuperAdminSettings />;
    case 'COMPANY_ADMIN': return <CompanyAdminSettings />;
    case 'PROJECT_MANAGER': return <PMSettings />;
    case 'SITE_ENGINEER': return <SESettings />;
    case 'CONTRACTOR': return <ContractorSettings />;
    case 'WORKER': return <WorkerSettings />;
    default: return <SuperAdminSettings />;
  }
}

function RoleProjects() {
  const { user } = useAuth();
  switch (user?.role) {
    case 'SUPER_ADMIN': return <SuperAdminProjects />;
    case 'COMPANY_ADMIN': return <CompanyAdminProjects />;
    case 'PROJECT_MANAGER': return <PMProjects />;
    case 'CONTRACTOR': return <ContractorProjects />;
    default: return <SuperAdminProjects />;
  }
}

function RoleWorkforce() {
  const { user } = useAuth();
  switch (user?.role) {
    case 'SUPER_ADMIN': return <SuperAdminWorkforce />;
    case 'COMPANY_ADMIN': return <CompanyAdminWorkforce />;
    case 'CONTRACTOR': return <ContractorWorkforce />;
    default: return <SuperAdminWorkforce />;
  }
}

function RoleEquipment() {
  const { user } = useAuth();
  switch (user?.role) {
    case 'COMPANY_ADMIN': return <CompanyAdminEquipment />;
    case 'PROJECT_MANAGER': return <PMEquipment />;
    case 'SITE_ENGINEER': return <SEEquipment />;
    case 'WORKER': return <WorkerEquipment />;
    default: return <CompanyAdminEquipment />;
  }
}

function RoleMaterials() {
  const { user } = useAuth();
  switch (user?.role) {
    case 'COMPANY_ADMIN': return <CompanyAdminMaterials />;
    case 'SITE_ENGINEER': return <SEMaterials />;
    case 'WORKER': return <WorkerMaterials />;
    default: return <CompanyAdminMaterials />;
  }
}

function RoleTaskManagement() {
  const { user } = useAuth();
  switch (user?.role) {
    case 'PROJECT_MANAGER': return <PMTaskManagement />;
    case 'CONTRACTOR': return <ContractorTasks />;
    case 'WORKER': return <WorkerTasks />;
    default: return <PMTaskManagement />;
  }
}

function RoleAttendance() {
  const { user } = useAuth();
  switch (user?.role) {
    case 'WORKER': return <WorkerAttendance />;
    case 'SITE_ENGINEER': return <SEAttendance />;
    default: return <ContractorAttendance />;
  }
}

function RoleDailyReport() {
  const { user } = useAuth();
  switch (user?.role) {
    case 'SITE_ENGINEER': return <SEDailyProgressReport />;
    case 'WORKER': return <Navigate to="/dashboard" replace />;
    default: return <PMDailyProgressReport />;
  }
}

function RoleSafety() {
  const { user } = useAuth();
  return user?.role === 'WORKER' ? <Navigate to="/dashboard" replace /> : <SESiteIssues />;
}

function RoleNotifications() {
  const { user } = useAuth();
  switch (user?.role) {
    case 'COMPANY_ADMIN': return <Notifications />;
    case 'PROJECT_MANAGER': return <PMNotifications />;
    default: return <Notifications />;
  }
}

function RoleDocuments() {
  const { user } = useAuth();
  switch (user?.role) {
    case 'COMPANY_ADMIN': return <CompanyAdminDocuments />;
    case 'PROJECT_MANAGER': return <PMDocuments />;
    case 'SITE_ENGINEER': return <SEDocuments />;
    case 'WORKER': return <WorkerDocuments />;
    default: return <CompanyAdminDocuments />;
  }
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/oauth2/redirect" element={<OAuthRedirect />} />

      <Route element={<DashboardLayout />}>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.DASHBOARD_VIEW}>
              <RoleDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/companies"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.COMPANY_ADMIN_MANAGE}>
              <RoleCompanies />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company-profile"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.COMPANY_ADMIN_MANAGE}>
              <CompanyProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.COMPANY_ADMIN_MANAGE}>
              <RoleUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.PROJECT_VIEW}>
              <RoleProjects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workforce"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.WORKFORCE_VIEW}>
              <RoleWorkforce />
            </ProtectedRoute>
          }
        />
        <Route
          path="/team-management"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.WORKFORCE_MANAGE}>
              <TeamManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/site-workforce"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.WORKFORCE_VIEW}>
              <PMSiteWorkforce />
            </ProtectedRoute>
          }
        />
        <Route
          path="/materials"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.WORKFORCE_VIEW}>
              <RoleMaterials />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.ATTENDANCE_MARK}>
              <RoleAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/task-management"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.TASK_MANAGE}>
              <RoleTaskManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/daily-report"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.TASK_MANAGE}>
              <RoleDailyReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/daily-logs"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.TASK_MANAGE}>
              <RoleDailyReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inspection"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.DOCUMENT_MANAGE}>
              <SEInspectionImages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/safety"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.WORKFORCE_MANAGE}>
              <RoleSafety />
            </ProtectedRoute>
          }
        />
        <Route
          path="/equipment"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.EQUIPMENT_VIEW}>
              <RoleEquipment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.FINANCE_VIEW}>
              <RoleFinance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-insights"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.AI_VIEW}>
              <RoleAIInsights />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscriptions"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.SYSTEM_ADMIN_MANAGE}>
              <Subscriptions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.NOTIFICATION_VIEW}>
              <RoleNotifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/audit-logs"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.REPORT_VIEW}>
              <RoleReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/security"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.SYSTEM_ADMIN_MANAGE}>
              <SecurityCenter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.PROFILE_EDIT}>
              <RoleSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company-settings"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.COMPANY_ADMIN_MANAGE}>
              <CompanyAdminSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/files"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.DOCUMENT_VIEW}>
              <FileManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/integrations"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.SYSTEM_ADMIN_MANAGE}>
              <Integrations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/system-monitoring"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.SYSTEM_ADMIN_MANAGE}>
              <SystemMonitoring />
            </ProtectedRoute>
          }
        />
        <Route
          path="/backup"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.SYSTEM_ADMIN_MANAGE}>
              <BackupRestore />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.REPORT_VIEW}>
              <RoleReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.DOCUMENT_VIEW}>
              <RoleDocuments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.PROFILE_EDIT}>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
