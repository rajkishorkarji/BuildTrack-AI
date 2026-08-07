import { CalendarRange, Flag, ListTodo } from 'lucide-react';

const DAY = 24 * 60 * 60 * 1000;
const toDate = (value) => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
};

const formatDate = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export default function ProjectTimeline({ projects = [], tasks = [] }) {
  const rows = projects.slice(0, 5).map((project) => {
    const projectTasks = tasks.filter((task) => String(task.projectId || task.project?.id || task.project) === String(project.id)
      || task.project === project.name);
    const start = toDate(project.startDate) || new Date();
    const end = toDate(project.deadline || project.estEndDate)
      || projectTasks.map((task) => toDate(task.deadline || task.dueDate)).filter(Boolean).sort((a, b) => b - a)[0]
      || new Date(start.getTime() + 30 * DAY);
    return { ...project, start, end: end < start ? new Date(start.getTime() + DAY) : end, taskCount: projectTasks.length };
  });

  if (!rows.length) {
    return <div className="panel" style={{ padding: 24, color: 'var(--muted)', textAlign: 'center' }}>Create a project to generate its delivery timeline.</div>;
  }

  const rangeStart = new Date(Math.min(...rows.map((row) => row.start.getTime())));
  const rangeEnd = new Date(Math.max(...rows.map((row) => row.end.getTime())));
  const range = Math.max(DAY, rangeEnd.getTime() - rangeStart.getTime());

  return (
    <section className="panel" style={{ padding: 0, overflow: 'hidden' }} aria-label="Project delivery timeline">
      <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderBottom: '1px solid var(--border)' }}>
        <div>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8, fontSize: 16 }}><CalendarRange size={18} color="var(--blue)" /> Delivery timeline</h3>
          <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: 12 }}>Schedule health across your assigned project portfolio.</p>
        </div>
        <span className="date-chip" style={{ fontSize: 11 }}>{formatDate(rangeStart)} – {formatDate(rangeEnd)}</span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 620, padding: '18px 20px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '190px 1fr 82px', gap: 14, color: 'var(--muted)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 10 }}>
            <span>Project</span><span>Timeline</span><span style={{ textAlign: 'right' }}>Progress</span>
          </div>
          {rows.map((row) => {
            const left = Math.max(0, ((row.start - rangeStart) / range) * 100);
            const width = Math.max(3, ((row.end - row.start) / range) * 100);
            const progress = Math.min(100, Math.max(0, Number(row.progress ?? row.progressPercentage ?? 0)));
            const isDelayed = String(row.status || '').toUpperCase().includes('DELAY');
            const color = isDelayed ? 'var(--red)' : progress >= 100 ? 'var(--green)' : 'var(--blue)';
            return (
              <div key={row.id || row.name} style={{ display: 'grid', gridTemplateColumns: '190px 1fr 82px', alignItems: 'center', gap: 14, minHeight: 58, borderTop: '1px solid var(--border)' }}>
                <div style={{ minWidth: 0 }}>
                  <strong style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 }}>{row.name}</strong>
                  <span style={{ color: 'var(--muted)', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}><ListTodo size={12} /> {row.taskCount} task{row.taskCount === 1 ? '' : 's'}</span>
                </div>
                <div style={{ position: 'relative', height: 24, borderRadius: 8, background: 'var(--panel-soft)', overflow: 'hidden' }}>
                  <div title={`${formatDate(row.start)} to ${formatDate(row.end)}`} style={{ position: 'absolute', left: `${left}%`, width: `${Math.min(100 - left, width)}%`, top: 4, height: 16, borderRadius: 6, background: color, opacity: .88 }} />
                  <div style={{ position: 'absolute', left: `${Math.min(97, left + (width * progress) / 100)}%`, top: 1, color, background: 'var(--panel)', borderRadius: '50%', display: 'grid', placeItems: 'center' }}><Flag size={14} fill="currentColor" /></div>
                </div>
                <strong style={{ textAlign: 'right', color, fontSize: 13 }}>{progress}%</strong>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
