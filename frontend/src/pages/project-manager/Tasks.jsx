import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { CheckSquare, Plus, Search, Clock, AlertCircle, CheckCircle2, UserCheck } from 'lucide-react';

export default function PMTasks() {
  const { tasks, addTask, workers } = useData();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', assignedTo: workers[0]?.name || 'John Doe', priority: 'High', deadline: '2026-08-10', status: 'Pending' });

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTask.title) return;
    addTask({ ...newTask, id: Date.now() });
    setShowAddModal(false);
    setNewTask({ title: '', assignedTo: workers[0]?.name || 'John Doe', priority: 'High', deadline: '2026-08-10', status: 'Pending' });
  };

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow">Project Task Governance</p>
          
        </div>
        <button type="button" className="primary-button" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Create & Assign Task
        </button>
      </section>

      {/* Task Filters */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
        <div className="search-box" style={{ width: '320px' }}>
          <Search size={16} style={{ color: 'var(--muted)' }} />
          <input placeholder="Search tasks, assignees, priorities..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="panel" style={{ marginTop: '20px', padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--panel-soft)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Task Title</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Assigned To</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Priority</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Deadline</th>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {(tasks.length > 0 ? tasks : [
              { id: 1, title: 'Pour foundation concrete for Block B', assignedTo: 'Civil Team A', priority: 'High', deadline: '2026-08-08', status: 'In Progress' },
              { id: 2, title: 'Rebar Inspection & Quality Check', assignedTo: 'Eng. Sarah Jenkins', priority: 'Medium', deadline: '2026-08-09', status: 'Pending' },
              { id: 3, title: 'Electrical Conduit Installation Level 3', assignedTo: 'Subcontractor Spark Ltd', priority: 'High', deadline: '2026-08-12', status: 'Pending' },
            ]).map(t => (
              <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text)' }}>{t.title}</td>
                <td style={{ padding: '14px', color: 'var(--muted)' }}>{t.assignedTo}</td>
                <td style={{ padding: '14px' }}>
                  <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: t.priority === 'High' ? 'rgba(239,68,68,0.12)' : 'rgba(26,115,232,0.12)', color: t.priority === 'High' ? 'var(--red)' : 'var(--blue)' }}>
                    {t.priority}
                  </span>
                </td>
                <td style={{ padding: '14px', color: 'var(--muted)' }}>{t.deadline}</td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{ padding: '3px 10px', borderRadius: '10px', background: 'rgba(34,197,94,0.12)', color: 'var(--green)', fontSize: '11px', fontWeight: 600 }}>
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="panel" style={{ width: '100%', maxWidth: '460px', padding: '28px', borderRadius: '16px' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Create New Task</h2>
            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--muted)', marginBottom: '4px' }}>Task Title *</label>
                <input type="text" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }} value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="secondary-button" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="primary-button">Assign Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
