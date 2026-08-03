import { useState } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Search,
  Key,
  Lock,
  LogOut,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  ShieldAlert,
} from 'lucide-react';

const initialUsers = [
  { id: 1, name: 'System Master Admin', email: 'superadmin@buildtrack.ai', role: 'SUPER_ADMIN', roleLabel: 'Super Admin', company: 'BuildTrack AI Platform', status: 'ACTIVE', lastLogin: '2 mins ago' },
  { id: 2, name: 'Rajkishor Karji', email: 'rajkishor@buildtrack.ai', role: 'COMPANY_ADMIN', roleLabel: 'Company Admin', company: 'Solviontech Infrastructure Ltd', status: 'ACTIVE', lastLogin: '1 hour ago' },
  { id: 3, name: 'Vikram Nair', email: 'vikram@buildtrack.ai', role: 'PROJECT_MANAGER', roleLabel: 'Project Manager', company: 'Solviontech Infrastructure Ltd', status: 'ACTIVE', lastLogin: '3 hours ago' },
  { id: 4, name: 'Divya Krishnan', email: 'divya@buildtrack.ai', role: 'SITE_ENGINEER', roleLabel: 'Senior Site Engineer', company: 'Solviontech Infrastructure Ltd', status: 'ACTIVE', lastLogin: '10 mins ago' },
  { id: 5, name: 'Robert Fox', email: 'robert@buildtrack.ai', role: 'CONTRACTOR', roleLabel: 'Prime Contractor', company: 'Fox Steel Constructors', status: 'ACTIVE', lastLogin: 'Yesterday' },
  { id: 6, name: 'Rose Smith', email: 'rose@buildtrack.ai', role: 'WORKER', roleLabel: 'Senior Mason', company: 'Solviontech Infrastructure Ltd', status: 'ACTIVE', lastLogin: 'Today 08:12 AM' },
  { id: 7, name: 'Michael Vance', email: 'mance@metropolis.io', role: 'COMPANY_ADMIN', roleLabel: 'Company Admin', company: 'Metropolis Builders Corp', status: 'SUSPENDED', lastLogin: '5 days ago' },
];

const defaultRoles = [
  { code: 'SUPER_ADMIN', name: 'Super Admin', scope: 'Software Platform Owner', permissionsCount: 48 },
  { code: 'COMPANY_ADMIN', name: 'Company Admin', scope: 'Enterprise Tenant Admin', permissionsCount: 36 },
  { code: 'PROJECT_MANAGER', name: 'Project Manager', scope: 'Project & Site Planning', permissionsCount: 28 },
  { code: 'SITE_ENGINEER', name: 'Site Engineer', scope: 'On-Site Execution & Inspection', permissionsCount: 20 },
  { code: 'CONTRACTOR', name: 'Contractor', scope: 'Subcontractor Crew & Invoicing', permissionsCount: 14 },
  { code: 'WORKER', name: 'Worker', scope: 'Field Attendance & Task Logs', permissionsCount: 8 },
];

const initialPermissions = [
  { module: 'Platform Governance & Tenant Companies', superAdmin: true, companyAdmin: false, pm: false, siteEng: false, contractor: false, worker: false },
  { module: 'System Monitoring & Backup Logs', superAdmin: true, companyAdmin: false, pm: false, siteEng: false, contractor: false, worker: false },
  { module: 'Company Finances & Authorizations', superAdmin: true, companyAdmin: true, pm: false, siteEng: false, contractor: false, worker: false },
  { module: 'Project Creation & Budget Controls', superAdmin: false, companyAdmin: true, pm: true, siteEng: false, contractor: false, worker: false },
  { module: 'Task Assignments & Daily Reports', superAdmin: false, companyAdmin: true, pm: true, siteEng: true, contractor: false, worker: false },
  { module: 'Equipment & Material Allocations', superAdmin: false, companyAdmin: true, pm: true, siteEng: true, contractor: false, worker: false },
  { module: 'Labor Billing Claims & Invoicing', superAdmin: false, companyAdmin: true, pm: false, siteEng: false, contractor: true, worker: false },
  { module: 'Field Attendance QR & Task Check-In', superAdmin: false, companyAdmin: false, pm: false, siteEng: false, contractor: false, worker: true },
];

