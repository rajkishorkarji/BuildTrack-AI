import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { formatINR } from '../../utils/currency';
import {
  Building2, FolderKanban, Users, CreditCard, Bot, TrendingUp,
  Activity, CheckCircle2, AlertTriangle, Wrench
} from 'lucide-react';

export default function CompanyAdminDashboard() {
  const { projects = [], workers = [], equipment = [], finances = [], issues = [] } = useData();
  const { user } = useAuth();

  const totalBudget = projects.reduce((s, p) => s + (parseFloat(p.budget) || 0), 0);
  const totalSpent = finances
    .filter(f => String(f.status || '').toUpperCase() === 'PAID')
    .reduce((s, f) => s + (parseFloat(f.totalAmount || f.amount) || 0) + (parseFloat(f.gstAmount) || 0), 0);

  const grossInvoiced = finances.reduce((s, f) => s + (parseFloat(f.totalAmount || f.amount) || 0) + (parseFloat(f.gstAmount) || 0), 0);
  const netMargin = grossInvoiced - totalSpent;

  const totalProjects = projects.length;
  const plannedProjects = projects.filter(p => String(p.status || '').toUpperCase() === 'PLANNED').length;
  const activeProjectsCount = projects.filter(p => {
    const s = String(p.status || '').toUpperCase();
    return s === 'ACTIVE' || s === 'IN_PROGRESS' || s === 'IN PROGRESS';
  }).length;

  const openIssues = issues.filter(i => String(i.status || '').toUpperCase() === 'OPEN').length;
  const activeWorkersCount = workers.filter(w => w.enabled !== false).length;
  const activeEquipmentCount = equipment.filter(e => String(e.status || '').toUpperCase() !== 'MAINTENANCE').length;

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <Building2 size={14} /> Dashboard
          </p>
          <h1>{user?.companyName || 'Company Admin Dashboard'}</h1>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" className="date-chip">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </button>
        </div>
      </section>

      {/* 1. Company KPIs & Analytics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '20px' }}>
        {[
          {
            label: 'Active Projects',
            value: activeProjectsCount,
            color: 'var(--blue)',
            sub: plannedProjects > 0 ? `${plannedProjects} planned · ${totalProjects} total` : `Total ${totalProjects} managed`
          },
          {
            label: 'Workforce Summary',
            value: workers.length,
            color: 'var(--purple)',
            sub: `${activeWorkersCount} active personnel`
          },
          {
            label: 'Capital Budget',
            value: formatINR(totalBudget),
            color: 'var(--green)',
            sub: `Paid Invoices: ${formatINR(totalSpent)}`
          },
          {
            label: 'Equipment Fleet',
            value: equipment.length,
            color: 'var(--orange)',
            sub: `${activeEquipmentCount} operational assets`
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
                No active projects found. Create a project to start tracking progress.
              </div>
            ) : (
              projects.map(p => {
                const prog = Number(p.progress ?? p.progressPercentage ?? 0);
                return (
                  <div key={p.id} style={{ padding: '14px', background: 'var(--panel-soft)', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                      <strong style={{ color: 'var(--text)' }}>{p.name}</strong>
                      <span style={{ color: 'var(--blue)', fontWeight: 700 }}>{prog}%</span>
                    </div>
                    <div style={{ height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${prog}%`, height: '100%', background: 'var(--blue)', borderRadius: '4px' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: 'var(--muted)' }}>
                      <span>Location: {p.location || 'Site Location'}</span>
                      <span>Budget: {formatINR(p.budget)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 3. Revenue & Expenses & AI Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Revenue & Expenses */}
          <div className="panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} style={{ color: 'var(--green)' }} /> Revenue & Expenses
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--panel-soft)', borderRadius: '8px' }}>
                <span style={{ color: 'var(--muted)' }}>Gross Invoiced Revenue</span>
                <strong style={{ color: 'var(--green)' }}>{formatINR(grossInvoiced)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--panel-soft)', borderRadius: '8px' }}>
                <span style={{ color: 'var(--muted)' }}>Paid Expenses</span>
                <strong style={{ color: 'var(--orange)' }}>{formatINR(totalSpent)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--panel-soft)', borderRadius: '8px' }}>
                <span style={{ color: 'var(--muted)' }}>Pending Invoices</span>
                <strong style={{ color: 'var(--blue)' }}>{formatINR(Math.max(grossInvoiced - totalSpent, 0))}</strong>
              </div>
            </div>
          </div>

          {/* Real Operational Insights */}
          <div className="panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bot size={18} style={{ color: 'var(--purple)' }} /> Operations Overview
            </h3>
            <div style={{ padding: '12px', background: 'var(--panel-soft)', borderRadius: '8px', fontSize: '12px', color: 'var(--muted)', lineHeight: '1.6' }}>
              <div>• {projects.length} project{projects.length === 1 ? '' : 's'} registered in company portfolio</div>
              <div>• {workers.length} workforce personnel assigned</div>
              <div>• {openIssues} open site hazard{openIssues === 1 ? '' : 's'} reported</div>
              <div>• {equipment.length} equipment assets deployed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
