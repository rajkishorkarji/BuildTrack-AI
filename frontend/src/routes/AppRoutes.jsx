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

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/workforce" element={<Workforce />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/task-management" element={<TaskManagement />} />
        <Route path="/equipment" element={<Equipment />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/ai-insights" element={<AIInsights />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}