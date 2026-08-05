import { useState } from 'react';
import { useData } from '../context/DataContext';
import { Truck, Plus, Search, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function Materials() {
  const { materials, addMaterial } = useData();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMat, setNewMat] = useState({
    name: '',
    quantity: '100 Bags',
    unit: 'Bags',
    projectName: 'Metro Tower Site',
  });

  const handleAddMaterial = (e) => {
    e.preventDefault();
    if (!newMat.name.trim()) return;

    addMaterial({
      name: newMat.name.trim(),
      quantity: newMat.quantity,
      unit: newMat.unit,
      projectName: newMat.projectName,
      status: 'In Stock',
    });

    setShowAddModal(false);
    setNewMat({ name: '', quantity: '100 Bags', unit: 'Bags', projectName: 'Metro Tower Site' });
  };

  const filtered = materials.filter((m) => (m.name || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow">Inventory & Supply Chain</p>
          <h1>Site Materials Inventory ({materials.length})</h1>
        </div>

        <button type="button" className="primary-button" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Log Material Delivery
        </button>
      </section>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
        <div className="search-box" style={{ width: '320px' }}>
          <Search size={16} style={{ color: 'var(--muted)' }} />
          <input placeholder="Search material item..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="panel" style={{ marginTop: '20px', padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
            <Truck size={36} style={{ marginBottom: '12px', color: 'var(--muted)' }} />
            <h3 style={{ fontSize: '16px', color: 'var(--text)', margin: '0 0 6px 0' }}>No Material Inventory Logged</h3>
            <p style={{ fontSize: '13px', margin: 0 }}>Click &quot;Log Material Delivery&quot; above to add inventory.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--panel-soft)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                <th style={{ padding: '14px 20px' }}>Material Item</th>
                <th style={{ padding: '14px' }}>Quantity</th>
                <th style={{ padding: '14px' }}>Project Site</th>
                <th style={{ padding: '14px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text)' }}>{item.name}</td>
                  <td style={{ padding: '16px', fontWeight: 700 }}>{item.quantity}</td>
                  <td style={{ padding: '16px' }}>{item.projectName}</td>
                  <td style={{ padding: '16px' }}>
                    <span className="schedule-pill" style={{ background: 'rgba(36, 196, 107, 0.15)', color: 'var(--green)' }}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="panel" style={{ width: '100%', maxWidth: '480px', padding: '28px', borderRadius: '16px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--text)' }}>Log Material Delivery</h2>
            <form onSubmit={handleAddMaterial} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div>
                <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Material Item Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Portland Cement Grade 53"
                  value={newMat.name}
                  onChange={(e) => setNewMat({ ...newMat, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
                />
              </div>

              <div>
                <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Quantity Delivered</label>
                <input
                  type="text"
                  placeholder="e.g. 250 Bags"
                  value={newMat.quantity}
                  onChange={(e) => setNewMat({ ...newMat, quantity: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="secondary-button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Save Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
