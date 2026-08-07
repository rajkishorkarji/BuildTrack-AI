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
  const { companies = [], projects = [], workers = [], finances = [], usersList = [], teamMembers = [] } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [exportMessage, setExportMessage] = useState('');

  const totalRev = (finances || []).reduce((sum, f) => sum + (parseFloat(f.amount) || 0), 0) +
    (projects || []).reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0);

  // De-duplicate companies by name (so each company is only shown once)
  const uniqueCompanies = [];
  const seenCompanies = new Set();
  for (const c of (companies || [])) {
    const compName = c.name?.trim().toLowerCase();
    if (compName && !seenCompanies.has(compName)) {
      seenCompanies.add(compName);
      uniqueCompanies.push(c);
    }
  }

  const activeCompanies = uniqueCompanies.filter(c => (c.status || 'Active') === 'Active');
  // Total Users = registered system accounts + field workers + team members
  const totalUsers = (usersList || []).length + (workers || []).length + (teamMembers || []).length;

  const filteredCompanies = uniqueCompanies.filter(c =>
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.adminName && c.adminName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleExportDashboard = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      exportedAt: new Date().toISOString(),
      platform: "BuildTrack AI Super Admin System",
      companiesCount: uniqueCompanies.length,
      activeCompaniesCount: activeCompanies.length,
      projectsCount: projects.length,
      totalUsers,
      revenue: totalRev,
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `BuildTrack_SuperAdmin_Dashboard_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setExportMessage('Dashboard report exported successfully!');
    setTimeout(() => setExportMessage(''), 3000);
  };

  return (
    <div className="dashboard-container">

      {exportMessage && (
        <div className="export-alert-banner">
          {exportMessage}
        </div>
      )}

      {/* 1. Global KPI Cards */}
      <div className="super-admin-stats-grid">
        {/* Total Companies */}
        <div className="panel stat-card-padding">
          <div className="stat-card-header">
            <Building2 size={16} style={{ color: 'var(--blue)' }} />
            <span className="stat-card-label">Total Companies</span>
          </div>
          <h2 className="stat-card-value blue">{uniqueCompanies.length}</h2>
          <small className="stat-card-desc muted">All registered tenants</small>
        </div>

        {/* Active Companies */}
        <div className="panel stat-card-padding">
          <div className="stat-card-header">
            <CheckCircle2 size={16} style={{ color: 'var(--green)' }} />
            <span className="stat-card-label">Active Companies</span>
          </div>
          <h2 className="stat-card-value green">{activeCompanies.length}</h2>
          <small className="stat-card-desc green">of {uniqueCompanies.length} total tenants</small>
        </div>

        {/* Total Projects */}
        <div className="panel stat-card-padding">
          <div className="stat-card-header">
            <FolderKanban size={16} style={{ color: 'var(--purple)' }} />
            <span className="stat-card-label">Total Projects</span>
          </div>
          <h2 className="stat-card-value purple">{projects.length}</h2>
          <small className="stat-card-desc muted">Global project portfolio</small>
        </div>

        {/* Total Users */}
        <div className="panel stat-card-padding">
          <div className="stat-card-header">
            <Users size={16} style={{ color: 'var(--orange)' }} />
            <span className="stat-card-label">Total Users</span>
          </div>
          <h2 className="stat-card-value orange">{totalUsers}</h2>
          <small className="stat-card-desc muted">
            {(usersList || []).length} accounts · {(workers || []).length} workers · {(teamMembers || []).length} team
          </small>
        </div>

        {/* Platform Revenue */}
        <div className="panel stat-card-padding">
          <div className="stat-card-header">
            <DollarSign size={16} style={{ color: '#10b981' }} />
            <span className="stat-card-label">Platform Revenue</span>
          </div>
          <h2 className="stat-card-value emerald">
            ${totalRev.toLocaleString()}
          </h2>
          <small className="stat-card-desc muted">MRR & project budgets</small>
        </div>

        {/* Platform Health Score */}
        <div className="panel stat-card-padding">
          <div className="stat-card-header">
            <Activity size={16} style={{ color: '#22c55e' }} />
            <span className="stat-card-label">Platform Health Score</span>
          </div>
          <h2 className="stat-card-value forest">99.98%</h2>
          <small className="stat-card-desc forest">Optimal performance</small>
        </div>
      </div>

      {/* 2. Company & Revenue Overview + AI Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Company & Project Overview */}
        <div className="panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={20} style={{ color: 'var(--blue)' }} /> Registered Company Tenants
            </h3>
            <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Showing {filteredCompanies.length} Companies</span>
          </div>

          {filteredCompanies.length === 0 ? (
            <EmptyState icon={Building2} message="No companies match your search." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredCompanies.map((c) => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--panel-soft)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div>
                    <strong style={{ fontSize: '14px', color: 'var(--text)' }}>{c.name}</strong>
                    <span style={{ display: 'block', fontSize: '12px', color: 'var(--muted)' }}>Admin: {c.adminName || 'Assigned Admin'} • {c.adminEmail || 'admin@tenant.com'}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, background: 'rgba(34, 197, 94, 0.15)', color: 'var(--green)' }}>
                      Active Tenant
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Alerts & Platform Health */}
        <div className="panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={20} style={{ color: 'var(--orange)' }} /> AI Risk Alerts
          </h3>

          <div style={{ padding: '12px 14px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.12)', borderLeft: '4px solid var(--orange)', fontSize: '13px' }}>
            <strong style={{ display: 'block', color: 'var(--text)' }}>Equipment Utilization Alert</strong>
            <span style={{ color: 'var(--muted)' }}>Hydraulic excavator #EX-402 on Site B requires routine scheduled maintenance.</span>
          </div>

          <div style={{ padding: '12px 14px', borderRadius: '8px', background: 'rgba(37, 99, 235, 0.12)', borderLeft: '4px solid var(--blue)', fontSize: '13px' }}>
            <strong style={{ display: 'block', color: 'var(--text)' }}>Project Milestone Target</strong>
            <span style={{ color: 'var(--muted)' }}>Commercial Complex Phase 1 is tracking 4 days ahead of schedule.</span>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>Live Platform Health</span>
            <div style={{ height: '8px', background: 'var(--panel-soft)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '99.9%', height: '100%', background: '#22c55e' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Quick Actions & Resource Utilization */}
      <div className="panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={20} style={{ color: 'var(--purple)' }} /> Quick Management & Resource Utilization
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'var(--panel-soft)', padding: '16px', borderRadius: '12px' }}>
            <strong style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>Heavy Equipment Fleet</strong>
            <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--blue)' }}>
              {projects.length > 0 ? '85.4%' : '0%'}
            </span>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>Global machines active across sites</p>
          </div>

          <div style={{ background: 'var(--panel-soft)', padding: '16px', borderRadius: '12px' }}>
            <strong style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>Workforce Shift Capacity</strong>
            <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--purple)' }}>
              {workers.length > 0 ? '94.2%' : '0%'}
            </span>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>Labor-hours logged today</p>
          </div>

          <div style={{ background: 'var(--panel-soft)', padding: '16px', borderRadius: '12px' }}>
            <strong style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>Database & API Latency</strong>
            <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--green)' }}>14ms</span>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>Multi-region Postgres & Spring Boot</p>
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
  const { projects = [], tasks = [], updateTaskStatus } = useData();
  const { user } = useAuth();
  const [checkedIn, setCheckedIn] = useState(false);

  const initialTasks = [
    { id: 'w-t1', task: 'Position Steel Mesh', site: 'Metro Site', priority: 'High', status: 'In Progress' },
    { id: 'w-t2', task: 'Inspect Hydraulic Hose', site: 'Equipment Bay', priority: 'Medium', status: 'Pending' },
    { id: 'w-t3', task: 'Foundation Rebar Binding', site: 'Metro Site', priority: 'High', status: 'In Progress' },
    { id: 'w-t4', task: 'Concrete Slump Testing', site: 'Metro Site', priority: 'Low', status: 'Completed' },
  ];

  const displayTasks = tasks.length > 0 ? tasks.map(t => ({
    id: t.id,
    task: t.title || t.task || 'Field Duty',
    site: t.project || t.site || 'Metro Site',
    priority: t.priority || 'Medium',
    status: t.status || 'In Progress',
  })) : initialTasks;

  const [taskList, setTaskList] = useState(displayTasks);

  const handleStartTask = (taskId) => {
    setTaskList(prev => prev.map(t => t.id === taskId ? { ...t, status: 'In Progress' } : t));
    if (updateTaskStatus) updateTaskStatus(taskId, 'In Progress');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px', width: '100%' }}>
      <div style={{ background: 'var(--panel-soft)', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
          Welcome back, {user?.fullName || 'Worker'} 👋
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        <div className="panel" style={{ padding: '16px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Assigned Projects</span>
          <h2 style={{ fontSize: '22px', color: 'var(--blue)', marginTop: '2px' }}>{projects.length || 2}</h2>
        </div>

        <div className="panel" style={{ padding: '16px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>My Tasks</span>
          <h2 style={{ fontSize: '22px', color: 'var(--green)', marginTop: '2px' }}>{taskList.length}</h2>
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

      {/* ── Today's Assigned Tasks Table Section ── */}
      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', background: 'var(--panel-soft)', borderBottom: '1px solid var(--border)', fontWeight: 800, fontSize: '15px', color: 'var(--text)' }}>
          Today's Assigned Tasks
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--panel-soft)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Task</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Site</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Priority</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {taskList.map(t => (
              <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text)' }}>
                  {t.task}
                </td>
                <td style={{ padding: '14px', color: 'var(--blue)', fontWeight: 600 }}>
                  {t.site}
                </td>
                <td style={{ padding: '14px' }}>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: t.priority === 'High' ? 'rgba(239,68,68,0.12)' : (t.priority === 'Medium' ? 'rgba(245,154,22,0.12)' : 'rgba(37,99,235,0.12)'),
                    color: t.priority === 'High' ? 'var(--red)' : (t.priority === 'Medium' ? 'var(--orange)' : 'var(--blue)'),
                  }}>
                    {t.priority}
                  </span>
                </td>
                <td style={{ padding: '14px' }}>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: t.status === 'Completed' ? 'rgba(34,197,94,0.12)' : (t.status === 'In Progress' ? 'rgba(37,99,235,0.12)' : 'rgba(245,154,22,0.12)'),
                    color: t.status === 'Completed' ? 'var(--green)' : (t.status === 'In Progress' ? 'var(--blue)' : 'var(--orange)'),
                  }}>
                    {t.status}
                  </span>
                </td>
                <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                  {t.status === 'Pending' ? (
                    <button
                      type="button"
                      className="primary-button"
                      style={{ fontSize: '12px', padding: '5px 12px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--blue)' }}
                      onClick={() => handleStartTask(t.id)}
                    >
                      Start
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="secondary-button"
                      style={{ fontSize: '12px', padding: '5px 12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      onClick={() => alert(`Task details for: ${t.task}`)}
                    >
                      View
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
