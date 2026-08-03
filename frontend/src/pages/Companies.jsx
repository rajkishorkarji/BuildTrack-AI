import { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Shield,
  Edit,
  Trash2,
  Key,
  Download,
  UserPlus,
  AlertTriangle,
} from 'lucide-react';

const initialCompanies = [
  {
    id: 1,
    name: 'Solviontech Infrastructure Ltd',
    code: 'SOLV-INFRA',
    adminName: 'Rajkishor Karji',
    adminEmail: 'rajkishor@buildtrack.ai',
    plan: 'Enterprise SaaS ($4,999/mo)',
    projectsCount: 14,
    usersCount: 240,
    status: 'ACTIVE',
    registeredDate: '2024-01-15',
  },
  {
    id: 2,
    name: 'Apex Construction Group',
    code: 'APEX-CONST',
    adminName: 'Sarah Jenkins',
    adminEmail: 'sarah@apexconstruction.com',
    plan: 'Pro Plan ($1,999/mo)',
    projectsCount: 8,
    usersCount: 110,
    status: 'ACTIVE',
    registeredDate: '2024-02-10',
  },
  {
    id: 3,
    name: 'Metropolis Builders Corp',
    code: 'METRO-BUILD',
    adminName: 'Daniel Vance',
    adminEmail: 'daniel@metropolis.io',
    plan: 'Starter Plan ($499/mo)',
    projectsCount: 2,
    usersCount: 25,
    status: 'SUSPENDED',
    registeredDate: '2024-03-22',
  },
  {
    id: 4,
    name: 'Titan Heavy Structures LLC',
    code: 'TITAN-HEAVY',
    adminName: 'Michael Chang',
    adminEmail: 'm.chang@titanheavy.com',
    plan: 'Enterprise SaaS ($4,999/mo)',
    projectsCount: 19,
    usersCount: 340,
    status: 'ACTIVE',
    registeredDate: '2024-04-05',
  },
];

const pendingApprovals = [
  {
    id: 101,
    name: 'Skyline Urban Developers',
    code: 'SKY-URBAN',
    applicantName: 'Vikramaditya Roy',
    applicantEmail: 'roy@skylineurban.in',
    requestedPlan: 'Enterprise Plan',
    appliedDate: '2026-08-01',
    documentVerified: true,
  },
  {
    id: 102,
    name: 'Heritage Builders Odisha',
    code: 'HERITAGE-OD',
    applicantName: 'Priya Senapati',
    applicantEmail: 'priya@heritageod.com',
    requestedPlan: 'Pro Plan',
    appliedDate: '2026-08-02',
    documentVerified: false,
  },
];

