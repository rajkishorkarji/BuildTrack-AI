import { useState } from 'react';
import { ShieldCheck, Plus, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const initialTasks = [
  { id: 1, code: '02120', title: 'Diamond Saw Cutting', engineer: 'Divya Krishnan', status: 'In Progress', progress: 66, priority: 'High', daysLeft: 4 },
  { id: 2, code: '02190', title: 'Core Drilling', engineer: 'Divya Krishnan', status: 'In Progress', progress: 80, priority: 'High', daysLeft: 9 },
  { id: 3, code: '02298', title: 'Mass Excavation', engineer: 'Vikram Nair', status: 'Completed', progress: 100, priority: 'Critical', daysLeft: 0 },
  { id: 4, code: '03100', title: 'Rebar Structural Mesh', engineer: 'Divya Krishnan', status: 'Pending', progress: 15, priority: 'Medium', daysLeft: 14 },
];

export default function TaskManagement() {
  const [tasks, setTasks] = useState(initialTasks);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({ code: '03200', title: '', engineer: 'Divya Krishnan', priority: 'Medium' });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newTask.title) return;
    const added = {
      id: tasks.length + 1,
      ...newTask,
      status: 'Pending',
      progress: 0,
      daysLeft: 10,
    };
    setTasks([...tasks, added]);
    setShowModal(false);
    setNewTask({ code: '03200', title: '', engineer: 'Divya Krishnan', priority: 'Medium' });
  };

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow">Task Scheduling & Timelines</p>
          <h1>Site Task Management & Gantt Chart</h1>
        </div>
        <button type="button" className="primary-button" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Task
        </button>
      </section>

      {/* Gantt Chart Component Card */}
      <div className="panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Interactive Gantt Timeline (Metro Tower Complex)</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {tasks.map((t) => (
            <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '220px 1fr 60px', alignItems: 'center', gap: '16px' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>
                  {t.code} {t.title}
                </div>
                <small style={{ color: 'var(--muted)' }}>Assigned: {t.engineer}</small>
              </div>

              <div style={{ background: 'var(--panel-soft)', height: '24px', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${t.progress}%`,
                    background: t.status === 'Completed' ? 'var(--green)' : t.status === 'In Progress' ? 'linear-gradient(90deg, var(--blue), var(--indigo))' : 'var(--orange)',
                    borderRadius: '12px',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>

              <span style={{ fontWeight: 600, fontSize: '13px', textAlign: 'right' }}>{t.progress}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Task List Table */}
      <div className="panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Active Site Tasks</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: 'var(--panel-soft)', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '14px 20px' }}>Task Code & Description</th>
              <th style={{ padding: '14px 20px' }}>Site Engineer</th>
              <th style={{ padding: '14px 20px' }}>Priority</th>
              <th style={{ padding: '14px 20px' }}>Progress</th>
              <th style={{ padding: '14px 20px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text)' }}>
                  {t.code} - {t.title}
                </td>
                <td style={{ padding: '14px 20px', color: 'var(--muted)' }}>{t.engineer}</td>
                <td style={{ padding: '14px 20px' }}>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: t.priority === 'Critical' ? 'rgba(239, 82, 82, 0.15)' : 'rgba(78, 132, 247, 0.15)',
                      color: t.priority === 'Critical' ? 'var(--red)' : 'var(--blue)',
                    }}
                  >
                    {t.priority}
                  </span>
                </td>
                <td style={{ padding: '14px 20px' }}>{t.progress}%</td>
                <td style={{ padding: '14px 20px' }}>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: t.status === 'Completed' ? 'rgba(36, 196, 107, 0.15)' : t.status === 'In Progress' ? 'rgba(78, 132, 247, 0.15)' : 'rgba(245, 154, 22, 0.15)',
                      color: t.status === 'Completed' ? 'var(--green)' : t.status === 'In Progress' ? 'var(--blue)' : 'var(--orange)',
                    }}
                  >
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="panel" style={{ width: '100%', maxWidth: '450px', padding: '28px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Add Construction Task</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input
                type="text"
                placeholder="Task Code (e.g. 03150)"
                value={newTask.code}
                onChange={(e) => setNewTask({ ...newTask, code: e.target.value })}
                required
                style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
              />
              <input
                type="text"
                placeholder="Task Title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                required
                style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
              />
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
