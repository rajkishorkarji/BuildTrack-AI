import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { FolderKanban, Users, Clock, CheckSquare, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function ContractorDashboard() {
  const { projects = [], workers = [], tasks = [], attendanceLogs = [] } = useData();
  const { user } = useAuth();

  const completedTasks = tasks.filter(t => {
    const s = String(t.status || '').toUpperCase();
    return s === 'COMPLETED' || s === 'DONE';
  });

  const pendingTasks = tasks.filter(t => {
    const s = String(t.status || '').toUpperCase();
    return s !== 'COMPLETED' && s !== 'DONE';
  });

  const activeWorkers = workers.filter(w => w.enabled !== false);
  const presentCount = attendanceLogs.filter(a => !a.checkOutTime).length;
  const attendancePct = activeWorkers.length > 0
    ? Math.round(((presentCount || activeWorkers.length) / activeWorkers.length) * 100)
    : 100;

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <Users size={14} /> Dashboard
          </p>
        
        </div>
      </section>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '20px' }}>
        {[
          { label: 'Assigned Projects', value: projects.length, color: 'var(--blue)', sub: 'Sites under contract' },
          { label: 'Subcontractor Crew', value: activeWorkers.length, color: 'var(--purple)', sub: `${workers.length} total members` },
          { label: 'Team Attendance', value: `${attendancePct}%`, color: 'var(--green)', sub: 'Active site presence' },
          { label: 'Pending Tasks', value: pendingTasks.length, color: 'var(--orange)', sub: `${completedTasks.length} tasks completed` },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className="panel" style={{ padding: '20px' }}>
            <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>{label}</span>
            <h2 style={{ fontSize: '24px', color, margin: '4px 0 2px 0', fontWeight: 800 }}>{value}</h2>
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{sub}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '14px' }}>Assigned Projects Overview</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            {projects.length === 0 ? (
              <div style={{ padding: '16px', color: 'var(--muted)', textAlign: 'center' }}>No assigned projects.</div>
            ) : (
              projects.map(p => {
                const prog = Number(p.progress ?? p.progressPercentage ?? 0);
                return (
                  <div key={p.id} style={{ padding: '12px', background: 'var(--panel-soft)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{p.name}</strong>
                    <span style={{ color: 'var(--blue)', fontWeight: 700 }}>{prog}%</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '14px' }}>Work Completion Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div style={{ padding: '12px', background: 'var(--panel-soft)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Completed Tasks</span>
              <strong style={{ color: 'var(--green)' }}>{completedTasks.length} Completed</strong>
            </div>
            <div style={{ padding: '12px', background: 'var(--panel-soft)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Pending / Active Tasks</span>
              <strong style={{ color: 'var(--orange)' }}>{pendingTasks.length} Pending</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
