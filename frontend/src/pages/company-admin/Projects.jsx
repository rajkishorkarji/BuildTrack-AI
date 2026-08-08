import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { FolderKanban, Plus, Search, Calendar, Users, DollarSign, CheckCircle2, UserCheck, Eye, Trash2, ShieldCheck } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

const INPUT = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: '13px' };

export default function CompanyAdminProjects() {
  const { registeredUsers = [], user } = useAuth();
  const { projects, addProject, deleteProject, usersList = [], companies = [], activateCompanySubscription } = useData();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const company = companies.find((item) => item.code === user?.companyCode) || companies.find((item) => item.name === user?.companyName);
  const subscriptionActive = company?.subscriptionStatus === 'ACTIVE';

  // Aggregate all registered Project Managers from usersList and registeredUsers
  const allUsers = [...usersList, ...registeredUsers.filter((item) => item.companyCode === user?.companyCode || item.companyName === user?.companyName)];
  const seenPMs = new Set();
  const projectManagers = [];

  allUsers.forEach((u, idx) => {
    const roleUpper = (u.role || '').toUpperCase().replace(/[\s-]/g, '_');
    if (roleUpper === 'PROJECT_MANAGER' || roleUpper === 'COMPANY_MANAGER') {
      const name = u.fullName || u.name || 'Project Manager';
      const email = u.email || `${name.toLowerCase().replace(/\s+/g, '.')}@solviontech.com`;
      const key = `${name.toLowerCase()}_${email.toLowerCase()}`;
      if (!seenPMs.has(key)) {
        seenPMs.add(key);
        projectManagers.push({
          id: u.id || `pm-${idx}`,
          name,
          email,
        });
      }
    }
  });

  if (projectManagers.length === 0) {
    projectManagers.push(
      { id: 'pm-def-1', name: 'Rajesh Verma', email: 'pm@solviontech.com' },
      { id: 'pm-def-2', name: 'Amit Sharma', email: 'amit@solviontech.com' },
      { id: 'pm-def-3', name: 'Priya Patel', email: 'priya@solviontech.com' }
    );
  }

  const [newProject, setNewProject] = useState({
    name: '',
    location: '',
    pmName: '',
    startDate: new Date().toISOString().split('T')[0],
    deadline: '',
    budget: '',
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!subscriptionActive || !newProject.name.trim()) return;

    addProject({
      name: newProject.name.trim(),
      location: newProject.location || 'Metro Site Location',
      pmName: newProject.pmName || 'Unassigned PM',
      startDate: newProject.startDate || new Date().toISOString().split('T')[0],
      deadline: newProject.deadline || '2026-12-31',
      budget: parseFloat(newProject.budget) || 1500000,
      progress: 0,
      status: 'Active',
    });

    setShowAdd(false);
    setNewProject({
      name: '',
      location: '',
      pmName: '',
      startDate: new Date().toISOString().split('T')[0],
      deadline: '',
      budget: '',
    });
  };

  const filtered = projects.filter(p =>
    (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.location || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.pmName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <FolderKanban size={14} /> Projects
          </p>
        </div>
        <button type="button" className="primary-button" onClick={() => subscriptionActive ? setShowAdd(true) : activateCompanySubscription(company?.code)}>
          <Plus size={16} /> Create New Project
        </button>
      </section>

      {!subscriptionActive && (
        <div style={{ marginTop: '16px', border: '1px solid var(--orange)', background: 'rgba(245,154,22,0.10)', padding: '14px 16px', borderRadius: '10px', fontSize: '13px' }}>
          <strong style={{ color: 'var(--orange)' }}>Subscription required.</strong> Your Super Admin assigned the <strong>{company?.plan || 'Professional'}</strong> plan. Activate it to create projects, invite personnel, and use company operations.
          <button type="button" className="primary-button" style={{ marginLeft: '12px', padding: '6px 10px', fontSize: '12px' }} onClick={() => activateCompanySubscription(company?.code)}>Activate {company?.plan || 'plan'}</button>
        </div>
      )}

      {/* Search Toolbar */}
      <div className="panel" style={{ marginTop: '20px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="search-box" style={{ width: '360px' }}>
          <Search size={16} style={{ color: 'var(--muted)' }} />
          <input
            placeholder="Search by project name, location, or PM..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>
          {filtered.length} Active Portfolio Projects
        </span>
      </div>

      {/* ── Projects Row-Wise Table View ── */}
      <div className="panel" style={{ marginTop: '16px', padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--panel-soft)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Project Name & Code</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Site Location</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Assigned PM</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Budget</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Progress</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
                  No projects found. Click "Create New Project" to launch a site.
                </td>
              </tr>
            ) : (
              filtered.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text)' }}>
                    <div>{p.name}</div>
                    <code style={{ fontSize: '11px', color: 'var(--blue)', background: 'rgba(37,99,235,0.1)', padding: '2px 6px', borderRadius: '4px', marginTop: '2px', display: 'inline-block' }}>
                      {p.code || `PRJ-${p.id}`}
                    </code>
                  </td>
                  <td style={{ padding: '14px', color: 'var(--muted)', fontWeight: 500 }}>
                    {p.location || 'Metro Site Location'}
                  </td>
                  <td style={{ padding: '14px', fontWeight: 600, color: p.pmName ? 'var(--blue)' : 'var(--orange)' }}>
                    {p.pmName || 'Unassigned'}
                  </td>
                  <td style={{ padding: '14px', fontWeight: 700 }}>
                    ${(parseFloat(p.budget) || 0).toLocaleString()}
                  </td>
                  <td style={{ padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '130px' }}>
                      <div style={{ flex: 1, height: '6px', background: 'var(--panel-soft)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${p.progress || 0}%`, height: '100%', background: 'var(--blue)' }} />
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--blue)', fontSize: '12px' }}>{p.progress || 0}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '10px', background: 'rgba(34,197,94,0.12)', color: 'var(--green)', fontSize: '11px', fontWeight: 700 }}>
                      {p.status || 'Active'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        type="button"
                        className="secondary-button"
                        style={{ fontSize: '12px', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        onClick={() => setActiveProject(p)}
                      >
                        <Eye size={13} /> View
                      </button>
                      <button
                        type="button"
                        className="secondary-button"
                        style={{ fontSize: '12px', padding: '6px 10px', color: '#EF4444', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                        onClick={() => deleteProject && deleteProject(p.id)}
                        title="Delete Project"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Active Project Detail Modal ── */}
      {activeProject && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="panel" style={{ width: '100%', maxWidth: '560px', padding: '28px', borderRadius: '18px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)', marginBottom: '12px' }}>{activeProject.name}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'var(--panel-soft)', padding: '16px', borderRadius: '12px', fontSize: '13px', marginBottom: '16px' }}>
              <div><span style={{ color: 'var(--muted)', display: 'block', fontSize: '12px' }}>Total Budget</span><strong style={{ fontSize: '15px' }}>${(parseFloat(activeProject.budget) || 0).toLocaleString()}</strong></div>
              <div><span style={{ color: 'var(--muted)', display: 'block', fontSize: '12px' }}>Assigned PM</span><strong style={{ color: activeProject.pmName ? 'var(--blue)' : 'var(--orange)' }}>{activeProject.pmName || 'Unassigned'}</strong></div>
              <div><span style={{ color: 'var(--muted)', display: 'block', fontSize: '12px' }}>Site Location</span><strong>{activeProject.location || 'Metro Site'}</strong></div>
              <div><span style={{ color: 'var(--muted)', display: 'block', fontSize: '12px' }}>Start & End Date</span><strong>{activeProject.startDate || '2026-01-01'} / {activeProject.deadline || '2026-12-31'}</strong></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="primary-button" onClick={() => setActiveProject(null)}>Close Details</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Project Modal with Immediate PM Assignment ── */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="panel" style={{ width: '100%', maxWidth: '540px', padding: '28px', borderRadius: '18px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '4px', color: 'var(--text)' }}>Create Project</h2>
            <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '18px' }}>Create new project & assign a Project Manager immediately.</p>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--muted)', marginBottom: '4px', fontWeight: 600 }}>Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Highway Bridge Section A"
                  style={INPUT}
                  value={newProject.name}
                  onChange={e => setNewProject({ ...newProject, name: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--muted)', marginBottom: '4px', fontWeight: 600 }}>Site Location</label>
                <input
                  type="text"
                  placeholder="e.g. Sector 5, Outer Ring"
                  style={INPUT}
                  value={newProject.location}
                  onChange={e => setNewProject({ ...newProject, location: e.target.value })}
                />
              </div>

              {/* Assign Project Manager Immediately */}
              <div style={{ background: 'var(--panel-soft)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <label style={{ color: 'var(--blue)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontWeight: 700, fontSize: '13px' }}>
                  <UserCheck size={16} /> Assign Project Manager (Immediate Assignment)
                </label>
                <select
                  style={{ ...INPUT, background: 'var(--panel)' }}
                  value={newProject.pmName}
                  onChange={e => setNewProject({ ...newProject, pmName: e.target.value })}
                >
                  <option value="">-- Select & Assign Project Manager --</option>
                  {projectManagers.map(pm => (
                    <option key={pm.id} value={`${pm.name} (${pm.email})`}>
                      {pm.name} ({pm.email})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--muted)', marginBottom: '4px', fontWeight: 600 }}>Start Date</label>
                  <input
                    type="date"
                    style={INPUT}
                    value={newProject.startDate}
                    onChange={e => setNewProject({ ...newProject, startDate: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: 'var(--muted)', marginBottom: '4px', fontWeight: 600 }}>End Date (Deadline)</label>
                  <input
                    type="date"
                    style={INPUT}
                    value={newProject.deadline}
                    onChange={e => setNewProject({ ...newProject, deadline: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--muted)', marginBottom: '4px', fontWeight: 600 }}>Budget ($)</label>
                <input
                  type="number"
                  placeholder="e.g. 1500000"
                  style={INPUT}
                  value={newProject.budget}
                  onChange={e => setNewProject({ ...newProject, budget: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="secondary-button" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="primary-button">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
