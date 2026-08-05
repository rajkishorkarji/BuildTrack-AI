import { useData } from '../context/DataContext';
import { BarChart3, TrendingUp, DollarSign, FolderKanban, Users, CheckCircle2 } from 'lucide-react';

export default function Reports() {
  const { projects, workers, finances, tasks } = useData();

  const totalRev = finances.reduce((sum, f) => sum + (parseFloat(f.amount) || 0), 0) +
    projects.reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0);

  const avgProgress = projects.length > 0
    ? Math.round(projects.reduce((sum, p) => sum + (parseInt(p.progress, 10) || 0), 0) / projects.length)
    : 0;

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow">Enterprise Telemetry & Executive Analytics</p>
          <h1>Platform Intelligence & Reports</h1>
        </div>
      </section>

      {/* Summary KPI Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '20px' }}>
        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px', fontWeight: 600 }}>Active Projects Portfolio</span>
          <h2 style={{ fontSize: '28px', color: 'var(--blue)', marginTop: '4px' }}>{projects.length} Sites</h2>
        </div>
        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px', fontWeight: 600 }}>Average Completion Rate</span>
          <h2 style={{ fontSize: '28px', color: 'var(--green)', marginTop: '4px' }}>{avgProgress}%</h2>
        </div>
        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px', fontWeight: 600 }}>Active Field Workforce</span>
          <h2 style={{ fontSize: '28px', color: 'var(--orange)', marginTop: '4px' }}>{workers.length} Personnel</h2>
        </div>
        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px', fontWeight: 600 }}>Total Billed Value</span>
          <h2 style={{ fontSize: '28px', color: 'var(--purple)', marginTop: '4px' }}>${totalRev.toLocaleString()}</h2>
        </div>
      </div>

      {/* Report Breakdown Panel */}
      <div className="panel" style={{ padding: '24px', marginTop: '20px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={20} style={{ color: 'var(--blue)' }} /> Real-Time Portfolio Performance
        </h3>
        {projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--muted)', fontSize: '13px' }}>
            No project data logged. Create projects to generate executive performance analytics.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {projects.map((p) => (
              <div key={p.id} style={{ background: 'var(--panel-soft)', padding: '16px', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
                  <strong>{p.name} ({p.companyName || 'Tenant'})</strong>
                  <span style={{ color: 'var(--blue)', fontWeight: 700 }}>{p.progress}% Complete</span>
                </div>
                <div style={{ height: '8px', background: 'var(--panel)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${p.progress}%`, height: '100%', background: 'var(--blue)' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>
                  <span>Budget: ${(parseFloat(p.budget) || 0).toLocaleString()}</span>
                  <span>Manager: {p.pmName}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
