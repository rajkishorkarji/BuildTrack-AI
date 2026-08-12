import { useState, useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { realtimeBus } from '../../services/api';
import { ShieldCheck, Search, RefreshCw, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

export default function ContractorEquipment() {
  const { equipment = [], projects = [], refresh } = useData();
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsub = realtimeBus.subscribe('SERVER_UPDATE', () => refresh && refresh());
    return () => unsub();
  }, [refresh]);

  const equipmentList = useMemo(() => {
    if (equipment.length > 0) return equipment;
    return [
      { id: 1, name: 'JCB Excavator 220X', code: 'EQ-EXC-01', projectName: projects[0]?.name || 'Site Sector A', status: 'OPERATIONAL' },
      { id: 2, name: 'Concrete Mixer Heavy Duty 500L', code: 'EQ-MIX-04', projectName: projects[0]?.name || 'Site Sector A', status: 'OPERATIONAL' },
      { id: 3, name: 'Tower Crane 10-Ton', code: 'EQ-CRN-02', projectName: projects[0]?.name || 'Site Sector A', status: 'MAINTENANCE' },
    ];
  }, [equipment, projects]);

  const filtered = equipmentList.filter(e => {
    const q = search.trim().toLowerCase();
    return !q || [e.name, e.code, e.projectName, e.status].some(v => String(v || '').toLowerCase().includes(q));
  });

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--blue)', fontWeight: 700 }}>
            <ShieldCheck size={14} /> Subcontractor Assets
          </p>
          <h1>Site Equipment & Machinery</h1>
        </div>
        <button type="button" className="secondary-button" onClick={() => refresh && refresh()}>
          <RefreshCw size={14} /> Refresh Realtime
        </button>
      </section>

      {/* Filter Row */}
      <div className="panel" style={{ marginTop: 16, padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
        <div className="search-box" style={{ flex: 1, minWidth: 220 }}>
          <Search size={15} />
          <input placeholder="Search equipment, asset code, site..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Equipment Table */}
      <div className="panel" style={{ marginTop: 14, padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--panel-soft)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                {['Equipment Name', 'Asset Code', 'Assigned Site', 'Operational Status'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => {
                const s = String(e.status || 'OPERATIONAL').toUpperCase();
                const isOp = s === 'OPERATIONAL' || s === 'AVAILABLE' || s === 'IN_USE';
                return (
                  <tr key={e.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text)' }}>{e.name}</td>
                    <td style={{ padding: 14 }}>
                      <code style={{ background: 'var(--panel-soft)', padding: '3px 7px', borderRadius: 5, fontSize: 12 }}>{e.code || `EQ-${e.id}`}</code>
                    </td>
                    <td style={{ padding: 14, color: 'var(--blue)', fontWeight: 600 }}>{e.projectName || '—'}</td>
                    <td style={{ padding: 14 }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 10,
                        background: isOp ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)',
                        color: isOp ? 'var(--green)' : 'var(--orange)', fontSize: 11, fontWeight: 700,
                      }}>
                        {isOp ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {isOp ? 'Operational' : 'Under Maintenance'}
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
