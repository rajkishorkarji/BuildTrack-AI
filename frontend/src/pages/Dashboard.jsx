import { useAuth } from '../context/AuthContext';
import DashboardStats from '../components/dashboard/DashboardStats';
import DailyActivities from '../components/dashboard/DailyActivities';
import ProjectProgress from '../components/dashboard/ProjectProgress';
import LiveSiteMap from '../components/dashboard/LiveSiteMap';
import OverallCompletion from '../components/dashboard/OverallCompletion';
import AnalyticsOverview from '../components/dashboard/AnalyticsOverview';
import { SuperAdminDashboard, CompanyAdminDashboard, SiteEngineerDashboard, ContractorDashboard, WorkerDashboard } from '../components/dashboard/RoleDashboards';
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
          <span
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontWeight: 700,
              fontSize: '13px',
              background: 'rgba(78, 132, 247, 0.15)',
              color: 'var(--blue)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            Role: {user?.roleLabel || 'Super Admin'}
          </span>
          <button type="button" className="date-chip">
            Jun 21, 2025
          </button>
        </div>
      </section>

      {/* Dynamic Role-Specific Dashboard Content */}
      {role === 'SUPER_ADMIN' && <SuperAdminDashboard />}

      {role === 'COMPANY_ADMIN' && <CompanyAdminDashboard />}

      {role === 'PROJECT_MANAGER' && (
        <>
          <DashboardStats />
          <section className="dashboard-top-row">
            <DailyActivities />
            <ProjectProgress />
            <LiveSiteMap />
          </section>
          <section className="dashboard-bottom-grid">
            <OverallCompletion />
            <article className="panel preview-panel">
              <div className="project-preview">
                <div className="project-image-frame">
                  <img
                    src={constructionSiteImage}
                    alt="Metro Tower Complex construction site"
                    className="project-image"
                  />
                </div>
                <div className="preview-overlay">
                  <div>
                    <h3>Metro Tower Complex</h3>
                    <p>Tower A • Floor 14 / 32</p>
                  </div>
                  <span className="schedule-pill">On Schedule</span>
                </div>
              </div>

              <div className="progress-footer">
                <div className="footer-head">
                  <strong>Construction Progress</strong>
                  <span>66%</span>
                </div>
                <div className="footer-bar">
                  <div className="footer-fill" style={{ width: '66%' }} />
                </div>
                <div className="footer-meta">
                  <span>Started: Jan 15, 2024</span>
                  <span>Est. Complete: Dec 2025</span>
                </div>
              </div>
            </article>

            <article className="panel team-panel">
              <div className="panel-header">
                <div>
                  <h3>Today&apos;s Team Leader</h3>
                  <p>Top performer</p>
                </div>
                <span className="top-performer-pill">Top Performer</span>
              </div>

              <div className="leader-card">
                <div className="leader-avatar">
                  <span>DK</span>
                  <div className="status-dot" />
                </div>
                <h4>Divya Krishnan</h4>
                <p>Senior Site Engineer</p>

                <div className="performance-box">
                  <span>Performance Score</span>
                  <strong>9.4</strong>
                  <small>Excellent</small>
                </div>

                <div className="leader-metrics">
                  <div>
                    <strong>47</strong>
                    <span>Tasks Done</span>
                  </div>
                  <div>
                    <strong>98%</strong>
                    <span>On Time</span>
                  </div>
                  <div>
                    <strong>18</strong>
                    <span>Team Size</span>
                  </div>
                </div>

                <button type="button" className="primary-button full-width">View Full Profile</button>
              </div>
            </article>
          </section>
          <AnalyticsOverview />
        </>
      )}

      {role === 'SITE_ENGINEER' && <SiteEngineerDashboard />}

      {role === 'CONTRACTOR' && <ContractorDashboard />}

      {role === 'WORKER' && <WorkerDashboard />}
    </div>
  );
}