import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  Building2, CheckCircle2, FolderKanban, Users, IndianRupee, Activity, ShieldCheck, Search, Download, TrendingUp, Zap, BarChart3
} from 'lucide-react';
import { formatINR } from '../../utils/currency';

export default function SuperAdminDashboard() {
  const { companies = [], projects = [], workers = [], finances = [], usersList = [], teamMembers = [], payments = [] } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [exportMessage, setExportMessage] = useState('');

  // De-duplicate companies by ID or name
  const uniqueCompanies = [];
  const seenCompanies = new Set();
  for (const c of (companies || [])) {
    const key = c.id ? String(c.id) : c.name?.trim().toLowerCase();
    if (key && !seenCompanies.has(key)) {
      seenCompanies.add(key);
      uniqueCompanies.push(c);
    }
  }

  const activeCompanies = uniqueCompanies.filter(c => String(c.status || '').toUpperCase() === 'ACTIVE');

  // Platform Revenue represents total successful payments collected from all companies for BuildTrack AI subscriptions
  const PLAN_PRICES = { STARTER: 9999, PROFESSIONAL: 29999, ENTERPRISE: 99999 };
  const completedSubscriptionPayments = (payments || [])
    .filter(p => String(p.status || '').toUpperCase() === 'COMPLETED')
    .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

  const estimatedActiveSubscriptionRevenue = activeCompanies.reduce((sum, c) => {
    const code = String(c.plan || '').toUpperCase();
    return sum + (PLAN_PRICES[code] || 0);
  }, 0);

  const platformRevenue = completedSubscriptionPayments > 0
    ? completedSubscriptionPayments
    : estimatedActiveSubscriptionRevenue;

  const totalUsers = (usersList || []).length + (workers || []).length + (teamMembers || []).length;

  const healthScore = uniqueCompanies.length > 0
    ? `${((activeCompanies.length / uniqueCompanies.length) * 100).toFixed(1)}%`
    : '100%';

  const activeProjects = projects.filter(p => {
    const s = String(p.status || '').toUpperCase();
    return s === 'ACTIVE' || s === 'IN_PROGRESS';
  }).length;

  const filteredCompanies = uniqueCompanies.filter(c =>
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.adminName && c.adminName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.adminEmail && c.adminEmail.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleExportDashboard = () => {
    const exportedAt = new Date().toLocaleString('en-IN');

    let csv = `BUILDTRACK AI - SUPER ADMIN SYSTEM REPORT\n`;
    csv += `Exported At,${exportedAt}\n\n`;

    csv += `SYSTEM METRICS OVERVIEW\n`;
    csv += `Metric,Value\n`;
    csv += `Total Registered Companies,${uniqueCompanies.length}\n`;
    csv += `Active Tenant Companies,${activeCompanies.length}\n`;
    csv += `Total Platform Projects,${projects.length}\n`;
    csv += `Active Projects,${activeProjects}\n`;
    csv += `Total Platform Users,${totalUsers}\n`;
    csv += `Platform Revenue (INR),${platformRevenue}\n`;
    csv += `Platform Health Score,${healthScore}\n\n`;

    csv += `REGISTERED TENANT COMPANIES\n`;
    csv += `Company Name,Company Email,Company Code,Admin Name,Admin Email,Subscription Plan,Status,Subscription Status\n`;

    if (uniqueCompanies.length === 0) {
      csv += `No tenant companies registered.,,,,,,\n`;
    } else {
      uniqueCompanies.forEach((c) => {
        const name = `"${(c.name || '').replace(/"/g, '""')}"`;
        const email = `"${(c.email || '').replace(/"/g, '""')}"`;
        const code = `"${(c.code || '').replace(/"/g, '""')}"`;
        const adminName = `"${(c.adminName || '').replace(/"/g, '""')}"`;
        const adminEmail = `"${(c.adminEmail || '').replace(/"/g, '""')}"`;
        const plan = `"${(c.plan || 'Professional').replace(/"/g, '""')}"`;
        const status = `"${(c.status || 'Active').replace(/"/g, '""')}"`;
        const subStatus = `"${(c.subscriptionStatus || 'PENDING').replace(/"/g, '""')}"`;

        csv += `${name},${email},${code},${adminName},${adminEmail},${plan},${status},${subStatus}\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', url);
    downloadAnchor.setAttribute('download', `BuildTrack_SuperAdmin_System_Report_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);

    setExportMessage('System report exported to CSV successfully!');
    setTimeout(() => setExportMessage(''), 3000);
  };

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <ShieldCheck size={14} /> Dashboard
          </p>
          <h1>Super Admin Console</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, margin: '4px 0 0' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
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
        <div className="panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Building2 size={16} style={{ color: 'var(--blue)' }} />
            <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600 }}>Total Companies</span>
          </div>
          <h2 style={{ fontSize: '28px', margin: 0, fontWeight: 800, color: 'var(--blue)' }}>{uniqueCompanies.length}</h2>
          <small style={{ color: 'var(--muted)', fontSize: '11px' }}>All registered tenants</small>
        </div>

        <div className="panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <CheckCircle2 size={16} style={{ color: 'var(--green)' }} />
            <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600 }}>Active Companies</span>
          </div>
          <h2 style={{ fontSize: '28px', margin: 0, fontWeight: 800, color: 'var(--green)' }}>{activeCompanies.length}</h2>
          <small style={{ color: 'var(--green)', fontSize: '11px', fontWeight: 600 }}>of {uniqueCompanies.length} total tenants</small>
        </div>

        <div className="panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <FolderKanban size={16} style={{ color: 'var(--purple)' }} />
            <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600 }}>Total Projects</span>
          </div>
          <h2 style={{ fontSize: '28px', margin: 0, fontWeight: 800, color: 'var(--purple)' }}>{projects.length}</h2>
          <small style={{ color: 'var(--muted)', fontSize: '11px' }}>{activeProjects} active · {projects.length - activeProjects} planned/other</small>
        </div>

        <div className="panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Users size={16} style={{ color: 'var(--orange)' }} />
            <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600 }}>Total Users</span>
          </div>
          <h2 style={{ fontSize: '28px', margin: 0, fontWeight: 800, color: 'var(--orange)' }}>{totalUsers}</h2>
          <small style={{ color: 'var(--muted)', fontSize: '11px' }}>
            {(usersList || []).length} accounts · {(workers || []).length} workers · {(teamMembers || []).length} team
          </small>
        </div>

        <div className="panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <IndianRupee size={16} style={{ color: '#10b981' }} />
            <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600 }}>Platform Revenue</span>
          </div>
          <h2 style={{ fontSize: '24px', margin: 0, fontWeight: 800, color: '#10b981' }}>
            {formatINR(platformRevenue)}
          </h2>
          <small style={{ color: 'var(--muted)', fontSize: '11px' }}>Total subscription payments collected</small>
        </div>

        <div className="panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Activity size={16} style={{ color: '#22c55e' }} />
            <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600 }}>Platform Health</span>
          </div>
          <h2 style={{ fontSize: '28px', margin: 0, fontWeight: 800, color: '#22c55e' }}>{healthScore}</h2>
          <small style={{ color: '#22c55e', fontSize: '11px', fontWeight: 600 }}>Active tenant ratio</small>
        </div>
      </div>

      {/* 2. Quick Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginTop: 20 }}>
        <div className="panel" style={{ padding: '18px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Zap size={20} style={{ color: 'var(--blue)' }} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Platform Status</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--green)', marginTop: 2 }}>● Operational</div>
          </div>
        </div>
        <div className="panel" style={{ padding: '18px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <BarChart3 size={20} style={{ color: 'var(--purple)' }} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Avg Budget per Project</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginTop: 2 }}>
              {projects.length > 0 ? formatINR(projects.reduce((s, p) => s + (parseFloat(p.budget) || 0), 0) / projects.length) : '—'}
            </div>
          </div>
        </div>
        <div className="panel" style={{ padding: '18px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <TrendingUp size={20} style={{ color: '#10b981' }} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Workers per Company (avg)</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginTop: 2 }}>
              {uniqueCompanies.length > 0 ? Math.round(workers.length / uniqueCompanies.length) : 0}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Tenant Table Section */}
      <div className="panel" style={{ marginTop: '20px', padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', gap: 12, flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={18} style={{ color: 'var(--blue)' }} /> Enterprise Tenant Companies
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="search-box" style={{ width: '260px' }}>
              <Search size={14} style={{ color: 'var(--muted)' }} />
              <input placeholder="Search company, admin..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {filteredCompanies.length} of {uniqueCompanies.length}
            </span>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 700, borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--panel-soft)', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Company Tenant Name</th>
                <th style={{ padding: '12px', fontWeight: 600 }}>Company Code</th>
                <th style={{ padding: '12px', fontWeight: 600 }}>Admin Contact</th>
                <th style={{ padding: '12px', fontWeight: 600 }}>Plan</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)' }}>
                    No tenant companies found.
                  </td>
                </tr>
              ) : (
                filteredCompanies.map(c => (
                  <tr key={c.id || c.name} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text)' }}>
                      <div>{c.name}</div>
                      {c.email && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{c.email}</div>}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <code style={{ background: 'var(--panel-soft)', padding: '3px 7px', borderRadius: '5px', color: 'var(--blue)', fontWeight: 700, fontSize: 12 }}>
                        {c.code || 'CO-CODE'}
                      </code>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--muted)' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text)' }}>{c.adminName || 'Pending'}</div>
                      {c.adminEmail && <div style={{ fontSize: 11, marginTop: 2 }}>{c.adminEmail}</div>}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: 8, background: 'rgba(37,99,235,0.1)', color: 'var(--blue)', fontWeight: 700, fontSize: 11 }}>
                        {c.plan || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '10px',
                        background: String(c.status || '').toUpperCase() === 'ACTIVE' ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)',
                        color: String(c.status || '').toUpperCase() === 'ACTIVE' ? 'var(--green)' : 'var(--orange)',
                        fontSize: '11px',
                        fontWeight: 700
                      }}>
                        {c.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}