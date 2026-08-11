import { useData } from '../../context/DataContext';
import { HardHat, ShieldAlert, CheckCircle2, FileText, Camera, Activity } from 'lucide-react';

export default function SEDashboard() {
  const { workers = [], equipment = [], issues = [], tasks = [], projects = [], attendanceLogs = [], dailyLogs = [] } = useData();

  const openIssuesList = issues.filter(i => {
    const s = String(i.status || '').toUpperCase();
    return s === 'OPEN' || s === 'PENDING';
  });
  const openIssuesCount = openIssuesList.length;

  const activeEquipmentCount = equipment.filter(e => {
    const s = String(e.status || '').toUpperCase();
    return s !== 'MAINTENANCE' && s !== 'UNDER REPAIR';
  }).length;

  const activeWorkersCount = workers.filter(w => w.enabled !== false).length;
  const presentCount = attendanceLogs.filter(a => !a.checkOutTime || String(a.status || '').toUpperCase() === 'PRESENT').length;

  const latestLog = Array.isArray(dailyLogs) && dailyLogs.length > 0 ? dailyLogs[0] : null;
  const avgProgress = latestLog?.progressPercentage ?? latestLog?.progress ?? (
    projects.length > 0
      ? Math.round(projects.reduce((sum, p) => sum + Number(p.progress ?? p.progressPercentage ?? 0), 0) / projects.length)
      : (tasks.length > 0 ? Math.round(tasks.reduce((sum, t) => sum + Number(t.progress ?? t.completionPercentage ?? 0), 0) / tasks.length) : 0)
  );

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <HardHat size={14} /> Dashboard
          </p>
          <h1>Site Engineer Dashboard</h1>
        </div>
        <button type="button" className="date-chip">
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </button>
      </section>

      {/* 4 Field Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginTop: '20px' }}>
        {[
          { label: 'Daily Site Progress', value: `${avgProgress}%`, color: 'var(--green)', sub: projects[0]?.name ? `Site: ${projects[0].name}` : 'Overall site tasks' },
          { label: 'Workforce Present', value: `${presentCount || activeWorkersCount} / ${workers.length}`, color: 'var(--blue)', sub: `${activeWorkersCount} total active workers` },
          { label: 'Active Equipment', value: `${activeEquipmentCount} / ${equipment.length}`, color: 'var(--purple)', sub: 'Operational assets' },
          { label: 'Open Safety Hazards', value: openIssuesCount, color: openIssuesCount > 0 ? '#ef4444' : 'var(--green)', sub: 'Reported defects & risks' },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className="panel" style={{ padding: '20px' }}>
            <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>{label}</span>
            <h2 style={{ fontSize: '24px', color, margin: '4px 0 2px 0', fontWeight: 800 }}>{value}</h2>
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{sub}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '24px' }}>
        {/* Today's Tasks & Notes */}
        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} style={{ color: 'var(--blue)' }} /> Active Site Tasks & Inspection Items
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            {tasks.length === 0 ? (
              <div style={{ padding: '16px', color: 'var(--muted)', textAlign: 'center' }}>No tasks assigned for site inspection.</div>
            ) : (
              tasks.slice(0, 5).map(t => (
                <div key={t.id} style={{ padding: '12px', background: 'var(--panel-soft)', borderRadius: '8px' }}>
                  <strong style={{ color: 'var(--text)', display: 'block' }}>{t.title}</strong>
                  <span style={{ color: 'var(--muted)', fontSize: '11px' }}>Status: {t.status || 'In Progress'} • {t.assignedWorker || 'Unassigned'}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Open Hazards List */}
        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={18} style={{ color: '#ef4444' }} /> Open Site Hazards ({openIssuesCount})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {openIssuesList.length === 0 ? (
              <div style={{ padding: '16px', color: 'var(--green)', fontWeight: 600, fontSize: '13px' }}>
                ✓ No open hazards reported. Site is clear.
              </div>
            ) : (
              openIssuesList.map(i => (
                <div key={i.id} style={{ padding: '10px 14px', background: 'var(--panel-soft)', borderRadius: '8px', borderLeft: '3px solid #ef4444', fontSize: '12px' }}>
                  <strong style={{ display: 'block', color: 'var(--text)' }}>{i.title}</strong>
                  <span style={{ color: 'var(--muted)' }}>Location: {i.location || 'Site Sector'} • Severity: {i.severity || 'Medium'}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
