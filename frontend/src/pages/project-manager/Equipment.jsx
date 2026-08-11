import { useEffect, useState } from 'react';
import { ShieldCheck, Wrench, AlertTriangle, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import equipmentService from '../../services/equipmentService';

const STATUS_META = {
  OPERATIONAL: { color: 'var(--green)', bg: 'rgba(34,197,94,0.12)', label: 'Operational' },
  IN_MAINTENANCE: { color: 'var(--orange)', bg: 'rgba(245,158,11,0.12)', label: 'In Maintenance' },
  IDLE: { color: 'var(--muted)', bg: 'var(--panel-soft)', label: 'Idle' },
  DECOMMISSIONED: { color: 'var(--red)', bg: 'rgba(239,68,68,0.12)', label: 'Decommissioned' },
};

function getStatusMeta(status) {
  const key = String(status || '').toUpperCase().replace(/\s/g, '_');
  return STATUS_META[key] || { color: 'var(--muted)', bg: 'var(--panel-soft)', label: status || '—' };
}

export default function PMEquipment() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await equipmentService.list();
      setEquipment(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Unable to load equipment.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = equipment.filter(e =>
    [e.name, e.category, e.projectName, e.status, e.serialNumber].some(v =>
      String(v || '').toLowerCase().includes(search.toLowerCase())
    )
  );

  const operational = equipment.filter(e => String(e.status || '').toUpperCase() === 'OPERATIONAL').length;
  const inMaintenance = equipment.filter(e => String(e.status || '').toUpperCase() === 'IN_MAINTENANCE').length;

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--blue)', fontWeight: 700 }}>
            <ShieldCheck size={14} /> Equipment
          </p>
        </div>
        <button className="secondary-button" onClick={load} disabled={loading}>
          <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} /> Refresh
        </button>
      </section>

      {error && (
        <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, color: 'var(--red)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, marginTop: 18 }}>
        {[
          { label: 'Total Equipment', value: equipment.length, color: 'var(--blue)' },
          { label: 'Operational', value: operational, color: 'var(--green)' },
          { label: 'In Maintenance', value: inMaintenance, color: 'var(--orange)' },
          { label: 'Idle / Other', value: equipment.length - operational - inMaintenance, color: 'var(--muted)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="panel" style={{ padding: 18 }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>{label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color, marginTop: 4 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="panel" style={{ marginTop: 16, padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
        <input
          placeholder="Search equipment, category, project..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 }}
        />
        <span style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{filtered.length} items</span>
      </div>

      {/* Table */}
      <div className="panel" style={{ marginTop: 14, padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--panel-soft)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                {['Equipment', 'Category', 'Project', 'Assigned To', 'Status', 'Next Service'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Loading equipment…</td></tr>}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
                  <ShieldCheck size={32} style={{ display: 'block', margin: '0 auto 10px', opacity: 0.4 }} />
                  No equipment assigned to your projects.
                </td></tr>
              )}
              {!loading && filtered.map(e => {
                const meta = getStatusMeta(e.status);
                return (
                  <tr key={e.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Wrench size={15} style={{ color: 'var(--blue)', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: 700 }}>{e.name}</div>
                          {e.serialNumber && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>S/N: {e.serialNumber}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: 14, color: 'var(--muted)' }}>{e.category || '—'}</td>
                    <td style={{ padding: 14, color: 'var(--blue)', fontWeight: 600 }}>{e.projectName || '—'}</td>
                    <td style={{ padding: 14, color: 'var(--muted)' }}>{e.assignedUserName || '—'}</td>
                    <td style={{ padding: 14 }}>
                      <span style={{ padding: '4px 10px', borderRadius: 8, background: meta.bg, color: meta.color, fontSize: 11, fontWeight: 700 }}>
                        {meta.label}
                      </span>
                    </td>
                    <td style={{ padding: 14, color: e.nextServiceDue ? 'var(--orange)' : 'var(--muted)' }}>
                      {e.nextServiceDue || '—'}
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
