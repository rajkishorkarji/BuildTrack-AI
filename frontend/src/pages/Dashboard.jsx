import { useAuth } from '../context/AuthContext';
import DashboardStats from '../components/dashboard/DashboardStats';
import DailyActivities from '../components/dashboard/DailyActivities';
import ProjectProgress from '../components/dashboard/ProjectProgress';
import LiveSiteMap from '../components/dashboard/LiveSiteMap';
import OverallCompletion from '../components/dashboard/OverallCompletion';
import AnalyticsOverview from '../components/dashboard/AnalyticsOverview';
import {
  SuperAdminDashboard,
  CompanyAdminDashboard,
  ProjectManagerDashboard,
  SiteEngineerDashboard,
  ContractorDashboard,
  WorkerDashboard,
} from '../components/dashboard/RoleDashboards';
import constructionSiteImage from '../assets/images/construction-site.jpg';

export default function Dashboard() {
  const { user } = useAuth();
  const role = user?.role || 'SUPER_ADMIN';

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow">
            {role === 'SUPER_ADMIN' && 'Master System Control Panel'}
            {role === 'COMPANY_ADMIN' && 'Company Management Portal'}
            {role === 'PROJECT_MANAGER' && 'Project Management Hub'}
            {role === 'SITE_ENGINEER' && 'On-Site Engineering Desk'}
            {role === 'CONTRACTOR' && 'Subcontractor Labor Hub'}
            {role === 'WORKER' && 'Worker Mobile Assistant'}
          </p>
          <h1>Welcome, {user?.fullName || 'Rajkishor Karji'}</h1>
        </div>
        <div className="hero-actions">
          <button type="button" className="date-chip">
            Jun 21, 2025
          </button>
        </div>
      </section>

      {/* Dynamic Role-Specific Dashboard Content */}
      {role === 'SUPER_ADMIN' && <SuperAdminDashboard />}

      {role === 'COMPANY_ADMIN' && <CompanyAdminDashboard />}

      {role === 'PROJECT_MANAGER' && <ProjectManagerDashboard />}

      {role === 'SITE_ENGINEER' && <SiteEngineerDashboard />}

      {role === 'CONTRACTOR' && <ContractorDashboard />}

      {role === 'WORKER' && <WorkerDashboard />}
    </div>
  );
}