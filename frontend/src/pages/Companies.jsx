import { useState } from 'react';
import { useData } from '../context/DataContext';
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

export default function Companies() {
  const { companies, addCompany } = useData();
  const [pending, setPending] = useState([]);
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

  const handleApprove = (id) => {
    const item = pending.find((p) => p.id === id);
    if (!item) return;
    setPending((prev) => prev.filter((p) => p.id !== id));
    addCompany({
      name: item.name,
      code: item.code,
      adminName: item.applicantName,
      adminEmail: item.applicantEmail,
      plan: item.requestedPlan,
    });
    notify(`Approved registration for ${item.name}!`);
  };

  const handleReject = (id) => {
    setPending((prev) => prev.filter((p) => p.id !== id));
    notify('Company registration request rejected.');
  };

  const handleCreateCompany = (e) => {
    e.preventDefault();
    if (!newCompany.name) return;
    addCompany({
      name: newCompany.name,
      code: newCompany.code || newCompany.name.substring(0, 4).toUpperCase() + '-CO',
      adminName: newCompany.adminName || 'Company Admin',
      adminEmail: newCompany.adminEmail || 'admin@company.com',
      plan: newCompany.plan,
    });
    setShowCreateModal(false);
    setNewCompany({ name: '', code: '', adminName: '', adminEmail: '', plan: 'Enterprise SaaS ($4,999/mo)' });
    notify(`New Company "${newCompany.name}" onboarded into platform! Total Companies updated.`);
  };

  const filteredCompanies = companies.filter((c) =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.code || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-page">
      {/* Page Header */}
      <section className="hero-row">
        <div>
          <p className="eyebrow">Platform Multi-Tenancy Engine</p>
          <h1>Companies & Tenant Management ({companies.length})</h1>
        </div>

        <button type="button" className="primary-button" onClick={() => setShowCreateModal(true)}>
          <Plus size={16} /> Register New Tenant Company
        </button>
      </section>

      {actionNotice && (
        <div style={{ background: 'rgba(36, 196, 107, 0.15)', border: '1px solid var(--green)', color: 'var(--green)', padding: '12px 18px', borderRadius: '10px', fontWeight: 600, fontSize: '14px', marginTop: '16px' }}>
          {actionNotice}
        </div>
      )}

      {/* Tabs & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'ALL' ? 'var(--blue)' : 'var(--panel)',
              color: activeTab === 'ALL' ? '#fff' : 'var(--muted)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Registered Companies ({companies.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PENDING')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'PENDING' ? 'var(--blue)' : 'var(--panel)',
              color: activeTab === 'PENDING' ? '#fff' : 'var(--muted)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Pending Approvals ({pending.length})
          </button>
        </div>

        <div className="search-box" style={{ width: '280px' }}>
          <Search size={16} style={{ color: 'var(--muted)' }} />
          <input placeholder="Search company or code..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Content based on Active Tab */}
      {activeTab === 'ALL' && (
        <div className="panel" style={{ marginTop: '20px', padding: '0', overflow: 'hidden' }}>
          {filteredCompanies.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
              <Building2 size={36} style={{ marginBottom: '12px', color: 'var(--muted)' }} />
              <h3 style={{ fontSize: '16px', color: 'var(--text)', margin: '0 0 6px 0' }}>No Companies Registered Yet</h3>
              <p style={{ fontSize: '13px', margin: 0 }}>Click &quot;Register New Tenant Company&quot; above to add a company tenant.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--panel-soft)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                    <th style={{ padding: '14px 20px' }}>Company Legal Name</th>
                    <th style={{ padding: '14px' }}>Tenant Code</th>
                    <th style={{ padding: '14px' }}>Company Admin</th>
                    <th style={{ padding: '14px' }}>Status</th>
                    <th style={{ padding: '14px' }}>Projects</th>
                    <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Building2 size={18} style={{ color: 'var(--blue)' }} />
                          {c.name}
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}><code>{c.code || 'CO-TENANT'}</code></td>
                      <td style={{ padding: '16px' }}>{c.adminName || 'Admin'} ({c.adminEmail || 'admin@co.com'})</td>
                      <td style={{ padding: '16px' }}>
                        <span className="schedule-pill">{c.status || 'Active'}</span>
                      </td>
                      <td style={{ padding: '16px', fontWeight: 600 }}>{c.projectsCount || 0} Sites</td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <button type="button" className="secondary-button" style={{ fontSize: '12px', padding: '6px 12px' }}>
                          Manage Tenant
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CREATE COMPANY MODAL */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="panel" style={{ width: '100%', maxWidth: '480px', padding: '28px', borderRadius: '16px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--text)' }}>Register Tenant Company</h2>
            <form onSubmit={handleCreateCompany} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div>
                <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Company Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Solviontech Infrastructure Ltd"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
                />
              </div>

              <div>
                <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Company Code</label>
                <input
                  type="text"
                  placeholder="e.g. SOLV-CO"
                  value={newCompany.code}
                  onChange={(e) => setNewCompany({ ...newCompany, code: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Admin Full Name</label>
                  <input
                    type="text"
                    placeholder="Admin Name"
                    value={newCompany.adminName}
                    onChange={(e) => setNewCompany({ ...newCompany, adminName: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
                  />
                </div>
                <div>
                  <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Admin Email</label>
                  <input
                    type="email"
                    placeholder="admin@domain.com"
                    value={newCompany.adminEmail}
                    onChange={(e) => setNewCompany({ ...newCompany, adminEmail: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="secondary-button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Register Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
