import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
  FolderKanban,
  Plus,
  Calendar,
  DollarSign,
  MapPin,
  CheckCircle,
  Clock,
  Users,
  HardHat,
  FileText,
  Filter,
  Eye,
  Edit,
  Trash2,
  ChevronRight,
  TrendingUp,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';

export default function Projects() {
  const { user } = useAuth();
  const { projects, addProject, updateProject, deleteProject } = useData();
  const role = user?.role || 'SUPER_ADMIN';

  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState('ALL');
  const [activeProject, setActiveProject] = useState(null); // Detailed view project
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'tasks' | 'resources' | 'documents' | 'finance'
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New project form state
  const [newProject, setNewProject] = useState({
    name: '',
    code: '',
    company: user?.companyName || 'Solviontech Infrastructure Ltd',
    location: '',
    description: '',
    budget: '',
    startDate: '',
    estEnd: '',
    pmName: user?.fullName || '',
    progress: 10,
  });

  // Filter projects by company for Super Admin and by role for other users
  const filteredProjects = projects.filter((p) => {
    if (role === 'SUPER_ADMIN') {
      if (selectedCompanyFilter === 'ALL') return true;
      return (p.companyName || p.company || '').toLowerCase().includes(selectedCompanyFilter.toLowerCase());
    }
    return true;
  });

  const canCreateOrEdit = role === 'SUPER_ADMIN' || role === 'COMPANY_ADMIN' || role === 'PROJECT_MANAGER';
  const isSuperOrCompanyAdmin = role === 'SUPER_ADMIN' || role === 'COMPANY_ADMIN';

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;

    addProject({
      name: newProject.name.trim(),
      code: newProject.code || `PRJ-${Date.now().toString().slice(-4)}`,
      companyName: newProject.company || user?.companyName || 'Solviontech Infrastructure Ltd',
      company: newProject.company || user?.companyName || 'Solviontech Infrastructure Ltd',
      location: newProject.location || 'Bhubaneswar Site',
      description: newProject.description || 'New Infrastructure Construction Site',
      budget: parseFloat(newProject.budget) || 1200000,
      progress: parseInt(newProject.progress, 10) || 15,
      status: 'In Progress',
      startDate: newProject.startDate || new Date().toISOString().split('T')[0],
      pmName: newProject.pmName || user?.fullName || 'Project Manager',
      spent: 0,
    });

    setShowCreateModal(false);
    setNewProject({
      name: '',
      code: '',
      company: user?.companyName || 'Solviontech Infrastructure Ltd',
      location: '',
      description: '',
      budget: '',
      startDate: '',
      estEnd: '',
      pmName: user?.fullName || '',
      progress: 10,
    });
  };

  const handleStatusChange = (id, newStatus) => {
    updateProject(id, { status: newStatus });
    if (activeProject && activeProject.id === id) {
      setActiveProject({ ...activeProject, status: newStatus });
    }
  };

  return (
    <div className="dashboard-page">
      {/* Page Header */}
      <section className="hero-row">
        <div>
          <p className="eyebrow">
            {role === 'SUPER_ADMIN' && 'Global Portfolio Engine'}
            {role === 'COMPANY_ADMIN' && 'Company Projects Overview'}
            {role === 'PROJECT_MANAGER' && 'My Managed Projects'}
            {role === 'SITE_ENGINEER' && 'Assigned Engineering Sites'}
            {role === 'CONTRACTOR' && 'Active Subcontract Sites'}
            {role === 'WORKER' && 'My Active Work Sites'}
          </p>
          <h1>Projects Suite ({projects.length})</h1>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {role === 'SUPER_ADMIN' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--panel)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <Filter size={14} style={{ color: 'var(--muted)' }} />
              <select
                value={selectedCompanyFilter}
                onChange={(e) => setSelectedCompanyFilter(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', outline: 'none' }}
              >
                <option value="ALL">All Companies</option>
                <option value="Solviontech">Solviontech Infrastructure</option>
                <option value="Apex">Apex Construction</option>
              </select>
            </div>
          )}

          {canCreateOrEdit && (
            <button type="button" className="primary-button" onClick={() => setShowCreateModal(true)}>
              <Plus size={16} /> New Project
            </button>
          )}
        </div>
      </section>

      {/* Simplified Worker View or Full Project Cards Grid */}
      {role === 'WORKER' ? (
        <div className="panel" style={{ padding: '24px', marginTop: '20px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>My Assigned Projects</h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '16px' }}>
            Basic details for the active construction sites you are deployed to.
          </p>
          {filteredProjects.length === 0 && <div style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)', fontSize: '13px' }}>No project assignments found</div>}
          {filteredProjects.map((proj) => (
            <div key={proj.id} style={{ background: 'var(--panel-soft)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <strong style={{ fontSize: '18px', color: 'var(--text)' }}>{proj.name} ({proj.code})</strong>
                <span className="schedule-pill">{proj.status}</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px' }}>
                <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} /> {proj.location} • {proj.description}
              </p>
              <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
                <span>Project Manager: <strong>{proj.pmName}</strong></span>
                <span>Completion: <strong>{proj.progress}%</strong></span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginTop: '20px' }}>
          {filteredProjects.length === 0 && (
            <div className="panel" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
              <FolderKanban size={36} style={{ marginBottom: '12px', color: 'var(--muted)' }} />
              <h3 style={{ fontSize: '16px', color: 'var(--text)', margin: '0 0 6px 0' }}>No Projects Created Yet</h3>
              <p style={{ fontSize: '13px', margin: 0 }}>Click &quot;New Project&quot; above to create a project and watch it flow into the live dashboards.</p>
            </div>
          )}

          {filteredProjects.map((proj) => (
            <article key={proj.id} className="panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="schedule-pill" style={{ background: proj.status === 'On Hold' ? 'rgba(245, 154, 22, 0.15)' : undefined, color: proj.status === 'On Hold' ? 'var(--orange)' : undefined }}>
                    {proj.status}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>{proj.code}</span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>{proj.name}</h3>
                <span style={{ fontSize: '12px', color: 'var(--blue)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>{proj.companyName || proj.company}</span>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.5', marginBottom: '16px' }}>{proj.description}</p>
              </div>

              <div>
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    <span>Progress</span>
                    <span>{proj.progress}%</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--panel-soft)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${proj.progress}%`, height: '100%', background: 'var(--blue)' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: 'var(--panel-soft)', padding: '12px', borderRadius: '10px', fontSize: '12px', marginBottom: '14px' }}>
                  <div>
                    <span style={{ color: 'var(--muted)', display: 'block' }}>Budget</span>
                    <strong style={{ color: 'var(--text)' }}>${(parseFloat(proj.budget) || 0).toLocaleString()}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--muted)', display: 'block' }}>Manager</span>
                    <strong style={{ color: 'var(--text)' }}>{proj.pmName}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" className="secondary-button full-width" onClick={() => setActiveProject(proj)} style={{ fontSize: '13px' }}>
                    <Eye size={14} /> View Details
                  </button>
                  {isSuperOrCompanyAdmin && (
                    <button type="button" className="secondary-button" onClick={() => deleteProject(proj.id)} style={{ color: 'var(--red)' }} title="Delete Project">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* CREATE NEW PROJECT MODAL */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="panel" style={{ width: '100%', maxWidth: '520px', padding: '28px', borderRadius: '16px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--text)' }}>Create New Construction Project</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div>
                <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Project Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Metro Tower Complex"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Company Tenant</label>
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={newProject.company}
                    onChange={(e) => setNewProject({ ...newProject, company: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
                  />
                </div>
                <div>
                  <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Sector 5, Bhubaneswar"
                    value={newProject.location}
                    onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Allocated Budget ($)</label>
                  <input
                    type="number"
                    placeholder="e.g. 2500000"
                    value={newProject.budget}
                    onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
                  />
                </div>
                <div>
                  <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Initial Progress (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newProject.progress}
                    onChange={(e) => setNewProject({ ...newProject, progress: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Project Description</label>
                <textarea
                  placeholder="Brief summary of construction scope..."
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  rows={3}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="secondary-button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Save & Launch Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
