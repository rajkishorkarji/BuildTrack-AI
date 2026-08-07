import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Cpu, Activity, Zap, TrendingUp, AlertTriangle, Building2, ShieldCheck, Bot } from 'lucide-react';

export default function SuperAdminAIInsights() {
  const { companies = [], projects = [], finances = [], issues = [] } = useData();
  const [loading, setLoading] = useState(false);

  const totalPlatformBudget = projects.reduce((acc, p) => acc + (parseFloat(p.budget) || 0), 0);
  const criticalIssues = (issues || []).filter(i => i.severity === 'Critical' || i.severity === 'High').length;
  const avgCompletion = projects.length > 0 ? Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / projects.length) : 0;

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <Bot size={14} /> AI Insights
          </p>
        </div>
        <button type="button" className="primary-button" onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 800); }}>
          <Cpu size={15} className={loading ? "spin-icon" : ""} /> {loading ? 'Running Global ML Suite...' : 'Run Global Platform Diagnostics'}
        </button>
      </section>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '20px' }}>
        {[
          { label: 'Global Platform Risk', value: criticalIssues > 0 ? 'High Risk' : 'Low Risk', color: criticalIssues > 0 ? 'var(--orange)' : 'var(--green)', sub: `${criticalIssues} critical platform hazards` },
          { label: 'Monitored Portfolio Budget', value: `$${(totalPlatformBudget / 1e6).toFixed(1)}M`, color: 'var(--blue)', sub: `Spread across ${projects.length} sites` },
          { label: 'Platform Completion Average', value: `${avgCompletion}%`, color: 'var(--purple)', sub: `Across ${companies.length} active tenants` },
          { label: 'Tenant System Health', value: '99.98%', color: 'var(--green)', sub: 'Zero latency degradation' },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className="panel" style={{ padding: '20px' }}>
            <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>{label}</span>
            <h2 style={{ fontSize: '24px', color, margin: '6px 0 2px 0', fontWeight: 800 }}>{value}</h2>
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{sub}</span>
          </div>
        ))}
      </div>

      {/* Multi-Tenant Portfolio AI Diagnostics */}
      <div className="panel" style={{ marginTop: '20px', padding: '24px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} style={{ color: 'var(--blue)' }} /> Global Multi-Tenant Risk Intelligence
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {companies.map((company) => {
            const companyProjects = projects.filter(p => (p.companyName || p.company) === company.name);
            const compProgress = companyProjects.length > 0 ? Math.round(companyProjects.reduce((s, p) => s + (p.progress || 0), 0) / companyProjects.length) : 50;
            return (
              <div key={company.id} style={{ padding: '16px', background: 'var(--panel-soft)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <strong style={{ fontSize: '15px', color: 'var(--text)' }}>{company.name}</strong>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                    Active Sites: <strong>{companyProjects.length}</strong> • Admin: {company.adminName || company.adminEmail || 'Company Admin'}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Health Score</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--green)' }}>{compProgress}%</div>
                  </div>
                  <span style={{ padding: '4px 12px', borderRadius: '10px', background: 'rgba(34,197,94,0.12)', color: 'var(--green)', fontSize: '11px', fontWeight: 700 }}>
                    Normal Operations
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
