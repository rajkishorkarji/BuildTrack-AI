import { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext';
import { HardHat, Search, Building2, UserCheck, Download } from 'lucide-react';

const STATUS_META = {
  ACTIVE: { label: 'Active', color: 'var(--green)', bg: 'rgba(34,197,94,0.12)' },
  INACTIVE: { label: 'Inactive', color: 'var(--muted)', bg: 'var(--panel-soft)' },
  ON_LEAVE: { label: 'On Leave', color: 'var(--orange)', bg: 'rgba(245,158,11,0.12)' },
  TERMINATED: { label: 'Terminated', color: 'var(--red)', bg: 'rgba(239,68,68,0.12)' },
};

function getStatusMeta(status) {
  const key = String(status || 'ACTIVE').toUpperCase().replace(/\s+/g, '_');
  return STATUS_META[key] || { label: status || 'Active', color: 'var(--green)', bg: 'rgba(34,197,94,0.12)' };
}

export default function SuperAdminWorkforce() {
  const { workers = [], usersList = [], companies = [] } = useData();
  const [search, setSearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const companyAdminMap = useMemo(() => {
    const map = new Map();
    (usersList || []).forEach((u) => {
      const role = String(u.role || '').toUpperCase();
      if (role === 'COMPANY_ADMIN') {
        const compId = u.companyId ? String(u.companyId) : null;
        const compName = u.companyName ? String(u.companyName).trim().toLowerCase() : null;
        const adminName = u.fullName || u.name || u.email;

        if (compId) map.set(compId, adminName);
        if (compName) map.set(compName, adminName);
      }
    });
    return map;
  }, [usersList]);

  const getCompanyAdminName = (w) => {
    if (w.companyAdminName && w.companyAdminName !== '—') return w.companyAdminName;
    const compId = w.companyId ? String(w.companyId) : null;
    const compName = w.companyName ? String(w.companyName).trim().toLowerCase() : null;
    return (compId ? companyAdminMap.get(compId) : null) || (compName ? companyAdminMap.get(compName) : null) || '—';
  };

  const filtered = workers.filter(w => {
    const adminName = getCompanyAdminName(w);
    const matchSearch =
      (w.fullName || w.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (w.role || '').toLowerCase().includes(search.toLowerCase()) ||
      (w.skillTrade || w.skill || '').toLowerCase().includes(search.toLowerCase()) ||
      (adminName || '').toLowerCase().includes(search.toLowerCase()) ||
      (w.projectName || '').toLowerCase().includes(search.toLowerCase());
    const matchCompany = selectedCompany === 'ALL' || w.companyName === selectedCompany;
    const normalStatus = String(w.status || 'Active').toUpperCase().replace(/\s+/g, '_');
    const matchStatus = statusFilter === 'ALL' || normalStatus === statusFilter;
    return matchSearch && matchCompany && matchStatus;
  });

  const activeCount = workers.filter(w => {
    const s = String(w.status || 'Active').toUpperCase();
    return s === 'ACTIVE';
  }).length;

  const exportCsv = () => {
    const header = 'Name,Role,Skill,Company Admin,Project,Company,Status\n';
    const rows = filtered.map(w => [
      w.fullName || w.name || '',
      w.role || '',
      w.skillTrade || w.skill || '',
      getCompanyAdminName(w),
      w.projectName || '',
      w.companyName || '',
      w.status || 'Active',
    ].join(',')).join('\n');
    const a = document.createElement('a');
    a.href = `data:text/csv;charset=utf-8,${encodeURIComponent(header + rows)}`;
    a.download = 'workforce.csv';
    a.click();
  };

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <HardHat size={14} /> Workforce
          </p>
          <h1>Global Workforce</h1>
        </div>
        <button type="button" className="secondary-button" onClick={exportCsv}>
          <Download size={15} /> Export CSV
        </button>
      </section>

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '16px', marginTop: '20px' }}>
        {
          [
            { label: 'Total Registered Workers', value: workers.length, color: 'var(--blue)', sub: 'Global labor pool' },
            { label: 'Active Field Labor', value: activeCount, color: 'var(--green)', sub: 'Currently deployed' },
            { label: 'Tenant Companies', value: companies.length, color: 'var(--purple)', sub: 'Enterprise tenants' },
            { label: 'Total Platform Users', value: (usersList || []).length, color: 'var(--orange)', sub: 'System accounts' },
          ].map(({ label, value, color, sub }) => (
            <div key={label} className="panel" style={{ padding: '18px' }}>
              <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>{label}</span>
              <h2 style={{ fontSize: '26px', color, margin: '4px 0 2px', fontWeight: 800 }}>{value}</h2>
              <small style={{ color: 'var(--muted)', fontSize: '11px' }}>{sub}</small>
            </div>
          ))
        }
      </div>

      {/* Search + Filter Toolbar */}
      <div className="panel" style={{ marginTop: '20px', padding: '14px 20px', display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="search-box" style={{ flex: 1, minWidth: 220 }}>
          <Search size={14} style={{ color: 'var(--muted)' }} />
          <input placeholder="Search worker by name, role, skill, site..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select
          value={selectedCompany}
          onChange={e => setSelectedCompany(e.target.value)}
          style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: '13px', fontWeight: 600 }}
        >
          <option value="ALL">All Tenant Companies</option>
          {companies.map(c => (
            <option key={c.id || c.name} value={c.name}>{c.name}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: '13px', fontWeight: 600 }}
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="ON_LEAVE">On Leave</option>
          <option value="TERMINATED">Terminated</option>
        </select>
        <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
          {filtered.length} of {workers.length} workers
        </span>
      </div>

      {/* Table */}
      <div className="panel" style={{ marginTop: '16px', padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 780, borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--panel-soft)', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                {['Worker Name & Skill', 'Company Tenant', 'Company Admin', 'Assigned Project Site', 'Status'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 40, textAlign: 'center' }}>
                    <HardHat size={32} style={{ color: 'var(--muted)', display: 'block', margin: '0 auto 10px' }} />
                    <div style={{ color: 'var(--text)', fontWeight: 700 }}>No workers found</div>
                    <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4 }}>Try adjusting your search or filter.</div>
                  </td>
                </tr>
              ) : (
                filtered.map(w => {
                  const meta = getStatusMeta(w.status);
                  const adminName = getCompanyAdminName(w);
                  return (
                    <tr key={w.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <HardHat size={16} style={{ color: 'var(--blue)' }} />
                          </div>
                          <div>
                            <div>{w.fullName || w.name}</div>
                            <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 500 }}>{w.skillTrade || w.role || 'General Mason'}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Building2 size={13} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                          <span style={{ fontWeight: 600, color: 'var(--blue)' }}>{w.companyName || '—'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 600 }}>{adminName}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--muted)' }}>{w.projectName || '—'}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '10px', background: meta.bg, color: meta.color, fontSize: '11px', fontWeight: 700 }}>
                          {meta.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
