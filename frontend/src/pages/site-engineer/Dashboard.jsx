import { useData } from '../../context/DataContext';
import { HardHat, Activity, Users, ShieldAlert, CheckCircle2, FileText, Camera } from 'lucide-react';

export default function SEDashboard() {
  const { workers, equipment, issues } = useData();

  const openIssues = issues.filter(i => i.status === 'Open').length;

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <HardHat size={14} /> Dashboard
          </p>
        </div>
        <button type="button" className="date-chip">
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </button>
      </section>

      {/* 5 Field Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginTop: '20px' }}>
        {[
          { label: 'Daily Site Progress', value: '78%', color: 'var(--green)', sub: 'Sector 4 Concrete Pour' },
          { label: 'Workforce Present', value: `${workers.length} / ${workers.length + 4}`, color: 'var(--blue)', sub: '92% attendance' },
          { label: 'Active Equipment', value: equipment.length, color: 'var(--purple)', sub: 'All operational' },
          { label: 'Open Safety Issues', value: openIssues, color: openIssues > 0 ? 'var(--red)' : 'var(--green)', sub: 'Hazards & Defects' },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className="panel" style={{ padding: '20px' }}>
            <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>{label}</span>
            <h2 style={{ fontSize: '24px', color, margin: '4px 0 2px 0', fontWeight: 800 }}>{value}</h2>
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{sub}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '24px' }}>
        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Today's Site Work Notes</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div style={{ padding: '12px', background: 'var(--panel-soft)', borderRadius: '8px' }}>
              <strong style={{ color: 'var(--text)', display: 'block' }}>Rebar Clearance Approved</strong>
              <span style={{ color: 'var(--muted)', fontSize: '11px' }}>Inspected Level 3 slab steel rebar. Passed tension compliance test.</span>
            </div>
            <div style={{ padding: '12px', background: 'var(--panel-soft)', borderRadius: '8px' }}>
              <strong style={{ color: 'var(--text)', display: 'block' }}>Concrete Slump Test</strong>
              <span style={{ color: 'var(--muted)', fontSize: '11px' }}>Batch #902 slump value 110mm. Approved for pouring.</span>
            </div>
          </div>
        </div>

        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={18} style={{ color: 'var(--red)' }} /> Open Site Hazards ({openIssues})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {issues.map(i => (
              <div key={i.id} style={{ padding: '10px 14px', background: 'var(--panel-soft)', borderRadius: '8px', borderLeft: '3px solid var(--red)', fontSize: '12px' }}>
                <strong style={{ display: 'block', color: 'var(--text)' }}>{i.title}</strong>
                <span style={{ color: 'var(--muted)' }}>Location: {i.location || 'Sector B'} • Severity: {i.severity || 'Medium'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
