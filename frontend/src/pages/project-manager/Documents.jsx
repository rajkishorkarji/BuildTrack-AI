import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { FileText, Download, Plus, Search, FolderKanban } from 'lucide-react';

export default function PMDocuments() {
  const { documents = [], projects = [] } = useData();
  const [search, setSearch] = useState('');

  const filtered = documents.filter(d => (d.name || d.title || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <FileText size={14} /> Documents
          </p>
        </div>
      </section>

      <div className="panel" style={{ marginTop: '20px', padding: '16px 20px' }}>
        <div className="search-box" style={{ width: '300px' }}>
          <Search size={14} style={{ color: 'var(--muted)' }} />
          <input placeholder="Search CAD drawings, compliance docs..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="panel" style={{ marginTop: '16px', padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--panel-soft)', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Document Title</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Category</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Uploaded Date</th>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {(filtered.length > 0 ? filtered : [
              { id: 'doc1', name: 'Structural Rebar Blueprints Rev 3.2', category: 'CAD Drawings', date: '2026-08-01', status: 'Approved' },
              { id: 'doc2', name: 'Metro Line Environmental Permit', category: 'Compliance', date: '2026-07-25', status: 'Active' },
            ]).map(doc => (
              <tr key={doc.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={16} style={{ color: 'var(--blue)' }} />
                    {doc.name || doc.title}
                  </div>
                </td>
                <td style={{ padding: '14px', color: 'var(--purple)', fontWeight: 600 }}>{doc.category || 'General'}</td>
                <td style={{ padding: '14px', color: 'var(--muted)' }}>{doc.date || 'Today'}</td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '10px', background: 'rgba(34,197,94,0.12)', color: 'var(--green)', fontSize: '11px', fontWeight: 700 }}>
                    {doc.status || 'Active'}
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
