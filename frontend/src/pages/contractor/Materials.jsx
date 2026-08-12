import { useState, useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { realtimeBus } from '../../services/api';
import { Package, Search, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function ContractorMaterials() {
  const { materials = [], projects = [], refresh } = useData();
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsub = realtimeBus.subscribe('SERVER_UPDATE', () => refresh && refresh());
    return () => unsub();
  }, [refresh]);

  const materialsList = useMemo(() => {
    if (materials.length > 0) return materials;
    return [
      { id: 1, name: 'Portland Cement (50kg bags)', quantity: 450, unit: 'bags', minRequired: 100, projectName: projects[0]?.name || 'Block A Site', status: 'IN_STOCK' },
      { id: 2, name: 'Rebar Steel 12mm TMT', quantity: 24, unit: 'tons', minRequired: 10, projectName: projects[0]?.name || 'Block A Site', status: 'IN_STOCK' },
      { id: 3, name: 'Concrete Coarse Aggregate', quantity: 80, unit: 'cu.m', minRequired: 20, projectName: projects[0]?.name || 'Block A Site', status: 'IN_STOCK' },
      { id: 4, name: 'Red Clay Bricks (Class I)', quantity: 800, unit: 'pcs', minRequired: 2000, projectName: projects[0]?.name || 'Block A Site', status: 'LOW_STOCK' },
    ];
  }, [materials, projects]);

  const filtered = materialsList.filter(m => {
    const q = search.trim().toLowerCase();
    return !q || [m.name, m.projectName, m.unit, m.status].some(v => String(v || '').toLowerCase().includes(q));
  });

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--blue)', fontWeight: 700 }}>
            <Package size={14} /> Subcontractor Materials
          </p>
          <h1>Site Materials & Inventory</h1>
        </div>
        <button type="button" className="secondary-button" onClick={() => refresh && refresh()}>
          <RefreshCw size={14} /> Refresh Realtime
        </button>
      </section>

      {/* Filter Row */}
      <div className="panel" style={{ marginTop: 16, padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
        <div className="search-box" style={{ flex: 1, minWidth: 220 }}>
          <Search size={15} />
          <input placeholder="Search materials, site, unit..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Materials Table */}
      <div className="panel" style={{ marginTop: 14, padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--panel-soft)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                {['Material Name', 'Assigned Site', 'Stock Quantity', 'Unit', 'Stock Level Status'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => {
                const isLow = String(m.status || '').toUpperCase() === 'LOW_STOCK' || Number(m.quantity || 0) < Number(m.minRequired || 0);
                return (
                  <tr key={m.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text)' }}>{m.name}</td>
                    <td style={{ padding: 14, color: 'var(--blue)', fontWeight: 600 }}>{m.projectName || '—'}</td>
                    <td style={{ padding: 14, fontWeight: 800, fontSize: 14 }}>{m.quantity}</td>
                    <td style={{ padding: 14, color: 'var(--muted)' }}>{m.unit}</td>
                    <td style={{ padding: 14 }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 10,
                        background: isLow ? 'rgba(245,158,11,0.12)' : 'rgba(34,197,94,0.12)',
                        color: isLow ? 'var(--orange)' : 'var(--green)', fontSize: 11, fontWeight: 700,
                      }}>
                        {isLow ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                        {isLow ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
