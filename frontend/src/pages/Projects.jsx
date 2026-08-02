import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, Calendar, DollarSign, MapPin, CheckCircle, Clock } from 'lucide-react';

const initialProjects = [
  {
    id: 1,
    name: 'Metro Tower Complex',
    location: 'Bhubaneswar, Odisha',
    description: '32-story commercial complex featuring sustainable structural steel framing.',
    budget: '$162,600',
    spent: '$132,600',
    progress: 66,
    status: 'In Progress',
    startDate: 'Jan 15, 2024',
    estEnd: 'Dec 20, 2025',
    workersCount: 48,
  },
  {
    id: 2,
    name: 'Skyview Residency',
    location: 'Cuttack, Odisha',
    description: 'Luxury residential apartments with smart energy management systems.',
    budget: '$95,000',
    spent: '$42,000',
    progress: 45,
    status: 'In Progress',
    startDate: 'Mar 01, 2024',
    estEnd: 'Aug 30, 2025',
    workersCount: 32,
  },
  {
    id: 3,
    name: 'Kalinga Highway Expansion',
    location: 'Khurda, Odisha',
    description: '4-lane highway expansion with automated toll plazas.',
    budget: '$240,000',
    spent: '$210,000',
    progress: 88,
    status: 'On Hold',
    startDate: 'Jun 10, 2023',
    estEnd: 'Nov 15, 2025',
    workersCount: 18,
  },
];

export default function Projects() {
  const navigate = useNavigate();
  const [projectsList, setProjectsList] = useState(initialProjects);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    location: '',
    description: '',
    budget: '',
    startDate: '',
    estEnd: '',
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newProject.name) return;
    const created = {
      id: projectsList.length + 1,
      ...newProject,
      budget: `$${Number(newProject.budget || 0).toLocaleString()}`,
      spent: '$0',
      progress: 0,
      status: 'In Progress',
      workersCount: 0,
    };
    setProjectsList([created, ...projectsList]);
    setShowModal(false);
    setNewProject({ name: '', location: '', description: '', budget: '', startDate: '', estEnd: '' });
  };

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow">Project Management Hub</p>
          <h1>Active Construction Sites</h1>
        </div>
        <button type="button" className="primary-button" onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Project
        </button>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {projectsList.map((proj) => (
          <article key={proj.id} className="panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="schedule-pill" style={{ background: proj.status === 'On Hold' ? 'rgba(245, 154, 22, 0.15)' : undefined, color: proj.status === 'On Hold' ? 'var(--orange)' : undefined }}>
                  {proj.status}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} /> {proj.location}
                </span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>{proj.name}</h3>
              <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: '1.5', marginBottom: '16px' }}>{proj.description}</p>
            </div>

            <div>
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  <span>Completion</span>
                  <span>{proj.progress}%</span>
                </div>
                <div className="footer-bar">
                  <div className="footer-fill" style={{ width: `${proj.progress}%` }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'var(--panel-soft)', padding: '12px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px' }}>
                <div>
                  <span style={{ color: 'var(--muted)', display: 'block' }}>Budget</span>
                  <strong style={{ color: 'var(--text)' }}>{proj.budget}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--muted)', display: 'block' }}>Workers</span>
                  <strong style={{ color: 'var(--text)' }}>{proj.workersCount} Assigned</strong>
                </div>
              </div>

              <button
                type="button"
                className="primary-button full-width"
                style={{ background: 'var(--panel-soft)', color: 'var(--blue)', border: '1px solid var(--border)' }}
                onClick={() => navigate('/task-management')}
              >
                View Tasks & Gantt Timeline
              </button>
            </div>
          </article>
        ))}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="panel" style={{ width: '100%', maxWidth: '500px', padding: '28px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Create New Project</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input
                type="text"
                placeholder="Project Name"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                required
                style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
              />
              <input
                type="text"
                placeholder="Location (e.g. Bhubaneswar)"
                value={newProject.location}
                onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                required
                style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
              />
              <textarea
                placeholder="Description"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                rows={3}
                style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
              />
              <input
                type="number"
                placeholder="Budget Amount ($)"
                value={newProject.budget}
                onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
              />
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
