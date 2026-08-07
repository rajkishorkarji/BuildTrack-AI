import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Download, Search, Gauge } from 'lucide-react';

export default function ProjectManagerReports() {
  const { projects = [] } = useData();
  const [search, setSearch] = useState('');

  const handleExportReport = () => {
    const headers = ['Project Name', 'Site Location', 'Assigned PM', 'Budget ($)', 'Progress (%)', 'Status'];
    const rows = projects.map(p => [
      `"${p.name || ''}"`,
      `"${p.location || 'Site Location'}"`,
      `"${p.pmName || 'Unassigned'}"`,
      `"${parseFloat(p.budget || 0)}"`,
      `"${p.progress || 0}"`,
      `"${p.status || 'Active'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `project_performance_reports_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredProjects = projects.filter(p =>
    (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.location || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.pmName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <Gauge size={14} /> Reports
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="primary-button"
            onClick={handleExportReport}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Download size={16} /> Export Report
          </button>
        </div>
      </section>

      {/* ── Search Bar Toolbar ── */}
      <div className="panel" style={{ marginTop: '20px', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="search-box" style={{ width: '340px' }}>
          <Search size={16} style={{ color: 'var(--muted)' }} />
          <input
            placeholder="Search report records..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>
          Project Performance Reports Table
        </span>
      </div>

      {/* ── Reports Table ── */}
      <div className="panel" style={{ marginTop: '16px', padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--panel-soft)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Project Name</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Site Location</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Assigned PM</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Budget</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Progress</th>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
                  No performance report records found.
                </td>
              </tr>
            ) : (
              filteredProjects.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text)' }}>{p.name}</td>
                  <td style={{ padding: '14px', color: 'var(--muted)' }}>{p.location || 'Site Location'}</td>
                  <td style={{ padding: '14px', fontWeight: 600, color: p.pmName ? 'var(--blue)' : 'var(--orange)' }}>{p.pmName || 'Unassigned'}</td>
                  <td style={{ padding: '14px', fontWeight: 700 }}>${(parseFloat(p.budget) || 0).toLocaleString()}</td>
                  <td style={{ padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '130px' }}>
                      <div style={{ flex: 1, height: '6px', background: 'var(--panel-soft)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${p.progress || 0}%`, height: '100%', background: 'var(--blue)' }} />
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--blue)', fontSize: '12px' }}>{p.progress || 0}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '10px', background: 'rgba(34,197,94,0.12)', color: 'var(--green)', fontSize: '11px', fontWeight: 700 }}>
                      {p.status || 'Active'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
