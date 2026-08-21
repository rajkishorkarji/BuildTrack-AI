import { useEffect, useState, useMemo } from 'react';
import { Wrench, ShieldCheck, CheckCircle2, Clock, Search, RefreshCw } from 'lucide-react';
import equipmentService from '../../services/equipmentService';
import { realtimeBus } from '../../services/api';

export default function WorkerEquipment() {
  const [equipment, setEquipment] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await equipmentService.list();
      setEquipment(Array.isArray(data) ? data : []);
    } catch (e) {
      setEquipment([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const unsub = realtimeBus.subscribe('SERVER_UPDATE', () => load());
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    return equipment.filter(e => {
      const q = search.trim().toLowerCase();
      return !q || [e.name, e.category, e.projectName, e.taskTitle, e.status, e.serialNumber]
        .some(v => String(v || '').toLowerCase().includes(q));
    });
  }, [equipment, search]);

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--blue)', fontWeight: 700 }}>
            <Wrench size={14} /> Assigned Assets
          </p>
          
        </div>
        <button type="button" className="secondary-button" onClick={load} disabled={loading}>
          <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} /> Refresh
        </button>
      </section>

      {/* Filter Row */}
      <div className="panel" style={{ marginTop: 16, padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
        <div className="search-box" style={{ flex: 1, minWidth: 220 }}>
          <Search size={15} />
          <input placeholder="Search assigned equipment, category, task..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16, padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 600, borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--panel-soft)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                {['Equipment Name', 'Category', 'Project Site', 'Assigned Task', 'Status'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} style={{ padding: 30, textAlign: 'center', color: 'var(--muted)' }}>Loading assigned equipment…</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
                    <ShieldCheck size={32} style={{ display: 'block', margin: '0 auto 10px', opacity: 0.4 }} />
                    No equipment assets assigned to you.
                  </td>
                </tr>
              )}
              {!loading && filtered.map(e => {
                const s = String(e.status || 'OPERATIONAL').toUpperCase();
                const isOp = s === 'OPERATIONAL' || s === 'AVAILABLE' || s === 'IN_USE';
                return (
                  <tr key={e.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text)' }}>
                      <Wrench size={14} style={{ marginRight: 8, color: 'var(--blue)', verticalAlign: 'middle' }} />
                      {e.name}
                    </td>
                    <td style={{ padding: 14, color: 'var(--muted)' }}>{e.category || '—'}</td>
                    <td style={{ padding: 14, color: 'var(--blue)', fontWeight: 600 }}>{e.projectName || e.project?.name || '—'}</td>
                    <td style={{ padding: 14, color: e.taskTitle ? 'var(--text)' : 'var(--muted)' }}>{e.taskTitle || 'General Site Work'}</td>
                    <td style={{ padding: 14 }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 10,
                        background: isOp ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)',
                        color: isOp ? 'var(--green)' : 'var(--orange)', fontSize: 11, fontWeight: 700,
                      }}>
                        {isOp ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {isOp ? 'Operational' : 'In Service'}
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
