import { useState, useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import api, { realtimeBus } from '../../services/api';
import { Package, Search, RefreshCw, AlertTriangle, CheckCircle2, Plus, X } from 'lucide-react';

export default function ContractorMaterials() {
  const { materials = [], projects = [], refresh } = useData();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    projectId: '',
    name: '',
    quantity: '',
    unit: 'bags',
    reorderLevel: '10',
  });

  useEffect(() => {
    const unsub = realtimeBus.subscribe('SERVER_UPDATE', () => refresh && refresh());
    return () => unsub();
  }, [refresh]);

  const handleCreateMaterial = async (e) => {
    e.preventDefault();
    if (!form.projectId || !form.name || !form.quantity) return;
    setBusy(true);
    setError('');
    try {
      await api.post('/materials', {
        project: { id: Number(form.projectId) },
        name: form.name.trim(),
        quantity: Number(form.quantity),
        unit: form.unit.trim(),
        reorderLevel: Number(form.reorderLevel || 10),
      });
      setShowModal(false);
      setSuccess('Material logged successfully! Added to real-time inventory.');
      setForm({ projectId: '', name: '', quantity: '', unit: 'bags', reorderLevel: '10' });
      setTimeout(() => setSuccess(''), 3000);
      if (refresh) refresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to log material.');
    } finally {
      setBusy(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (materials || []).filter(m =>
      !q || [m.name, m.projectName, m.unit, m.status].some(v => String(v || '').toLowerCase().includes(q))
    );
  }, [materials, search]);

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--blue)', fontWeight: 700 }}>
            <Package size={14} /> Contractor Materials
          </p>
          <h1>Site Materials & Inventory</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="secondary-button" onClick={() => refresh && refresh()}>
            <RefreshCw size={14} /> Refresh Realtime
          </button>
          <button type="button" className="primary-button" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Log Site Material
          </button>
        </div>
      </section>

      {success && (
        <div style={{ marginTop: 14, padding: '12px 16px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, color: 'var(--green)', fontSize: 13, fontWeight: 600 }}>
          {success}
        </div>
      )}

      {error && (
        <div style={{ marginTop: 14, padding: '12px 16px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, color: 'var(--red)', fontSize: 13, fontWeight: 600 }}>
          {error}
        </div>
      )}

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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
                    <Package size={32} style={{ display: 'block', margin: '0 auto 10px', color: 'var(--muted)' }} />
                    <div style={{ fontWeight: 700, color: 'var(--text)' }}>No site materials recorded yet</div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>Materials logged for project sites will appear here in real time.</div>
                  </td>
                </tr>
              ) : (
                filtered.map(m => {
                  const isLow = String(m.status || '').toUpperCase() === 'LOW_STOCK' || Number(m.quantity || 0) <= Number(m.minRequired || m.reorderLevel || 10);
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
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Material Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="panel" style={{ width: '100%', maxWidth: 480, padding: 24, borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Log Site Material Inventory</h2>
              <button type="button" className="secondary-button" onClick={() => setShowModal(false)} style={{ padding: 6 }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateMaterial} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Project Site *</label>
                <select
                  value={form.projectId}
                  onChange={e => setForm({ ...form, projectId: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 }}
                >
                  <option value="">Select Project Site</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.code || 'SITE'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Material Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Portland Cement (50kg bags)"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Stock Quantity *</label>
                  <input
                    type="number"
                    placeholder="e.g. 500"
                    value={form.quantity}
                    onChange={e => setForm({ ...form, quantity: e.target.value })}
                    required
                    min="0"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. bags, tons, cu.m, pcs"
                    value={form.unit}
                    onChange={e => setForm({ ...form, unit: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Reorder Threshold Level</label>
                <input
                  type="number"
                  placeholder="e.g. 100"
                  value={form.reorderLevel}
                  onChange={e => setForm({ ...form, reorderLevel: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" className="secondary-button" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="primary-button" disabled={busy}>
                  {busy ? 'Logging Material...' : 'Log Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
