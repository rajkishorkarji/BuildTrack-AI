import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, Clock, Play, Eye, Search, AlertCircle, X } from 'lucide-react';

export default function WorkerTasks() {
  const { tasks = [], updateTaskStatus } = useData();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [viewingTask, setViewingTask] = useState(null);
  const [notice, setNotice] = useState('');

  // Default tasks matching user request exactly
  const initialTasks = [
    { id: 'w-t1', task: 'Position Steel Mesh', site: 'Metro Site', priority: 'High', status: 'In Progress', description: 'Lay 12mm steel reinforcement mesh across Floor 14 slab.' },
    { id: 'w-t2', task: 'Inspect Hydraulic Hose', site: 'Equipment Bay', priority: 'Medium', status: 'Pending', description: 'Check pressure seals and hydraulic lines on Excavator 320D.' },
    { id: 'w-t3', task: 'Foundation Rebar Binding', site: 'Metro Site', priority: 'High', status: 'In Progress', description: 'Secure rebar intersections with binding wire for Column C4.' },
    { id: 'w-t4', task: 'Concrete Slump Testing', site: 'Metro Site', priority: 'Low', status: 'Completed', description: 'Measure concrete workability slump before pouring.' },
  ];

  const mergedTasks = tasks.length > 0 ? tasks.map(t => ({
    id: t.id,
    task: t.title || t.task || 'Field Duty',
    site: t.project || t.site || 'Metro Site',
    priority: t.priority || 'Medium',
    status: t.status || 'In Progress',
    description: t.description || 'Assigned field construction activity.',
  })) : initialTasks;

  const [taskList, setTaskList] = useState(mergedTasks);

  const notify = (msg) => { setNotice(msg); setTimeout(() => setNotice(''), 4000); };

  const handleStartTask = (taskId) => {
    setTaskList(prev => prev.map(t => t.id === taskId ? { ...t, status: 'In Progress' } : t));
    if (updateTaskStatus) updateTaskStatus(taskId, 'In Progress');
    const target = taskList.find(t => t.id === taskId);
    notify(`Started task: "${target?.task || 'Task'}" — Status changed to In Progress!`);
  };

  const filteredTasks = taskList.filter(t =>
    (t.task || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.site || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.priority || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <CheckSquare size={14} /> My Tasks
          </p>
        </div>
      </section>

      {notice && (
        <div style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid var(--green)', color: 'var(--green)', padding: '14px 18px', borderRadius: '12px', fontWeight: 700, fontSize: '14px', marginTop: '16px' }}>
          ✓ {notice}
        </div>
      )}

      {/* Search Toolbar */}
      <div className="panel" style={{ marginTop: '20px', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="search-box" style={{ width: '320px' }}>
          <Search size={16} style={{ color: 'var(--muted)' }} />
          <input
            placeholder="Search task, site, or priority..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>
          {filteredTasks.length} Tasks Scheduled Today
        </span>
      </div>

      {/* ── Today's Assigned Tasks Table ── */}
      <div className="panel" style={{ marginTop: '16px', padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--panel-soft)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Task</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Site</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Priority</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map(t => (
              <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text)' }}>
                  {t.task}
                </td>
                <td style={{ padding: '14px', color: 'var(--blue)', fontWeight: 600 }}>
                  {t.site}
                </td>
                <td style={{ padding: '14px' }}>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: t.priority === 'High' ? 'rgba(239,68,68,0.12)' : (t.priority === 'Medium' ? 'rgba(245,154,22,0.12)' : 'rgba(37,99,235,0.12)'),
                    color: t.priority === 'High' ? 'var(--red)' : (t.priority === 'Medium' ? 'var(--orange)' : 'var(--blue)'),
                  }}>
                    {t.priority}
                  </span>
                </td>
                <td style={{ padding: '14px' }}>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: t.status === 'Completed' ? 'rgba(34,197,94,0.12)' : (t.status === 'In Progress' ? 'rgba(37,99,235,0.12)' : 'rgba(245,154,22,0.12)'),
                    color: t.status === 'Completed' ? 'var(--green)' : (t.status === 'In Progress' ? 'var(--blue)' : 'var(--orange)'),
                  }}>
                    {t.status}
                  </span>
                </td>
                <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                  {t.status === 'Pending' ? (
                    <button
                      type="button"
                      className="primary-button"
                      style={{ fontSize: '12px', padding: '5px 12px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--blue)' }}
                      onClick={() => handleStartTask(t.id)}
                    >
                      <Play size={13} /> Start
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="secondary-button"
                      style={{ fontSize: '12px', padding: '5px 12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      onClick={() => setViewingTask(t)}
                    >
                      <Eye size={13} /> View
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Task Details Modal */}
      {viewingTask && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="panel" style={{ width: '100%', maxWidth: '440px', padding: '28px', borderRadius: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)' }}>{viewingTask.task}</h2>
                <span style={{ fontSize: '12px', color: 'var(--blue)', fontWeight: 600 }}>{viewingTask.site} • {viewingTask.priority} Priority</span>
              </div>
              <button type="button" className="secondary-button" style={{ padding: '4px 8px' }} onClick={() => setViewingTask(null)}>
                <X size={16} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--panel-soft)', padding: '14px', borderRadius: '12px', fontSize: '13px', marginBottom: '16px' }}>
              <div><span style={{ color: 'var(--muted)' }}>Status: </span><strong style={{ color: 'var(--blue)' }}>{viewingTask.status}</strong></div>
              <div><span style={{ color: 'var(--muted)' }}>Description: </span><strong>{viewingTask.description}</strong></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="secondary-button" onClick={() => setViewingTask(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
