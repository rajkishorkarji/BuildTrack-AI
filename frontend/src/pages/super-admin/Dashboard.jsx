import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  Building2, CheckCircle2, FolderKanban, Users, DollarSign, Activity, ShieldCheck, Search, Download
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const { companies = [], projects = [], workers = [], finances = [], usersList = [], teamMembers = [] } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [exportMessage, setExportMessage] = useState('');

  const totalRev = (finances || []).reduce((sum, f) => sum + (parseFloat(f.amount) || 0), 0) +
    (projects || []).reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0);

  // De-duplicate companies by name (so each company is only shown once)
  const uniqueCompanies = [];
  const seenCompanies = new Set();
  for (const c of (companies || [])) {
    const compName = c.name?.trim().toLowerCase();
    if (compName && !seenCompanies.has(compName)) {
      seenCompanies.add(compName);
      uniqueCompanies.push(c);
    }
  }

  const activeCompanies = uniqueCompanies.filter(c => (c.status || 'Active') === 'Active');
  // Total Users = registered system accounts + field workers + team members
  const totalUsers = (usersList || []).length + (workers || []).length + (teamMembers || []).length;

  const filteredCompanies = uniqueCompanies.filter(c =>
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.adminName && c.adminName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleExportDashboard = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      exportedAt: new Date().toISOString(),
      platform: "BuildTrack AI Super Admin System",
      companiesCount: uniqueCompanies.length,
      activeCompaniesCount: activeCompanies.length,
      projectsCount: projects.length,
      totalUsers,
      revenue: totalRev,
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `BuildTrack_SuperAdmin_Dashboard_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setExportMessage('Dashboard report exported successfully!');
    setTimeout(() => setExportMessage(''), 3000);
  };

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <ShieldCheck size={14} /> Dashboard
          </p>
        </div>
        <button type="button" className="primary-button" onClick={handleExportDashboard} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Download size={16} /> Export System Report
        </button>
      </section>

      {exportMessage && (
        <div style={{ background: 'rgba(36, 196, 107, 0.15)', border: '1px solid var(--green)', color: 'var(--green)', padding: '12px 18px', borderRadius: '10px', fontWeight: 600, fontSize: '14px', marginTop: '16px' }}>
          {exportMessage}
        </div>
      )}

      {/* 1. Global KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '20px' }}>
        {/* Total Companies */}
        <div className="panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Building2 size={16} style={{ color: 'var(--blue)' }} />
            <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600 }}>Total Companies</span>
          </div>
          <h2 style={{ fontSize: '26px', margin: 0, fontWeight: 800, color: 'var(--blue)' }}>{uniqueCompanies.length}</h2>
          <small style={{ color: 'var(--muted)', fontSize: '11px' }}>All registered tenants</small>
        </div>

        {/* Active Companies */}
        <div className="panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <CheckCircle2 size={16} style={{ color: 'var(--green)' }} />
            <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600 }}>Active Companies</span>
          </div>
          <h2 style={{ fontSize: '26px', margin: 0, fontWeight: 800, color: 'var(--green)' }}>{activeCompanies.length}</h2>
          <small style={{ color: 'var(--green)', fontSize: '11px', fontWeight: 600 }}>of {uniqueCompanies.length} total tenants</small>
        </div>

        {/* Total Projects */}
        <div className="panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <FolderKanban size={16} style={{ color: 'var(--purple)' }} />
            <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600 }}>Total Projects</span>
          </div>
          <h2 style={{ fontSize: '26px', margin: 0, fontWeight: 800, color: 'var(--purple)' }}>{projects.length}</h2>
          <small style={{ color: 'var(--muted)', fontSize: '11px' }}>Global project portfolio</small>
        </div>

        {/* Total Users */}
        <div className="panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Users size={16} style={{ color: 'var(--orange)' }} />
            <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600 }}>Total Users</span>
          </div>
          <h2 style={{ fontSize: '26px', margin: 0, fontWeight: 800, color: 'var(--orange)' }}>{totalUsers}</h2>
          <small style={{ color: 'var(--muted)', fontSize: '11px' }}>
            {(usersList || []).length} accounts · {(workers || []).length} workers · {(teamMembers || []).length} team
          </small>
        </div>

        {/* Platform Revenue */}
        <div className="panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <DollarSign size={16} style={{ color: '#10b981' }} />
            <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600 }}>Platform Revenue</span>
          </div>
          <h2 style={{ fontSize: '26px', margin: 0, fontWeight: 800, color: '#10b981' }}>
            ${totalRev.toLocaleString()}
          </h2>
          <small style={{ color: 'var(--muted)', fontSize: '11px' }}>MRR & project budgets</small>
        </div>

        {/* Platform Health Score */}
        <div className="panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Activity size={16} style={{ color: '#22c55e' }} />
            <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600 }}>Platform Health Score</span>
          </div>
          <h2 style={{ fontSize: '26px', margin: 0, fontWeight: 800, color: '#22c55e' }}>99.98%</h2>
          <small style={{ color: '#22c55e', fontSize: '11px', fontWeight: 600 }}>Optimal performance</small>
        </div>
      </div>

      {/* 2. Tenant Table Section */}
      <div className="panel" style={{ marginTop: '20px', padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={18} style={{ color: 'var(--blue)' }} /> Enterprise Tenant Companies
          </h3>
          <div className="search-box" style={{ width: '260px' }}>
            <Search size={14} style={{ color: 'var(--muted)' }} />
            <input placeholder="Search company..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--panel-soft)', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '12px 20px', fontWeight: 600 }}>Company Tenant Name</th>
              <th style={{ padding: '12px', fontWeight: 600 }}>Company Code</th>
              <th style={{ padding: '12px', fontWeight: 600 }}>Admin Contact</th>
              <th style={{ padding: '12px 20px', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.map(c => (
              <tr key={c.id || c.name} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 20px', fontWeight: 700, color: 'var(--text)' }}>{c.name}</td>
                <td style={{ padding: '12px' }}><code style={{ background: 'var(--panel-soft)', padding: '2px 6px', borderRadius: '4px', color: 'var(--blue)', fontWeight: 700 }}>{c.code || 'SOLV-CO'}</code></td>
                <td style={{ padding: '12px', color: 'var(--muted)' }}>{c.adminName || c.adminEmail || 'Company Admin'}</td>
                <td style={{ padding: '12px 20px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '10px', background: 'rgba(34,197,94,0.12)', color: 'var(--green)', fontSize: '11px', fontWeight: 700 }}>
                    {c.status || 'Active'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}