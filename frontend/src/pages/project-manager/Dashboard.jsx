import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { FolderKanban, CheckSquare, Users, Activity, AlertTriangle, Clock } from 'lucide-react';
import ProjectTimeline from '../../components/dashboard/ProjectTimeline';

export default function PMDashboard() {
  const { projects = [], tasks = [], workers = [], finances = [], issues = [] } = useData();
  const { user } = useAuth();

  const activeProjects = projects.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => {
    const s = String(t.status || '').toUpperCase();
    return s === 'COMPLETED' || s === 'DONE';
  }).length;

  const taskProgressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalBudget = projects.reduce((s, p) => s + (parseFloat(p.budget) || 0), 0);
  const totalSpent = finances
    .filter(f => String(f.status || '').toUpperCase() === 'PAID')
    .reduce((s, f) => s + (parseFloat(f.totalAmount || f.amount) || 0), 0);

  const budgetUtilPct = totalBudget > 0 ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100) : 0;
  const activeWorkers = workers.filter(w => w.enabled !== false).length;

  // Build real site activities from tasks & issues
  const recentActivities = [
    ...issues.map(i => ({
      title: `Site Issue: ${i.title}`,
      time: i.createdAt ? new Date(i.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
      user: i.reportedBy || 'Site Personnel',
    })),
    ...tasks.filter(t => String(t.status || '').toUpperCase() === 'COMPLETED').map(t => ({
      title: `Task Completed: ${t.title}`,
      time: 'Recently',
      user: t.assignedWorker || 'Site Engineer',
    })),
  ].slice(0, 5);

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <FolderKanban size={14} /> Dashboard
          </p>
          <h1>Project Manager Dashboard</h1>
        </div>
        <button type="button" className="date-chip">
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </button>
      </section>

      {/* 4 Overview KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '20px' }}>
        {[
          { label: 'Assigned Projects', value: activeProjects, color: 'var(--blue)', sub: 'Active Construction Sites' },
          { label: 'Task Progress', value: `${taskProgressPct}%`, color: 'var(--green)', sub: `${completedTasks} of ${totalTasks} tasks completed` },
          { label: 'Site Personnel', value: activeWorkers, color: 'var(--purple)', sub: `${workers.length} total registered members` },
          { label: 'Budget Utilization', value: `${budgetUtilPct}%`, color: 'var(--orange)', sub: `Spent ₹${totalSpent.toLocaleString()} of ₹${totalBudget.toLocaleString()}` },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className="panel" style={{ padding: '20px' }}>
            <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>{label}</span>
            <h2 style={{ fontSize: '24px', color, margin: '4px 0 2px 0', fontWeight: 800 }}>{value}</h2>
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{sub}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginTop: '24px' }}>
        {/* Project Overview */}
        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Managed Projects Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {projects.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
                No assigned projects found.
              </div>
            ) : (
              projects.map(p => {
                const prog = Number(p.progress ?? p.progressPercentage ?? 0);
                return (
                  <div key={p.id} style={{ padding: '14px', background: 'var(--panel-soft)', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                      <strong style={{ color: 'var(--text)' }}>{p.name}</strong>
                      <span style={{ color: 'var(--blue)', fontWeight: 700 }}>{prog}%</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${prog}%`, height: '100%', background: 'var(--blue)', borderRadius: '3px' }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} style={{ color: 'var(--blue)' }} /> Recent Site Activities
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
            {recentActivities.length === 0 ? (
              <div style={{ color: 'var(--muted)', padding: '12px' }}>No recent site activity logged.</div>
            ) : (
              recentActivities.map((act, i) => (
                <div key={i} style={{ padding: '10px 12px', background: 'var(--panel-soft)', borderRadius: '8px' }}>
                  <strong style={{ display: 'block', color: 'var(--text)' }}>{act.title}</strong>
                  <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{act.time} • {act.user}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <ProjectTimeline projects={projects} tasks={tasks} />
      </div>
    </div>
  );
}
