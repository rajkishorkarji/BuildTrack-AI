import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { formatINR } from '../../utils/currency';
import {
  Building2, FolderKanban, Users, CreditCard, Bot, TrendingUp,
  Activity, CheckCircle2, AlertTriangle, Wrench, Clock, XCircle
} from 'lucide-react';

const PROJECT_STATUS_META = {
  ACTIVE: { label: 'Active', color: 'var(--green)', bg: 'rgba(34,197,94,0.12)' },
  IN_PROGRESS: { label: 'Active', color: 'var(--green)', bg: 'rgba(34,197,94,0.12)' },
  'IN PROGRESS': { label: 'Active', color: 'var(--green)', bg: 'rgba(34,197,94,0.12)' },
  PLANNED: { label: 'Planned', color: 'var(--orange)', bg: 'rgba(245,158,11,0.12)' },
  COMPLETED: { label: 'Completed', color: 'var(--blue)', bg: 'rgba(37,99,235,0.12)' },
  ON_HOLD: { label: 'On Hold', color: 'var(--muted)', bg: 'var(--panel-soft)' },
  SUSPENDED: { label: 'Suspended', color: 'var(--red)', bg: 'rgba(239,68,68,0.12)' },
};

function getProjectStatus(status) {
  const key = String(status || '').toUpperCase().replace(/\s/g, '_');
  return PROJECT_STATUS_META[key] || PROJECT_STATUS_META[String(status || '').toUpperCase()] || { label: status || 'Unknown', color: 'var(--muted)', bg: 'var(--panel-soft)' };
}

function isProjectActive(status) {
  const s = String(status || '').toUpperCase();
  return s === 'ACTIVE' || s === 'IN_PROGRESS' || s === 'IN PROGRESS';
}

