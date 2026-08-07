import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { FolderKanban, Search, Eye, Clock, BarChart3 } from 'lucide-react';

export default function PMProjects() {
  const { projects = [] } = useData();
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  // Filter projects managed by this PM
  const managedProjects = projects.filter(p => {
    const isPM = !p.pmName || (p.pmName || '').toLowerCase().includes((user?.fullName || '').toLowerCase());
    const matchSearch = (p.name || '').toLowerCase().includes(search.toLowerCase());
    return isPM && matchSearch;
  });

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
        <div className="search-box" style={{ width: '320px' }}>
          <Search size={14} style={{ color: 'var(--muted)' }} />
          <input placeholder="Search managed site names..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="panel" style={{ marginTop: '16px', padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--panel-soft)', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Project Site</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Location</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Budget Allocated</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Progress</th>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {(managedProjects.length > 0 ? managedProjects : projects).map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FolderKanban size={16} style={{ color: 'var(--blue)' }} />
                    {p.name}
                  </div>
                </td>
                <td style={{ padding: '14px', color: 'var(--muted)' }}>{p.location || 'Metro Zone'}</td>
                <td style={{ padding: '14px', fontWeight: 700 }}>${(parseFloat(p.budget) || 0).toLocaleString()}</td>
                <td style={{ padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '120px' }}>
                    <div style={{ flex: 1, height: '6px', background: 'var(--panel-soft)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${p.progress || 0}%`, height: '100%', background: 'var(--blue)' }} />
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--blue)', fontSize: '12px' }}>{p.progress || 0}%</span>
                  </div>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '10px', background: 'rgba(37,99,235,0.12)', color: 'var(--blue)', fontSize: '11px', fontWeight: 700 }}>
                    {p.status || 'In Progress'}
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
