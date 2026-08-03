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

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/company-profile" element={<CompanyProfile />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/workforce" element={<Workforce />} />
        <Route path="/team-management" element={<TeamManagement />} />
        <Route path="/site-workforce" element={<SiteWorkforce />} />
        <Route path="/materials" element={<Materials />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/task-management" element={<TaskManagement />} />
        <Route path="/daily-report" element={<DailyProgressReport />} />
        <Route path="/inspection" element={<InspectionImages />} />
        <Route path="/safety" element={<SiteIssues />} />
        <Route path="/equipment" element={<Equipment />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/ai-insights" element={<AIInsights />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/audit-logs" element={<Reports />} />
        <Route path="/security" element={<SecurityCenter />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/company-settings" element={<CompanySettings />} />
        <Route path="/files" element={<FileManager />} />
        <Route path="/integrations" element={<Integrations />} />
        <Route path="/system-monitoring" element={<SystemMonitoring />} />
        <Route path="/backup" element={<BackupRestore />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}