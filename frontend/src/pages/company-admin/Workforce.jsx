import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Users, UserPlus, Search, Shield, Clock, Award, CheckCircle2, Phone, Mail, Building2, UserCheck, HardHat } from 'lucide-react';

const INPUT = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: '13px' };

export default function CompanyAdminWorkforce() {
  const { workers, addWorker, addUser, projects = [], usersList = [], companies = [], activateCompanySubscription } = useData();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const company = companies.find((item) => item.code === user?.companyCode) || companies.find((item) => item.name === user?.companyName);
  const subscriptionActive = company?.subscriptionStatus === 'ACTIVE';

  const managers = usersList.filter(u => ['COMPANY_ADMIN', 'COMPANY_MANAGER', 'PROJECT_MANAGER'].includes(u.role));

  const [personnelForm, setPersonnelForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'Project Manager',
    assignedProject: projects[0]?.name || 'Metro Tower Site A',
    assignedSite: 'Sector 5, Metro Zone',
    reportingManager: managers[0]?.fullName || 'Company Admin',
    employmentType: 'Full-time',
    status: 'Active',
  });

  const handleCreatePersonnel = (e) => {
    e.preventDefault();
    if (!subscriptionActive || !personnelForm.fullName.trim() || !personnelForm.email.trim()) return;

    // 1. Create worker / personnel record
    const createdWorker = {
      id: Date.now().toString(),
      name: personnelForm.fullName.trim(),
      fullName: personnelForm.fullName.trim(),
      email: personnelForm.email.trim(),
      phone: personnelForm.phone.trim(),
      role: personnelForm.role,
      companyName: user?.companyName,
      companyCode: user?.companyCode,
      assignedProject: personnelForm.assignedProject,
      projectName: personnelForm.assignedProject,
      site: personnelForm.assignedSite,
      reportingManager: personnelForm.reportingManager,
      employmentType: personnelForm.employmentType,
      status: personnelForm.status,
      workerAssignmentType: personnelForm.workerAssignmentType || 'DIRECT_PROJECT',
      contractorName: personnelForm.workerAssignmentType === 'CONTRACTOR' ? personnelForm.assignedContractor : null,
      siteEngineerName: personnelForm.workerAssignmentType === 'SITE_ENGINEER' ? personnelForm.assignedSE : null,
      performance: '100%',
    };

    addWorker(createdWorker);

    // 2. Also register in usersList so system role flows cleanly
    const roleMap = {
      'Project Manager': 'PROJECT_MANAGER',
      'Site Engineer': 'SITE_ENGINEER',
      'Contractor': 'CONTRACTOR',
      'Worker': 'WORKER',
    };

    addUser({
      fullName: personnelForm.fullName.trim(),
      email: personnelForm.email.trim() || `${personnelForm.fullName.toLowerCase().replace(/\s+/g, '.')}@solviontech.com`,
      role: roleMap[personnelForm.role] || 'WORKER',
      companyName: user?.companyName,
      companyCode: user?.companyCode,
      assignedProject: personnelForm.assignedProject,
    });

    api.post('/company/personnel', {
      fullName: personnelForm.fullName.trim(),
      email: personnelForm.email.trim(),
      role: roleMap[personnelForm.role] || 'WORKER',
    }).catch(() => undefined);

    setShowAddModal(false);
    setPersonnelForm({
      fullName: '',
      email: '',
      phone: '',
      role: 'Project Manager',
      assignedProject: projects[0]?.name || 'Metro Tower Site A',
      assignedSite: 'Sector 5, Metro Zone',
      reportingManager: managers[0]?.fullName || 'Company Admin',
      employmentType: 'Full-time',
      status: 'Active',
      workerAssignmentType: 'DIRECT_PROJECT',
      assignedContractor: '',
      assignedSE: '',
    });
  };

  const filtered = workers.filter(w => {
    const matchSearch = (w.name || w.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
                        (w.role || '').toLowerCase().includes(search.toLowerCase()) ||
                        (w.email || '').toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'ALL' || w.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <HardHat size={14} /> Workforce
          </p>
        </div>
        <button type="button" className="primary-button" onClick={() => subscriptionActive ? setShowAddModal(true) : activateCompanySubscription(company?.code)}>
          <UserPlus size={16} /> Add Personnel
        </button>
      </section>

      {!subscriptionActive && <div style={{ marginTop: '16px', border: '1px solid var(--orange)', background: 'rgba(245,154,22,0.10)', padding: '12px 16px', borderRadius: '10px', fontSize: '13px' }}>
        Activate the assigned <strong>{company?.plan || 'subscription'}</strong> plan before adding personnel.
        <button type="button" className="primary-button" style={{ marginLeft: '12px', padding: '6px 10px', fontSize: '12px' }} onClick={() => activateCompanySubscription(company?.code)}>Activate plan</button>
      </div>}

      {/* KPI Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginTop: '20px' }}>
        {[
          { label: 'Total Personnel', value: workers.length, color: 'var(--blue)' },
          { label: 'Active Status', value: workers.filter(w => (w.status || 'Active') === 'Active').length, color: 'var(--green)' },
          { label: 'Assigned Teams', value: `${projects.length} Sites`, color: 'var(--purple)' },
          { label: 'Avg Performance', value: '94.2%', color: 'var(--orange)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="panel" style={{ padding: '18px' }}>
            <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>{label}</span>
            <h3 style={{ fontSize: '22px', color, margin: '4px 0 0 0', fontWeight: 800 }}>{value}</h3>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '14px', marginTop: '20px', flexWrap: 'wrap' }}>
        <div className="search-box" style={{ width: '320px' }}>
          <Search size={16} style={{ color: 'var(--muted)' }} />
          <input
            placeholder="Search personnel by name, email, or role..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)', fontSize: '13px', fontWeight: 600 }}
        >
          <option value="ALL">All Roles</option>
          <option value="Project Manager">Project Manager</option>
          <option value="Site Engineer">Site Engineer</option>
          <option value="Contractor">Contractor</option>
          <option value="Worker">Worker</option>
        </select>
      </div>

      {/* Personnel Roster Table */}
      <div className="panel" style={{ marginTop: '20px', padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--panel-soft)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Personnel Name</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Role</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Contact Info</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Assigned Project & Site</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Reporting Manager</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Employment</th>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(w => (
              <tr key={w.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text)' }}>
                  {w.name || w.fullName}
                </td>
                <td style={{ padding: '14px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: 'rgba(37,99,235,0.12)',
                    color: 'var(--blue)',
                  }}>
                    {w.role}
                  </span>
                </td>
                <td style={{ padding: '14px', color: 'var(--muted)', fontSize: '12px' }}>
                  <div>{w.email || '—'}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>{w.phone || '+91 9876543210'}</div>
                </td>
                <td style={{ padding: '14px', color: 'var(--text)' }}>
                  <div style={{ fontWeight: 600 }}>{w.assignedProject || w.projectName || 'Metro Tower Site A'}</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{w.site || 'Sector 5 Site'}</div>
                </td>
                <td style={{ padding: '14px', color: 'var(--text-secondary)' }}>
                  {w.reportingManager || 'Company Admin'}
                </td>
                <td style={{ padding: '14px', color: 'var(--muted)' }}>
                  {w.employmentType || 'Full-time'}
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '10px',
                    background: (w.status || 'Active') === 'Active' ? 'rgba(34,197,94,0.12)' : 'rgba(245,154,22,0.12)',
                    color: (w.status || 'Active') === 'Active' ? 'var(--green)' : 'var(--orange)',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}>
                    {w.status || 'Active'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Add Personnel Modal ── */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="panel" style={{ width: '100%', maxWidth: '540px', padding: '28px', borderRadius: '18px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '4px', color: 'var(--text)' }}>Add Personnel</h2>
            <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '20px' }}>Company Admin Workforce Onboarding Form</p>

            <form onSubmit={handleCreatePersonnel} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--muted)', marginBottom: '4px', fontWeight: 600 }}>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  style={INPUT}
                  value={personnelForm.fullName}
                  onChange={e => setPersonnelForm({ ...personnelForm, fullName: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--muted)', marginBottom: '4px', fontWeight: 600 }}>Email</label>
                  <input
                    type="email"
                    placeholder="ramesh@company.com"
                    style={INPUT}
                    value={personnelForm.email}
                    onChange={e => setPersonnelForm({ ...personnelForm, email: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--muted)', marginBottom: '4px', fontWeight: 600 }}>Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    style={INPUT}
                    value={personnelForm.phone}
                    onChange={e => setPersonnelForm({ ...personnelForm, phone: e.target.value })}
                  />
                </div>
              </div>

              {/* Role Dropdown */}
              <div>
                <label style={{ display: 'block', color: 'var(--muted)', marginBottom: '4px', fontWeight: 600 }}>Role ▼</label>
                <select
                  style={{ ...INPUT, fontWeight: 700, color: 'var(--blue)' }}
                  value={personnelForm.role}
                  onChange={e => setPersonnelForm({ ...personnelForm, role: e.target.value })}
                >
                  <option value="Project Manager">Project Manager</option>
                  <option value="Site Engineer">Site Engineer</option>
                  <option value="Contractor">Contractor</option>
                  <option value="Worker">Worker</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--muted)', marginBottom: '4px', fontWeight: 600 }}>Assign Project</label>
                  <select
                    style={INPUT}
                    value={personnelForm.assignedProject}
                    onChange={e => setPersonnelForm({ ...personnelForm, assignedProject: e.target.value })}
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                    <option value="Metro Tower Site A">Metro Tower Site A</option>
                    <option value="Highway Overpass Project">Highway Overpass Project</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', color: 'var(--muted)', marginBottom: '4px', fontWeight: 600 }}>Assign Site</label>
                  <input
                    type="text"
                    placeholder="e.g. Sector 5, Metro Zone"
                    style={INPUT}
                    value={personnelForm.assignedSite}
                    onChange={e => setPersonnelForm({ ...personnelForm, assignedSite: e.target.value })}
                  />
                </div>
              </div>

              {personnelForm.role === 'Worker' && (
                <div style={{ background: 'var(--panel-soft)', padding: '14px', borderRadius: '12px', border: '1px solid var(--blue)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ color: 'var(--blue)', fontWeight: 700, fontSize: '12px' }}>
                    ⚡ Step 11 Worker Assignment Options
                  </label>
                  <div>
                    <label style={{ display: 'block', color: 'var(--muted)', marginBottom: '4px', fontSize: '12px' }}>Assign Worker To:</label>
                    <select
                      style={{ ...INPUT, background: 'var(--panel)' }}
                      value={personnelForm.workerAssignmentType || 'DIRECT_PROJECT'}
                      onChange={e => setPersonnelForm({ ...personnelForm, workerAssignmentType: e.target.value })}
                    >
                      <option value="DIRECT_PROJECT">Option 1: Directly to Project</option>
                      <option value="CONTRACTOR">Option 2: Assigned to Contractor</option>
                      <option value="SITE_ENGINEER">Option 3: Assigned to Site Engineer</option>
                    </select>
                  </div>

                  {personnelForm.workerAssignmentType === 'CONTRACTOR' && (
                    <div>
                      <label style={{ display: 'block', color: 'var(--muted)', marginBottom: '4px', fontSize: '12px' }}>Select Contractor</label>
                      <select
                        style={{ ...INPUT, background: 'var(--panel)' }}
                        value={personnelForm.assignedContractor || ''}
                        onChange={e => setPersonnelForm({ ...personnelForm, assignedContractor: e.target.value })}
                      >
                        <option value="">-- Select Contractor --</option>
                        {usersList.filter(u => u.role === 'CONTRACTOR').map(c => (
                          <option key={c.id} value={c.fullName || c.name}>{c.fullName || c.name}</option>
                        ))}
                        <option value="BuildCorp Contractors">BuildCorp Contractors</option>
                        <option value="Apex Foundations">Apex Foundations</option>
                      </select>
                    </div>
                  )}

                  {personnelForm.workerAssignmentType === 'SITE_ENGINEER' && (
                    <div>
                      <label style={{ display: 'block', color: 'var(--muted)', marginBottom: '4px', fontSize: '12px' }}>Select Site Engineer</label>
                      <select
                        style={{ ...INPUT, background: 'var(--panel)' }}
                        value={personnelForm.assignedSE || ''}
                        onChange={e => setPersonnelForm({ ...personnelForm, assignedSE: e.target.value })}
                      >
                        <option value="">-- Select Site Engineer --</option>
                        {usersList.filter(u => u.role === 'SITE_ENGINEER').map(se => (
                          <option key={se.id} value={se.fullName || se.name}>{se.fullName || se.name}</option>
                        ))}
                        <option value="Amit Kumar (Site Engineer)">Amit Kumar (Site Engineer)</option>
                        <option value="Priya Singh (Site Engineer)">Priya Singh (Site Engineer)</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--muted)', marginBottom: '4px', fontWeight: 600 }}>Reporting Manager</label>
                  <select
                    style={INPUT}
                    value={personnelForm.reportingManager}
                    onChange={e => setPersonnelForm({ ...personnelForm, reportingManager: e.target.value })}
                  >
                    {managers.map(m => (
                      <option key={m.id} value={m.fullName || m.name}>{m.fullName || m.name} ({m.role})</option>
                    ))}
                    <option value="Company Admin">Company Admin</option>
                    <option value="Rajesh Verma (PM)">Rajesh Verma (PM)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', color: 'var(--muted)', marginBottom: '4px', fontWeight: 600 }}>Employment Type</label>
                  <select
                    style={INPUT}
                    value={personnelForm.employmentType}
                    onChange={e => setPersonnelForm({ ...personnelForm, employmentType: e.target.value })}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Subcontractor">Subcontractor</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--muted)', marginBottom: '4px', fontWeight: 600 }}>Status</label>
                <select
                  style={INPUT}
                  value={personnelForm.status}
                  onChange={e => setPersonnelForm({ ...personnelForm, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" className="secondary-button" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="primary-button">Create Personnel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
