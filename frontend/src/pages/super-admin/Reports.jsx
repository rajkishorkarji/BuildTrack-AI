import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { BarChart3, TrendingUp, Download, Building2, Users, ShieldCheck, Activity, Gauge } from 'lucide-react';

export default function SuperAdminReports() {
  const { companies = [], projects = [], finances = [], workers = [] } = useData();

  const totalRevenue = finances.reduce((s, f) => s + (parseFloat(f.amount) || 0), 0);
  const totalBudget = projects.reduce((s, p) => s + (parseFloat(p.budget) || 0), 0);
  const avgProgress = projects.length > 0 ? Math.round(projects.reduce((s, p) => s + (p.progress || 0), 0) / projects.length) : 0;

  const exportGlobalReport = () => {
    const lines = [
      'BuildTrack AI — Super Admin Platform Governance Report',
      `Generated: ${new Date().toLocaleString()}`,
      `Total Tenants: ${companies.length}`,
      `Platform Billed Revenue: $${totalRevenue.toLocaleString()}`,
      `Total Managed Projects: ${projects.length}`,
      `Total Monitored Portfolio Budget: $${totalBudget.toLocaleString()}`,
      `Average Portfolio Progress: ${avgProgress}%`,
    ];
    const a = document.createElement('a');
    a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(lines.join('\n'));
    a.download = 'super_admin_executive_report.txt';
    a.click();
  };

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <Gauge size={14} /> Reports
          </p>
        </div>
        <button type="button" className="primary-button" onClick={() => setShowCreate(true)}>
          <Download size={15} /> Export Platform Summary
        </button>
      </section>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginTop: '20px' }}>
        {[
          { label: 'Active Platform Tenants', value: companies.length, color: 'var(--blue)' },
          { label: 'Total Managed Projects', value: projects.length, color: 'var(--green)' },
          { label: 'Portfolio Budget', value: `$${(totalBudget / 1e6).toFixed(1)}M`, color: 'var(--purple)' },
          { label: 'Platform Billed Revenue', value: `$${totalRevenue.toLocaleString()}`, color: 'var(--orange)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="panel" style={{ padding: '18px' }}>
            <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>{label}</span>
            <h3 style={{ fontSize: '24px', color, margin: '6px 0 0 0', fontWeight: 800 }}>{value}</h3>
          </div>
        ))}
      </div>

      {/* Multi-Tenant Intelligence Summary */}
      <div className="panel" style={{ marginTop: '20px', padding: '24px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building2 size={18} style={{ color: 'var(--blue)' }} /> Platform Multi-Tenant Operations Summary
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {companies.map(c => {
            const compProjects = projects.filter(p => (p.companyName || p.company) === c.name);
            return (
              <div key={c.id} style={{ padding: '14px 18px', background: 'var(--panel-soft)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '14px', color: 'var(--text)' }}>{c.name}</strong>
                  <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block' }}>Admin: {c.adminName || c.adminEmail || 'Company Admin'}</span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--blue)', background: 'var(--panel)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  {compProjects.length} Active Projects
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