export default function UsersPage() {
  const [users, setUsers] = useState(initialUsers);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'ROLES' | 'PERMISSIONS'
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'COMPANY_ADMIN', company: 'Solviontech Infrastructure Ltd' });

  const notify = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3500);
  };

  const handleToggleStatus = (id) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } : u))
    );
    notify('User access status updated.');
  };

  const handleForceLogout = (name) => {
    notify(`Triggered force logout session termination for ${name}`);
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;
    setUsers([
      ...users,
      {
        id: Date.now(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        roleLabel: newUser.role.replace('_', ' '),
        company: newUser.company,
        status: 'ACTIVE',
        lastLogin: 'Just registered',
      },
    ]);
    setShowCreateModal(false);
    setNewUser({ name: '', email: '', role: 'COMPANY_ADMIN', company: 'Solviontech Infrastructure Ltd' });
    notify(`Created user account for ${newUser.name}`);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <p className="eyebrow" style={{ color: 'var(--blue)', fontWeight: 600 }}>IDENTITY & ACCESS MANAGEMENT</p>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Global User & RBAC Management</h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '4px' }}>
            System Admin control panel to govern all platform accounts, roles, and permission matrices.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={() => setShowCreateModal(true)}
        >
          <UserPlus size={16} /> Add Platform User
        </button>
      </div>

      {notice && (
        <div style={{ background: 'rgba(36, 196, 107, 0.15)', border: '1px solid var(--green)', color: 'var(--green)', padding: '12px 18px', borderRadius: '10px', fontWeight: 600, fontSize: '14px' }}>
          {notice}
        </div>
      )}

      {/* Tabs */}
      <div className="panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className={activeTab === 'ALL' ? 'primary-button' : 'secondary-button'}
              onClick={() => setActiveTab('ALL')}
            >
              All System Users ({users.length})
            </button>
            <button
              type="button"
              className={activeTab === 'ROLES' ? 'primary-button' : 'secondary-button'}
              onClick={() => setActiveTab('ROLES')}
            >
              Role Definitions ({defaultRoles.length})
            </button>
            <button
              type="button"
              className={activeTab === 'PERMISSIONS' ? 'primary-button' : 'secondary-button'}
              onClick={() => setActiveTab('PERMISSIONS')}
            >
              RBAC Permission Matrix
            </button>
          </div>

          {activeTab === 'ALL' && (
            <div className="search-box" style={{ width: '280px' }}>
              <Search size={16} />
              <input
                placeholder="Search user name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Tab 1: All Users Table */}
        {activeTab === 'ALL' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '12px' }}>User & Email</th>
                  <th style={{ padding: '12px' }}>Assigned Role</th>
                  <th style={{ padding: '12px' }}>Company Enterprise</th>
                  <th style={{ padding: '12px' }}>Last Activity</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 12px' }}>
                      <strong style={{ fontSize: '14px', display: 'block' }}>{u.name}</strong>
                      <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{u.email}</span>
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(78, 132, 247, 0.12)', color: 'var(--blue)', fontWeight: 700, fontSize: '12px' }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '14px 12px', color: 'var(--muted)' }}>{u.company}</td>
                    <td style={{ padding: '14px 12px', fontSize: '12px' }}>{u.lastLogin}</td>
                    <td style={{ padding: '14px 12px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 700,
                          background: u.status === 'ACTIVE' ? 'rgba(36, 196, 107, 0.15)' : 'rgba(235, 87, 87, 0.15)',
                          color: u.status === 'ACTIVE' ? 'var(--green)' : 'var(--red)',
                        }}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          type="button"
                          className="secondary-button"
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                          title="Reset Password"
                          onClick={() => notify(`Sent password reset instructions to ${u.email}`)}
                        >
                          <Key size={14} />
                        </button>
                        <button
                          type="button"
                          className="secondary-button"
                          style={{ padding: '4px 8px', fontSize: '12px', color: 'var(--orange)' }}
                          title="Force Logout"
                          onClick={() => handleForceLogout(u.name)}
                        >
                          <LogOut size={14} />
                        </button>
                        <button
                          type="button"
                          className="secondary-button"
                          style={{
                            padding: '4px 10px',
                            fontSize: '12px',
                            color: u.status === 'ACTIVE' ? 'var(--red)' : 'var(--green)',
                          }}
                          onClick={() => handleToggleStatus(u.id)}
                        >
                          {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Default Roles */}
        {activeTab === 'ROLES' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {defaultRoles.map((r) => (
              <div key={r.code} className="panel" style={{ padding: '20px', background: 'var(--panel-soft)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '16px', margin: 0, color: 'var(--blue)' }}>{r.name}</h3>
                  <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '6px', background: 'rgba(78, 132, 247, 0.15)', fontWeight: 600 }}>{r.code}</span>
                </div>
                <p style={{ color: 'var(--muted)', fontSize: '13px', margin: '4px 0 12px 0' }}>{r.scope}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--muted)', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                  <span>Permissions: <strong>{r.permissionsCount} Active Rules</strong></span>
                  <span style={{ color: 'var(--green)', fontWeight: 600 }}>SYSTEM DEFAULT</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Permission Matrix */}
        {activeTab === 'PERMISSIONS' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '13px' }}>
              <thead>
                <tr style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '12px' }}>Platform Module Scope</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Super Admin</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Company Admin</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>PM</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Site Engineer</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Contractor</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Worker</th>
                </tr>
              </thead>
              <tbody>
                {initialPermissions.map((p, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>{p.module}</td>
                    <td style={{ padding: '12px' }}>{p.superAdmin ? <CheckCircle2 size={18} style={{ color: 'var(--green)', margin: 'auto' }} /> : <XCircle size={18} style={{ color: 'var(--muted)', margin: 'auto' }} />}</td>
                    <td style={{ padding: '12px' }}>{p.companyAdmin ? <CheckCircle2 size={18} style={{ color: 'var(--green)', margin: 'auto' }} /> : <XCircle size={18} style={{ color: 'var(--muted)', margin: 'auto' }} />}</td>
                    <td style={{ padding: '12px' }}>{p.pm ? <CheckCircle2 size={18} style={{ color: 'var(--green)', margin: 'auto' }} /> : <XCircle size={18} style={{ color: 'var(--muted)', margin: 'auto' }} />}</td>
                    <td style={{ padding: '12px' }}>{p.siteEng ? <CheckCircle2 size={18} style={{ color: 'var(--green)', margin: 'auto' }} /> : <XCircle size={18} style={{ color: 'var(--muted)', margin: 'auto' }} />}</td>
                    <td style={{ padding: '12px' }}>{p.contractor ? <CheckCircle2 size={18} style={{ color: 'var(--green)', margin: 'auto' }} /> : <XCircle size={18} style={{ color: 'var(--muted)', margin: 'auto' }} />}</td>
                    <td style={{ padding: '12px' }}>{p.worker ? <CheckCircle2 size={18} style={{ color: 'var(--green)', margin: 'auto' }} /> : <XCircle size={18} style={{ color: 'var(--muted)', margin: 'auto' }} />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create User */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
          }}
        >
          <div className="panel" style={{ width: '420px', padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Create Platform User</h3>
            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Ramesh Chandra"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>Email Address</label>
                <input
                  required
                  type="email"
                  placeholder="e.g. ramesh@company.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>Assign Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)' }}
                >
                  <option value="SUPER_ADMIN">SUPER_ADMIN (System Admin)</option>
                  <option value="COMPANY_ADMIN">COMPANY_ADMIN (Company Admin)</option>
                  <option value="PROJECT_MANAGER">PROJECT_MANAGER (Project Manager)</option>
                  <option value="SITE_ENGINEER">SITE_ENGINEER (Site Engineer)</option>
                  <option value="CONTRACTOR">CONTRACTOR (Subcontractor)</option>
                  <option value="WORKER">WORKER (Field Worker)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" className="secondary-button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
