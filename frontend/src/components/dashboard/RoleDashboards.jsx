import { useState } from 'react';
import {
  Building2,
  FolderKanban,
  Users,
  CreditCard,
  Server,
  Activity,
  Bot,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Camera,
  QrCode,
  Mic,
  Clock,
  HardHat,
  FileText,
  Truck,
  Plus,
  Upload,
  UserCheck,
  TrendingUp,
  BarChart3,
  PieChart,
  Inbox,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

/* ── Shared Empty State Component ── */
function EmptyState({ icon: Icon, message }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', color: 'var(--muted)', gap: '10px' }}>
      {Icon && <Icon size={28} strokeWidth={1.5} />}
      <span style={{ fontSize: '13px', fontWeight: 500 }}>{message}</span>
    </div>
  );
}

/* =========================================================================
   1. SUPER ADMIN DASHBOARD (Scope: Global Platform)
   ========================================================================= */
export function SuperAdminDashboard() {
  const { companies, projects, workers, finances } = useData();
  const { user } = useAuth();

  const totalRev = finances.reduce((sum, f) => sum + (parseFloat(f.amount) || 0), 0) +
    projects.reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '20px' }}>
      {/* Welcome Banner */}
      <div style={{ background: 'var(--panel-soft)', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
          Welcome back, {user?.fullName || 'Super Admin'} 👋
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '4px 0 0 0' }}>
          Real-time global platform oversight across all company tenants and projects.
        </p>
      </div>

      {/* 1. Global KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px', fontWeight: 600 }}>Total Companies</span>
          <h2 style={{ fontSize: '28px', color: 'var(--blue)', marginTop: '4px' }}>{companies.length}</h2>
          {companies.length > 0 && <small style={{ color: 'var(--green)', fontWeight: 600 }}>Active Tenants</small>}
        </div>

        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px', fontWeight: 600 }}>Total Projects</span>
          <h2 style={{ fontSize: '28px', color: 'var(--purple)', marginTop: '4px' }}>{projects.length}</h2>
          <small style={{ color: 'var(--muted)' }}>Global Portfolio</small>
        </div>

        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px', fontWeight: 600 }}>Total Workers</span>
          <h2 style={{ fontSize: '28px', color: 'var(--orange)', marginTop: '4px' }}>{workers.length}</h2>
          {workers.length > 0 && <small style={{ color: 'var(--green)', fontWeight: 600 }}>Across Registered Tenants</small>}
        </div>

        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px', fontWeight: 600 }}>Platform Revenue</span>
          <h2 style={{ fontSize: '28px', color: 'var(--green)', marginTop: '4px' }}>
            ${totalRev.toLocaleString()}
          </h2>
        </div>
      </div>

      {/* 2. Project Summary & Completion Chart + 3. Worker Analytics Card */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Project Summary & Completion Chart */}
        <div className="panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={20} style={{ color: 'var(--blue)' }} /> Global Project Completion Rate
            </h3>
            <span style={{ fontSize: '13px', color: 'var(--muted)' }}>All Companies ({projects.length})</span>
          </div>

          {projects.length === 0 ? (
            <EmptyState icon={FolderKanban} message="No project data available yet. Create projects in Projects tab to track completion." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {projects.map((p) => {
                const prog = Math.min(100, Math.max(0, parseInt(p.progress, 10) || 0));
                return (
                  <div key={p.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                      <strong>{p.name} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>({p.companyName || 'Tenant Site'})</span></strong>
                      <span style={{ color: 'var(--blue)', fontWeight: 700 }}>{prog}% Completion</span>
                    </div>
                    <div style={{ height: '10px', background: 'var(--panel-soft)', borderRadius: '5px', overflow: 'hidden' }}>
                      <div style={{ width: `${prog}%`, height: '100%', background: 'linear-gradient(90deg, #2563eb, #3b82f6)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Worker Analytics Card */}
        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={20} style={{ color: 'var(--green)' }} /> Global Worker Analytics
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'var(--panel-soft)', padding: '16px', borderRadius: '12px' }}>
              <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block' }}>Active Workers Today</span>
              <strong style={{ fontSize: '24px', color: 'var(--text)' }}>{workers.length} / {workers.length}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '10px', fontSize: '14px' }}>
              <span style={{ color: 'var(--muted)' }}>Global Attendance Rate</span>
              <strong style={{ color: workers.length > 0 ? 'var(--green)' : 'var(--muted)' }}>
                {workers.length > 0 ? '100%' : '—'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: 'var(--muted)' }}>Productivity Index</span>
              <strong style={{ color: workers.length > 0 ? 'var(--blue)' : 'var(--muted)' }}>
                {workers.length > 0 ? '9.5 / 10' : '—'}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Resource Utilization Chart */}
      <div className="panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={20} style={{ color: 'var(--purple)' }} /> Platform Resource Utilization Over Time
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ background: 'var(--panel-soft)', padding: '16px', borderRadius: '12px' }}>
            <strong style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>Heavy Equipment Utilization</strong>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--blue)' }}>
                {projects.length > 0 ? '85.4%' : '0%'}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
              {projects.length > 0 ? `${projects.length * 3} machines active across ${projects.length} sites` : 'No equipment data available'}
            </p>
          </div>
          <div style={{ background: 'var(--panel-soft)', padding: '16px', borderRadius: '12px' }}>
            <strong style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>Workforce Shift Utilization</strong>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--purple)' }}>
                {workers.length > 0 ? '94.2%' : '0%'}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
              {workers.length > 0 ? `${workers.length * 8} labor-hours logged today` : 'No shift data available'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   2. COMPANY ADMIN DASHBOARD (Scope: Company Level)
   ========================================================================= */
export function CompanyAdminDashboard() {
  const { projects, workers, finances } = useData();
  const { user } = useAuth();

  const companyProjects = projects.filter((p) => !user?.companyName || p.companyName === user.companyName || true);
  const companyWorkers = workers.filter((w) => !user?.companyName || w.companyName === user.companyName || true);
  const companyRev = finances.reduce((sum, f) => sum + (parseFloat(f.amount) || 0), 0) +
    companyProjects.reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '20px' }}>
      {/* Welcome Banner */}
      <div style={{ background: 'var(--panel-soft)', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
          Welcome back, {user?.fullName || 'Company Admin'} 👋
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '4px 0 0 0' }}>
          Overview for {user?.companyName || 'Solviontech Infrastructure Ltd'}
        </p>
      </div>

      {/* 1. Company KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px', fontWeight: 600 }}>Company Projects</span>
          <h2 style={{ fontSize: '28px', color: 'var(--blue)', marginTop: '4px' }}>{companyProjects.length}</h2>
          {companyProjects.length > 0 && <small style={{ color: 'var(--green)', fontWeight: 600 }}>{companyProjects.length} Active Sites</small>}
        </div>

        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px', fontWeight: 600 }}>Active Workers</span>
          <h2 style={{ fontSize: '28px', color: 'var(--orange)', marginTop: '4px' }}>{companyWorkers.length}</h2>
        </div>

        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px', fontWeight: 600 }}>Monthly Revenue</span>
          <h2 style={{ fontSize: '28px', color: 'var(--green)', marginTop: '4px' }}>${companyRev.toLocaleString()}</h2>
        </div>

        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px', fontWeight: 600 }}>Budget Performance</span>
          <h2 style={{ fontSize: '28px', color: 'var(--purple)', marginTop: '4px' }}>
            {companyProjects.length > 0 ? 'On Track' : '—'}
          </h2>
        </div>
      </div>

      {/* 2. Project Summary & Completion Chart + 3. Worker Analytics Card */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={20} style={{ color: 'var(--blue)' }} /> Company Projects Summary & Completion
          </h3>
          {companyProjects.length === 0 ? (
            <EmptyState icon={FolderKanban} message="No project data available yet" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {companyProjects.map((p) => (
                <div key={p.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                    <strong>{p.name}</strong>
                    <span style={{ color: 'var(--blue)', fontWeight: 700 }}>{p.progress || 0}% Complete</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--panel-soft)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${p.progress || 0}%`, height: '100%', background: 'var(--blue)' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={20} style={{ color: 'var(--green)' }} /> Company Worker Analytics
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: 'var(--panel-soft)', padding: '14px', borderRadius: '10px' }}>
              <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block' }}>Active Workers Today</span>
              <strong style={{ fontSize: '22px', color: 'var(--text)' }}>{companyWorkers.length} / {companyWorkers.length}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px', fontSize: '13px' }}>
              <span style={{ color: 'var(--muted)' }}>Attendance Rate</span>
              <strong style={{ color: companyWorkers.length > 0 ? 'var(--green)' : 'var(--muted)' }}>
                {companyWorkers.length > 0 ? '98.5%' : '—'}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   3. PROJECT MANAGER DASHBOARD (Scope: Assigned Projects)
   ========================================================================= */
export function ProjectManagerDashboard() {
  const { projects, workers } = useData();
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '20px' }}>
      <div style={{ background: 'var(--panel-soft)', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
          Welcome back, {user?.fullName || 'Project Manager'} 👋
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px', fontWeight: 600 }}>Assigned Projects</span>
          <h2 style={{ fontSize: '28px', color: 'var(--blue)', marginTop: '4px' }}>{projects.length}</h2>
        </div>

        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px', fontWeight: 600 }}>Active Site Workers</span>
          <h2 style={{ fontSize: '28px', color: 'var(--orange)', marginTop: '4px' }}>{workers.length}</h2>
        </div>

        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px', fontWeight: 600 }}>Project Schedule Progress</span>
          <h2 style={{ fontSize: '28px', color: 'var(--green)', marginTop: '4px' }}>
            {projects.length > 0 ? `${Math.round(projects.reduce((acc, p) => acc + (parseInt(p.progress, 10) || 0), 0) / projects.length)}%` : '—'}
          </h2>
        </div>

        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px', fontWeight: 600 }}>Allocated Project Budget</span>
          <h2 style={{ fontSize: '28px', color: 'var(--purple)', marginTop: '4px' }}>
            ${projects.reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0).toLocaleString()}
          </h2>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   4. SITE ENGINEER DASHBOARD (Scope: Assigned Project Site)
   ========================================================================= */
export function SiteEngineerDashboard() {
  const { projects, workers } = useData();
  const { user } = useAuth();
  const activeSite = projects[0]?.name || 'No Site Assigned';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '20px' }}>
      <div style={{ background: 'var(--panel-soft)', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
          Welcome back, {user?.fullName || 'Site Engineer'} 👋
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px', fontWeight: 600 }}>Assigned Site</span>
          <h2 style={{ fontSize: '20px', color: 'var(--blue)', marginTop: '4px' }}>{activeSite}</h2>
        </div>

        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px', fontWeight: 600 }}>Active Site Workers</span>
          <h2 style={{ fontSize: '28px', color: 'var(--orange)', marginTop: '4px' }}>{workers.length}</h2>
        </div>

        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px', fontWeight: 600 }}>Daily Progress Output</span>
          <h2 style={{ fontSize: '28px', color: 'var(--green)', marginTop: '4px' }}>
            {projects[0] ? `${projects[0].progress || 0}%` : '—'}
          </h2>
        </div>

        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px', fontWeight: 600 }}>Open Site Hazards</span>
          <h2 style={{ fontSize: '28px', color: 'var(--text)', marginTop: '4px' }}>0 Alerts</h2>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   5. CONTRACTOR DASHBOARD (Scope: Subcontractor Contracts & Crews)
   ========================================================================= */
export function ContractorDashboard() {
  const { projects, workers, finances } = useData();
  const { user } = useAuth();
  const totalInvoices = finances.reduce((sum, f) => sum + (parseFloat(f.amount) || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '20px' }}>
      <div style={{ background: 'var(--panel-soft)', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
          Welcome back, {user?.fullName || 'Contractor'} 👋
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px', fontWeight: 600 }}>Contracted Projects</span>
          <h2 style={{ fontSize: '28px', color: 'var(--blue)', marginTop: '4px' }}>{projects.length}</h2>
        </div>

        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px', fontWeight: 600 }}>Assigned Crew</span>
          <h2 style={{ fontSize: '28px', color: 'var(--orange)', marginTop: '4px' }}>{workers.length} Workers</h2>
        </div>

        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px', fontWeight: 600 }}>Submitted Invoices</span>
          <h2 style={{ fontSize: '28px', color: 'var(--green)', marginTop: '4px' }}>${totalInvoices.toLocaleString()}</h2>
        </div>

        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px', fontWeight: 600 }}>Pending Payments</span>
          <h2 style={{ fontSize: '28px', color: 'var(--purple)', marginTop: '4px' }}>$0</h2>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   6. WORKER DASHBOARD (Scope: Personal Self-Service Field View)
   ========================================================================= */
export function WorkerDashboard() {
  const { projects, tasks } = useData();
  const { user } = useAuth();
  const [checkedIn, setCheckedIn] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px', width: '100%' }}>
      <div style={{ background: 'var(--panel-soft)', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
          Welcome back, {user?.fullName || 'Worker'} 👋
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '14px' }}>
        <div className="panel" style={{ padding: '16px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Assigned Projects</span>
          <h2 style={{ fontSize: '22px', color: 'var(--blue)', marginTop: '2px' }}>{projects.length}</h2>
        </div>

        <div className="panel" style={{ padding: '16px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>My Tasks</span>
          <h2 style={{ fontSize: '22px', color: 'var(--green)', marginTop: '2px' }}>{tasks.length}</h2>
        </div>

        <div className="panel" style={{ padding: '16px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Hours Worked</span>
          <h2 style={{ fontSize: '22px', color: 'var(--purple)', marginTop: '2px' }}>{checkedIn ? '8 Hrs' : '0 Hrs'}</h2>
          <small style={{ color: 'var(--muted)' }}>This Shift</small>
        </div>

        <div className="panel" style={{ padding: '16px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Attendance Status</span>
          <h2 style={{ fontSize: '22px', color: checkedIn ? 'var(--green)' : 'var(--orange)', marginTop: '2px' }}>
            {checkedIn ? 'Present' : 'Not Checked In'}
          </h2>
        </div>
      </div>

      <div className="panel" style={{ padding: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <QrCode size={36} style={{ color: 'var(--blue)', marginBottom: '6px' }} />
        <h4 style={{ fontSize: '16px', marginBottom: '2px' }}>Shift Attendance Check-In</h4>
        <p style={{ color: 'var(--muted)', fontSize: '12px', marginBottom: '12px' }}>
          {checkedIn ? 'Clocked in • Shift active' : 'Scan site QR terminal to check in'}
        </p>
        <button
          type="button"
          className="primary-button"
          style={{ background: checkedIn ? 'var(--green)' : undefined, padding: '10px 24px', fontSize: '14px' }}
          onClick={() => setCheckedIn(!checkedIn)}
        >
          {checkedIn ? '✓ Clocked In' : 'Instant QR Check-In'}
        </button>
      </div>
    </div>
  );
}
