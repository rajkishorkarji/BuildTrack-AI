import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { HardHat, Search, Building2, UserCheck, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function SuperAdminWorkforce() {
  const { workers = [], usersList = [], companies = [] } = useData();
  const [search, setSearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('ALL');

  // Filter global workforce
  const filtered = workers.filter(w => {
    const matchSearch =
      (w.fullName || w.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (w.role || '').toLowerCase().includes(search.toLowerCase()) ||
      (w.contractorName || '').toLowerCase().includes(search.toLowerCase()) ||
      (w.projectName || '').toLowerCase().includes(search.toLowerCase());
    
    const matchCompany = selectedCompany === 'ALL' || w.companyName === selectedCompany;
    return matchSearch && matchCompany;
  });

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <HardHat size={14} /> Workforce
          </p>
        </div>
      </section>

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '20px' }}>
        <div className="panel" style={{ padding: '18px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Total Registered Workers</span>
          <h2 style={{ fontSize: '26px', color: 'var(--blue)', margin: '4px 0 0 0', fontWeight: 800 }}>{workers.length}</h2>
          <small style={{ color: 'var(--muted)', fontSize: '11px' }}>Global labor pool</small>
        </div>
        <div className="panel" style={{ padding: '18px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Active Field Labor</span>
          <h2 style={{ fontSize: '26px', color: 'var(--green)', margin: '4px 0 0 0', fontWeight: 800 }}>
            {workers.filter(w => (w.status || 'Active') === 'Active').length}
          </h2>
          <small style={{ color: 'var(--green)', fontSize: '11px', fontWeight: 600 }}>Currently deployed</small>
        </div>
        <div className="panel" style={{ padding: '18px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Tenant Companies</span>
          <h2 style={{ fontSize: '26px', color: 'var(--purple)', margin: '4px 0 0 0', fontWeight: 800 }}>{companies.length}</h2>
          <small style={{ color: 'var(--muted)', fontSize: '11px' }}>Enterprise tenants</small>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="panel" style={{ marginTop: '20px', padding: '16px 20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div className="search-box" style={{ width: '320px' }}>
          <Search size={14} style={{ color: 'var(--muted)' }} />
          <input placeholder="Search worker by name, role, site..." value={search} onChange={e => setSearch(e.target.value)} />
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
      </div>

      {/* Table */}
      <div className="panel" style={{ marginTop: '16px', padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--panel-soft)', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Worker Name & Skill</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Subcontractor Entity</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Assigned Project Site</th>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(w => (
              <tr key={w.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HardHat size={16} style={{ color: 'var(--blue)' }} />
                    <div>
                      <div>{w.fullName || w.name}</div>
                      <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 500 }}>{w.role || 'General Mason'}</span>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px', fontWeight: 600 }}>{w.contractorName || 'BuildCorp Contractors'}</td>
                <td style={{ padding: '14px', color: 'var(--muted)' }}>{w.projectName || 'Metro Tower Site A'}</td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '10px', background: 'rgba(34,197,94,0.12)', color: 'var(--green)', fontSize: '11px', fontWeight: 700 }}>
                    {w.status || 'Active'}
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
