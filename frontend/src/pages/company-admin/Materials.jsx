import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Package, Plus, Search, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function CompanyAdminMaterials() {
  const { materials = [], addMaterial } = useData();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', quantity: '', unit: 'Tons', site: 'Metro Site', cost: '' });

  const filtered = materials.filter(m => (m.name || '').toLowerCase().includes(search.toLowerCase()));

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.name || !form.quantity) return;
    if (addMaterial) {
      addMaterial({
        name: form.name,
        quantity: parseFloat(form.quantity) || 0,
        unit: form.unit,
        site: form.site,
        cost: parseFloat(form.cost) || 0,
      });
    }
    setShowAdd(false);
    setForm({ name: '', quantity: '', unit: 'Tons', site: 'Metro Site', cost: '' });
  };

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <Package size={14} /> Materials
          </p>
        </div>
        <button type="button" className="primary-button" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add Material Stock
        </button>
      </section>

      <div className="panel" style={{ marginTop: '20px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between' }}>
        <div className="search-box" style={{ width: '280px' }}>
          <Search size={14} style={{ color: 'var(--muted)' }} />
          <input placeholder="Search material stock..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="panel" style={{ marginTop: '16px', padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--panel-soft)', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Material Item</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Quantity Stock</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Deployed Site</th>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Estimated Valuation</th>
            </tr>
          </thead>
          <tbody>
            {(filtered.length > 0 ? filtered : [
              { id: 'm1', name: 'Structural Rebar 16mm', quantity: 450, unit: 'Tons', site: 'Metro Tower Site A', cost: 180000 },
              { id: 'm2', name: 'Ready-Mix Concrete C30/37', quantity: 1200, unit: 'm³', site: 'Metro Tower Site A', cost: 144000 },
            ]).map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Package size={16} style={{ color: 'var(--blue)' }} />
                    {item.name}
                  </div>
                </td>
                <td style={{ padding: '14px', fontWeight: 700, color: 'var(--blue)' }}>{item.quantity} {item.unit}</td>
                <td style={{ padding: '14px', color: 'var(--muted)' }}>{item.site || 'Metro Site'}</td>
                <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--green)' }}>${(item.cost || 50000).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="panel" style={{ width: '100%', maxWidth: '440px', padding: '28px', borderRadius: '16px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Add Material Inventory</h2>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div>
                <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Material Name *</label>
                <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Quantity *</label>
                  <input type="number" required value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)' }} />
                </div>
                <div>
                  <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Unit</label>
                  <input type="text" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button type="button" className="secondary-button" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="primary-button">Add Inventory</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