export default function CompanyAdminDashboard() {
  const { projects = [], workers = [], equipment = [], finances = [], issues = [] } = useData();
  const { user } = useAuth();

  const totalBudget = projects.reduce((s, p) => s + (parseFloat(p.budget) || 0), 0);
  const totalSpent = finances
    .filter(f => String(f.status || '').toUpperCase() === 'PAID')
    .reduce((s, f) => s + (parseFloat(f.totalAmount || f.amount) || 0) + (parseFloat(f.gstAmount) || 0), 0);

  const grossInvoiced = finances.reduce((s, f) => s + (parseFloat(f.totalAmount || f.amount) || 0) + (parseFloat(f.gstAmount) || 0), 0);

  const totalProjects = projects.length;
  const plannedProjects = projects.filter(p => String(p.status || '').toUpperCase() === 'PLANNED').length;
  const activeProjectsCount = projects.filter(p => isProjectActive(p.status)).length;
  const completedProjectsCount = projects.filter(p => String(p.status || '').toUpperCase() === 'COMPLETED').length;

  const openIssues = issues.filter(i => String(i.status || '').toUpperCase() === 'OPEN').length;
  const activeWorkersCount = workers.filter(w => w.enabled !== false).length;
  const activeEquipmentCount = equipment.filter(e => String(e.status || '').toUpperCase() !== 'IN_MAINTENANCE').length;

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <Building2 size={14} /> Dashboard
          </p>
          
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" className="date-chip">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </button>
        </div>
      </section>

      {/* 1. Company KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '20px' }}>
        {[
          {
            label: 'Active Projects',
            value: activeProjectsCount,
            color: 'var(--green)',
            sub: plannedProjects > 0 ? `${plannedProjects} planned · ${totalProjects} total` : `${totalProjects} projects total`,
          },
          {
            label: 'Workforce',
            value: workers.length,
            color: 'var(--purple)',
            sub: `${activeWorkersCount} active personnel`,
          },
          {
            label: 'Capital Budget',
            value: formatINR(totalBudget),
            color: 'var(--blue)',
            sub: `Paid: ${formatINR(totalSpent)}`,
          },
          {
            label: 'Equipment Fleet',
            value: equipment.length,
            color: 'var(--orange)',
            sub: `${activeEquipmentCount} operational assets`,
          },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className="panel" style={{ padding: '20px' }}>
            <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>{label}</span>
            <h2 style={{ fontSize: '24px', color, margin: '4px 0 2px 0', fontWeight: 800 }}>{value}</h2>
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{sub}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginTop: '24px' }}>
        {/* 2. Project Progress Overview */}
        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderKanban size={18} style={{ color: 'var(--blue)' }} /> Project Progress Overview
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {projects.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
                No projects found. Create a project to start tracking progress.
              </div>
            ) : (
              projects.map(p => {
                const prog = Number(p.progress ?? p.progressPercentage ?? 0);
                const statusMeta = getProjectStatus(p.status);
                const progressColor = isProjectActive(p.status) ? 'var(--green)' : p.status?.toUpperCase() === 'COMPLETED' ? 'var(--blue)' : 'var(--orange)';
                return (
                  <div key={p.id} style={{ padding: '14px', background: 'var(--panel-soft)', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', gap: 10 }}>
                      <strong style={{ color: 'var(--text)', fontSize: 13 }}>{p.name}</strong>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ padding: '2px 8px', borderRadius: 8, background: statusMeta.bg, color: statusMeta.color, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                          {statusMeta.label}
                        </span>
                        <span style={{ color: progressColor, fontWeight: 700, fontSize: 13 }}>{prog}%</span>
                      </div>
                    </div>
                    <div style={{ height: '7px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(prog, 100)}%`, height: '100%', background: progressColor, borderRadius: '4px', transition: 'width 0.5s ease' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: 'var(--muted)' }}>
                      <span>{p.location || 'Site Location'}</span>
                      <span>Budget: {formatINR(p.budget)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {projects.length > 0 && (
            <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[
                { label: 'Active', value: activeProjectsCount, color: 'var(--green)', bg: 'rgba(34,197,94,0.12)' },
                { label: 'Planned', value: plannedProjects, color: 'var(--orange)', bg: 'rgba(245,158,11,0.12)' },
                { label: 'Completed', value: completedProjectsCount, color: 'var(--blue)', bg: 'rgba(37,99,235,0.12)' },
              ].map(({ label, value, color, bg }) => (
                <span key={label} style={{ padding: '4px 12px', borderRadius: 20, background: bg, color, fontSize: 12, fontWeight: 700 }}>
                  {value} {label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 3. Revenue & Operations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Revenue & Expenses */}
          <div className="panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} style={{ color: 'var(--green)' }} /> Revenue & Expenses
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--panel-soft)', borderRadius: '8px' }}>
                <span style={{ color: 'var(--muted)' }}>Gross Invoiced</span>
                <strong style={{ color: 'var(--green)' }}>{formatINR(grossInvoiced)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--panel-soft)', borderRadius: '8px' }}>
                <span style={{ color: 'var(--muted)' }}>Paid Expenses</span>
                <strong style={{ color: 'var(--orange)' }}>{formatINR(totalSpent)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--panel-soft)', borderRadius: '8px' }}>
                <span style={{ color: 'var(--muted)' }}>Pending Amount</span>
                <strong style={{ color: 'var(--blue)' }}>{formatINR(Math.max(grossInvoiced - totalSpent, 0))}</strong>
              </div>
            </div>
          </div>

          {/* Operations Overview */}
          <div className="panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bot size={18} style={{ color: 'var(--purple)' }} /> Operations Overview
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: FolderKanban, label: 'Projects registered', value: projects.length, color: 'var(--blue)' },
                { icon: Users, label: 'Personnel assigned', value: workers.length, color: 'var(--purple)' },
                { icon: AlertTriangle, label: 'Open site hazards', value: openIssues, color: openIssues > 0 ? 'var(--red)' : 'var(--green)' },
                { icon: Wrench, label: 'Equipment deployed', value: equipment.length, color: 'var(--orange)' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--panel-soft)', borderRadius: 8, fontSize: 13 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon size={14} style={{ color }} />
                    <span style={{ color: 'var(--muted)' }}>{label}</span>
                  </div>
                  <strong style={{ color }}>{value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
