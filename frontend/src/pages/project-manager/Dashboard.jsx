import { useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { FolderKanban, CheckSquare, Users, Activity, TrendingUp, RefreshCw } from 'lucide-react';
import ProjectTimeline from '../../components/dashboard/ProjectTimeline';
import { realtimeBus } from '../../services/api';

export default function PMDashboard() {
  const { projects = [], tasks = [], workers = [], finances = [], issues = [], refresh } = useData();
  const { user } = useAuth();

  useEffect(() => {
    if (refresh) refresh();
    const unsub = realtimeBus.subscribe('SERVER_UPDATE', () => {
      if (refresh) refresh();
    });
    return () => unsub();
  }, [refresh]);

  const totalProjects = projects.length;
  const activeSitesCount = projects.filter(p => {
    const s = String(p.status || '').toUpperCase();
    return s === 'ACTIVE' || s === 'IN_PROGRESS' || s === 'IN PROGRESS';
  }).length;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => {
    const s = String(t.status || '').toUpperCase();
    return s === 'COMPLETED' || s === 'DONE';
  }).length;

  const avgTaskCompletionPct = totalTasks > 0
    ? Math.round(tasks.reduce((sum, t) => sum + Number(t.completionPercentage ?? t.progress ?? 0), 0) / totalTasks)
    : 0;

  const avgProjectProgress = projects.length > 0
    ? Math.round(projects.reduce((sum, p) => sum + Number(p.progressPercentage ?? p.progress ?? 0), 0) / projects.length)
    : 0;

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

  const kpiData = [
    {
      label: 'Assigned Sites',
      value: totalProjects,
      color: 'var(--blue)',
      bg: 'rgba(37,99,235,0.1)',
      icon: FolderKanban,
      sub: `${activeSitesCount} active site${activeSitesCount !== 1 ? 's' : ''}`,
    },
    {
      label: 'Task Progress',
      value: `${avgTaskCompletionPct}%`,
      color: 'var(--green)',
      bg: 'rgba(34,197,94,0.1)',
      icon: CheckSquare,
      sub: `${completedTasks} of ${totalTasks} tasks completed`,
    },
    {
      label: 'Site Personnel',
      value: activeWorkers,
      color: 'var(--purple)',
      bg: 'rgba(168,85,247,0.1)',
      icon: Users,
      sub: `${workers.length} total registered members`,
    },
    {
      label: 'Overall Site Completion',
      value: `${avgProjectProgress}%`,
      color: 'var(--orange)',
      bg: 'rgba(245,158,11,0.1)',
      icon: TrendingUp,
      sub: `Budget utilization: ${budgetUtilPct}%`,
    },
  ];

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <FolderKanban size={14} /> Dashboard
          </p>
        
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button type="button" className="secondary-button" onClick={() => refresh && refresh()}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button type="button" className="date-chip">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </button>
        </div>
      </section>

      {/* 4 Real-time Overview KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '20px' }}>
        {kpiData.map(({ label, value, color, bg, icon: Icon, sub }) => (
          <div key={label} className="panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>{label}</span>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={16} />
              </div>
            </div>
            <div style={{ marginTop: 8 }}>
              <h2 style={{ fontSize: '26px', color, margin: '4px 0 2px 0', fontWeight: 800, lineHeight: 1.1 }}>{value}</h2>
              <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 500 }}>{sub}</span>
            </div>
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
                      <div style={{ width: `${Math.min(prog, 100)}%`, height: '100%', background: 'var(--blue)', borderRadius: '3px', transition: 'width 0.3s ease' }} />
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
