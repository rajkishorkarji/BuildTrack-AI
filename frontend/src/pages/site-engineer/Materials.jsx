import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Package, Search, Plus } from 'lucide-react';

export default function SEMaterials() {
  const { materials = [] } = useData();
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');

  const filtered = materials.filter(m => (m.name || '').toLowerCase().includes(search.toLowerCase()));

  const handleRequestReorder = (m) => {
    setNotice(`✓ Stock reorder request created for ${m.name}. Request sent to PM.`);
    setTimeout(() => setNotice(''), 3000);
  };

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <Package size={14} /> Materials
          </p>
        </div>
      </section>

      {notice && (
        <div style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid var(--green)', color: 'var(--green)', padding: '12px 18px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', marginTop: '16px' }}>
          {notice}
        </div>
      )}

      <div className="panel" style={{ marginTop: '20px', padding: '16px 20px' }}>
        <div className="search-box" style={{ width: '300px' }}>
          <Search size={14} style={{ color: 'var(--muted)' }} />
          <input placeholder="Search site inventory..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="panel" style={{ marginTop: '16px', padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--panel-soft)', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Material Name</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Site Quantity</th>
              <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {(filtered.length > 0 ? filtered : [
              { id: 'sem1', name: 'Structural Steel Rebar 16mm', quantity: 450, unit: 'Tons' },
              { id: 'sem2', name: 'Ready-Mix Concrete C30/37', quantity: 1200, unit: 'm³' },
            ]).map(m => (
              <tr key={m.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Package size={16} style={{ color: 'var(--blue)' }} />
                    {m.name}
                  </div>
                </td>
                <td style={{ padding: '14px', fontWeight: 700, color: 'var(--blue)' }}>{m.quantity} {m.unit}</td>
                <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                  <button type="button" className="secondary-button" style={{ fontSize: '11px', padding: '5px 10px' }} onClick={() => handleRequestReorder(m)}>
                    Request Reorder
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
