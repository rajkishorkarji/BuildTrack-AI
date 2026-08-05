import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import Dashboard from '../pages/Dashboard';
import Projects from '../pages/Projects';
import Workforce from '../pages/Workforce';
import Attendance from '../pages/Attendance';
import TaskManagement from '../pages/TaskManagement';
import Equipment from '../pages/Equipment';
import Finance from '../pages/Finance';
import AIInsights from '../pages/AIInsights';
import Notifications from '../pages/Notifications';
import Reports from '../pages/Reports';
import Documents from '../pages/Documents';
import Settings from '../pages/Settings';
import Login from '../pages/Login';
import Companies from '../pages/Companies';
import UsersPage from '../pages/UsersPage';
import SecurityCenter from '../pages/SecurityCenter';
import SystemMonitoring from '../pages/SystemMonitoring';
import BackupRestore from '../pages/BackupRestore';
import Integrations from '../pages/Integrations';
import FileManager from '../pages/FileManager';
import Subscriptions from '../pages/Subscriptions';
import Profile from '../pages/Profile';
import CompanyProfile from '../pages/CompanyProfile';
import Materials from '../pages/Materials';
import SiteWorkforce from '../pages/SiteWorkforce';
import CompanySettings from '../pages/CompanySettings';
import TeamManagement from '../pages/TeamManagement';
import InspectionImages from '../pages/InspectionImages';
import SiteIssues from '../pages/SiteIssues';
import DailyProgressReport from '../pages/DailyProgressReport';
import ProtectedRoute from './ProtectedRoute';
import { PERMISSIONS } from '../config/rbac';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />

      <Route element={<DashboardLayout />}>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.DASHBOARD_VIEW}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/companies"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.COMPANY_ADMIN_MANAGE}>
              <Companies />
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
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.PROJECT_VIEW}>
              <Projects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workforce"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.WORKFORCE_VIEW}>
              <Workforce />
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
              <SiteWorkforce />
            </ProtectedRoute>
          }
        />
        <Route
          path="/materials"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.WORKFORCE_VIEW}>
              <Materials />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.ATTENDANCE_MARK}>
              <Attendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/task-management"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.TASK_MANAGE}>
              <TaskManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/daily-report"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.TASK_MANAGE}>
              <DailyProgressReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inspection"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.DOCUMENT_MANAGE}>
              <InspectionImages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/safety"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.WORKFORCE_MANAGE}>
              <SiteIssues />
            </ProtectedRoute>
          }
        />
        <Route
          path="/equipment"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.EQUIPMENT_VIEW}>
              <Equipment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.FINANCE_VIEW}>
              <Finance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-insights"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.AI_VIEW}>
              <AIInsights />
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
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/audit-logs"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.REPORT_VIEW}>
              <Reports />
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
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company-settings"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.COMPANY_ADMIN_MANAGE}>
              <CompanySettings />
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
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.DOCUMENT_VIEW}>
              <Documents />
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