export default function Companies() {
  const [companies, setCompanies] = useState(initialCompanies);
  const [pending, setPending] = useState(pendingApprovals);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'PENDING' | 'ADMINS'
  const [search, setSearch] = useState('');
  const [actionNotice, setActionNotice] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: '',
    code: '',
    adminName: '',
    adminEmail: '',
    plan: 'Enterprise SaaS ($4,999/mo)',
  });

  const notify = (msg) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(''), 3500);
  };

  const handleToggleStatus = (id) => {
    setCompanies((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: c.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } : c
      )
    );
    notify('Company account status updated successfully!');
  };

  const handleApprove = (id) => {
    const item = pending.find((p) => p.id === id);
    if (!item) return;
    setPending((prev) => prev.filter((p) => p.id !== id));
    setCompanies((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: item.name,
        code: item.code,
        adminName: item.applicantName,
        adminEmail: item.applicantEmail,
        plan: item.requestedPlan,
        projectsCount: 1,
        usersCount: 5,
        status: 'ACTIVE',
        registeredDate: new Date().toISOString().split('T')[0],
      },
    ]);
    notify(`Approved registration for ${item.name}!`);
  };

  const handleReject = (id) => {
    setPending((prev) => prev.filter((p) => p.id !== id));
    notify('Company registration request rejected.');
  };

  const handleCreateCompany = (e) => {
    e.preventDefault();
    if (!newCompany.name) return;
    setCompanies([
      ...companies,
      {
        id: Date.now(),
        name: newCompany.name,
        code: newCompany.code || newCompany.name.substring(0, 4).toUpperCase() + '-CO',
        adminName: newCompany.adminName || 'Company Admin',
        adminEmail: newCompany.adminEmail || 'admin@company.com',
        plan: newCompany.plan,
        projectsCount: 0,
        usersCount: 1,
        status: 'ACTIVE',
        registeredDate: new Date().toISOString().split('T')[0],
      },
    ]);
    setShowCreateModal(false);
    setNewCompany({ name: '', code: '', adminName: '', adminEmail: '', plan: 'Enterprise SaaS ($4,999/mo)' });
    notify(`New Company "${newCompany.name}" onboarded into platform!`);
  };

  const filteredCompanies = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.adminName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <p className="eyebrow" style={{ color: 'var(--blue)', fontWeight: 600 }}>PLATFORM GOVERNANCE</p>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Tenant Companies Management</h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '4px' }}>
            System Admin panel to register, inspect, suspend, and govern all tenant construction enterprises.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            className="secondary-button"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={() => notify('Exported Tenant Company Ledger to CSV')}
          >
            <Download size={16} /> Export CSV
          </button>
          <button
            type="button"
            className="primary-button"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={16} /> Register New Company
          </button>
        </div>
      </div>

      {actionNotice && (
        <div style={{ background: 'rgba(36, 196, 107, 0.15)', border: '1px solid var(--green)', color: 'var(--green)', padding: '12px 18px', borderRadius: '10px', fontWeight: 600, fontSize: '14px' }}>
          {actionNotice}
        </div>
      )}

      {/* Metric summary banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="panel" style={{ padding: '18px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Total Companies</span>
          <h2 style={{ fontSize: '26px', color: 'var(--blue)', marginTop: '4px' }}>{companies.length}</h2>
          <small style={{ color: 'var(--green)' }}>All SaaS Tenants</small>
        </div>
        <div className="panel" style={{ padding: '18px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Active Tenants</span>
          <h2 style={{ fontSize: '26px', color: 'var(--green)', marginTop: '4px' }}>
            {companies.filter((c) => c.status === 'ACTIVE').length}
          </h2>
          <small style={{ color: 'var(--muted)' }}>Normal Operations</small>
        </div>
        <div className="panel" style={{ padding: '18px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Suspended Accounts</span>
          <h2 style={{ fontSize: '26px', color: 'var(--red)', marginTop: '4px' }}>
            {companies.filter((c) => c.status === 'SUSPENDED').length}
          </h2>
          <small style={{ color: 'var(--red)' }}>Action Required</small>
        </div>
        <div className="panel" style={{ padding: '18px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Pending Registrations</span>
          <h2 style={{ fontSize: '26px', color: 'var(--orange)', marginTop: '4px' }}>{pending.length}</h2>
          <small style={{ color: 'var(--orange)' }}>Awaiting Approval</small>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className={activeTab === 'ALL' ? 'primary-button' : 'secondary-button'}
              onClick={() => setActiveTab('ALL')}
            >
              All Companies ({companies.length})
            </button>
            <button
              type="button"
              className={activeTab === 'PENDING' ? 'primary-button' : 'secondary-button'}
              onClick={() => setActiveTab('PENDING')}
            >
              Pending Approvals ({pending.length})
            </button>
            <button
              type="button"
              className={activeTab === 'ADMINS' ? 'primary-button' : 'secondary-button'}
              onClick={() => setActiveTab('ADMINS')}
            >
              Company Admins Directory
            </button>
          </div>

          <div className="search-box" style={{ width: '280px' }}>
            <Search size={16} />
            <input
              placeholder="Search by company or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Tab 1: All Companies Table */}
        {activeTab === 'ALL' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '12px' }}>Company & Code</th>
                  <th style={{ padding: '12px' }}>Assigned Admin</th>
                  <th style={{ padding: '12px' }}>SaaS Plan</th>
                  <th style={{ padding: '12px' }}>Projects</th>
                  <th style={{ padding: '12px' }}>Users</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(78, 132, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blue)', fontWeight: 700 }}>
                          <Building2 size={18} />
                        </div>
                        <div>
                          <strong style={{ fontSize: '14px', display: 'block' }}>{c.name}</strong>
                          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>ID: {c.code}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <strong>{c.adminName}</strong>
                      <div style={{ color: 'var(--muted)', fontSize: '12px' }}>{c.adminEmail}</div>
                    </td>
                    <td style={{ padding: '14px 12px', color: 'var(--purple)', fontWeight: 600 }}>{c.plan}</td>
                    <td style={{ padding: '14px 12px', fontWeight: 600 }}>{c.projectsCount} Sites</td>
                    <td style={{ padding: '14px 12px' }}>{c.usersCount} Users</td>
                    <td style={{ padding: '14px 12px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 700,
                          background: c.status === 'ACTIVE' ? 'rgba(36, 196, 107, 0.15)' : 'rgba(235, 87, 87, 0.15)',
                          color: c.status === 'ACTIVE' ? 'var(--green)' : 'var(--red)',
                        }}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          type="button"
                          className="secondary-button"
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                          title="Reset Password"
                          onClick={() => notify(`Reset password link sent to ${c.adminEmail}`)}
                        >
                          <Key size={14} />
                        </button>
                        <button
                          type="button"
                          className="secondary-button"
                          style={{
                            padding: '4px 10px',
                            fontSize: '12px',
                            color: c.status === 'ACTIVE' ? 'var(--red)' : 'var(--green)',
                          }}
                          onClick={() => handleToggleStatus(c.id)}
                        >
                          {c.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Pending Approvals */}
        {activeTab === 'PENDING' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {pending.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--muted)' }}>
                No pending company registration requests at this time.
              </div>
            ) : (
              pending.map((p) => (
                <div
                  key={p.id}
                  style={{
                    padding: '18px',
                    borderRadius: '12px',
                    background: 'var(--panel-soft)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px',
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '16px', margin: 0 }}>{p.name} ({p.code})</h4>
                    <p style={{ color: 'var(--muted)', fontSize: '13px', margin: '4px 0 0 0' }}>
                      Applicant: <strong>{p.applicantName}</strong> ({p.applicantEmail}) • Requested Plan: <span style={{ color: 'var(--purple)', fontWeight: 600 }}>{p.requestedPlan}</span>
                    </p>
                    <small style={{ color: 'var(--muted)' }}>Applied on {p.appliedDate}</small>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      className="primary-button"
                      style={{ background: 'var(--green)', padding: '6px 14px', fontSize: '13px' }}
                      onClick={() => handleApprove(p.id)}
                    >
                      <CheckCircle2 size={14} /> Approve Registration
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      style={{ color: 'var(--red)', padding: '6px 14px', fontSize: '13px' }}
                      onClick={() => handleReject(p.id)}
                    >
                      <XCircle size={14} /> Reject Request
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Company Admins Directory */}
        {activeTab === 'ADMINS' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '12px' }}>Admin Name</th>
                  <th style={{ padding: '12px' }}>Email</th>
                  <th style={{ padding: '12px' }}>Company</th>
                  <th style={{ padding: '12px' }}>Role</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 12px', fontWeight: 600 }}>{c.adminName}</td>
                    <td style={{ padding: '14px 12px', color: 'var(--muted)' }}>{c.adminEmail}</td>
                    <td style={{ padding: '14px 12px', color: 'var(--blue)', fontWeight: 600 }}>{c.name}</td>
                    <td style={{ padding: '14px 12px' }}>COMPANY_ADMIN</td>
                    <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                      <button
                        type="button"
                        className="secondary-button"
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                        onClick={() => notify(`Re-assigned Company Admin privileges for ${c.adminName}`)}
                      >
                        <UserPlus size={14} /> Reassign Admin
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create Company */}
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
          <div className="panel" style={{ width: '450px', padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Onboard New Construction Enterprise</h3>
            <form onSubmit={handleCreateCompany} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>Company Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Apex Infra Build Ltd"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>Company Code / Tax ID</label>
                <input
                  type="text"
                  placeholder="e.g. APEX-INFRA"
                  value={newCompany.code}
                  onChange={(e) => setNewCompany({ ...newCompany, code: e.target.value })}
                  style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>Company Admin Name</label>
                <input
                  type="text"
                  placeholder="e.g. Vikramaditya Roy"
                  value={newCompany.adminName}
                  onChange={(e) => setNewCompany({ ...newCompany, adminName: e.target.value })}
                  style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>Company Admin Email</label>
                <input
                  type="email"
                  placeholder="e.g. admin@apexinfra.com"
                  value={newCompany.adminEmail}
                  onChange={(e) => setNewCompany({ ...newCompany, adminEmail: e.target.value })}
                  style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>Subscription Tier</label>
                <select
                  value={newCompany.plan}
                  onChange={(e) => setNewCompany({ ...newCompany, plan: e.target.value })}
                  style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)' }}
                >
                  <option value="Enterprise SaaS ($4,999/mo)">Enterprise SaaS ($4,999/mo)</option>
                  <option value="Pro Plan ($1,999/mo)">Pro Plan ($1,999/mo)</option>
                  <option value="Starter Plan ($499/mo)">Starter Plan ($499/mo)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" className="secondary-button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Create Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
