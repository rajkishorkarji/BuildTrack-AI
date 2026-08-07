import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { FolderKanban, Search, Building2, UserCheck, ShieldCheck } from 'lucide-react';

export default function SuperAdminProjects() {
  const { projects = [] } = useData();
  const [search, setSearch] = useState('');

  const filtered = projects.filter(p =>
    (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.companyName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <FolderKanban size={14} /> Projects
          </p>
        </div>
      </section>

      <div className="panel" style={{ marginTop: '20px', padding: '16px 20px' }}>
        <div className="search-box" style={{ width: '340px' }}>
          <Search size={14} style={{ color: 'var(--muted)' }} />
          <input placeholder="Search projects by name or tenant..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="panel" style={{ marginTop: '16px', padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--panel-soft)', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Project Site</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Tenant Company</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Assigned PM</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Budget</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Progress</th>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FolderKanban size={16} style={{ color: 'var(--blue)' }} />
                    {p.name}
                  </div>
                </td>
                <td style={{ padding: '14px', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building2 size={14} style={{ color: 'var(--muted)' }} />
                    {p.companyName || 'Solviontech Infrastructure Ltd'}
                  </div>
                </td>
                <td style={{ padding: '14px', color: 'var(--muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <UserCheck size={14} style={{ color: 'var(--blue)' }} />
                    {p.pmName || 'Rajesh Verma'}
                  </div>
                </td>
                <td style={{ padding: '14px', fontWeight: 700 }}>${(parseFloat(p.budget) || 0).toLocaleString()}</td>
                <td style={{ padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '120px' }}>
                    <div style={{ flex: 1, height: '6px', background: 'var(--panel-soft)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${p.progress || 0}%`, height: '100%', background: 'var(--blue)' }} />
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)' }}>{p.progress || 0}%</span>
                  </div>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '10px', background: 'rgba(34,197,94,0.12)', color: 'var(--green)', fontSize: '11px', fontWeight: 700 }}>
                    {p.status || 'Active'}
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
