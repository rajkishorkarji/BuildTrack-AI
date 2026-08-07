import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { CheckSquare, Search, Clock } from 'lucide-react';

export default function ContractorTasks() {
  const { tasks = [] } = useData();
  const [search, setSearch] = useState('');

  const filtered = tasks.filter(t => (t.title || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <CheckSquare size={14} /> Tasks
          </p>
        </div>
      </section>

      <div className="panel" style={{ marginTop: '20px', padding: '16px 20px' }}>
        <div className="search-box" style={{ width: '300px' }}>
          <Search size={14} style={{ color: 'var(--muted)' }} />
          <input placeholder="Search assigned work orders..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="panel" style={{ marginTop: '16px', padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--panel-soft)', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Work Order Description</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Project Site</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Completion Progress</th>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {(filtered.length > 0 ? filtered : tasks).map(t => (
              <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckSquare size={16} style={{ color: 'var(--blue)' }} />
                    {t.title}
                  </div>
                </td>
                <td style={{ padding: '14px', color: 'var(--muted)' }}>{t.project || 'Metro Tower Site A'}</td>
                <td style={{ padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '120px' }}>
                    <div style={{ flex: 1, height: '6px', background: 'var(--panel-soft)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${t.progress || 75}%`, height: '100%', background: 'var(--blue)' }} />
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--blue)', fontSize: '12px' }}>{t.progress || 75}%</span>
                  </div>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '10px', background: 'rgba(37,99,235,0.12)', color: 'var(--blue)', fontSize: '11px', fontWeight: 700 }}>
                    {t.status || 'In Progress'}
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
