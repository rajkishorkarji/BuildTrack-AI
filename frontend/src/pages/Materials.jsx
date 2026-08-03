import { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Package,
} from 'lucide-react';

const initialMaterials = [
  { id: 1, name: 'Ultratech OPC 53 Grade Cement', code: 'MAT-CEM-01', unit: 'Bags', stock: 1450, minThreshold: 300, location: 'Central Storage Yard A', status: 'IN_STOCK' },
  { id: 2, name: 'Tata TMT Fe 550D Steel Rebar (16mm)', code: 'MAT-STL-16', unit: 'Metric Tons', stock: 18, minThreshold: 25, location: 'Metro Tower Site Yard', status: 'LOW_STOCK' },
  { id: 3, name: 'Coarse Aggregate (20mm Gravel)', code: 'MAT-AGG-20', unit: 'Cu. Meters', stock: 480, minThreshold: 100, location: 'Skyview Residency Yard', status: 'IN_STOCK' },
  { id: 4, name: 'Crushed River Sand (Zone II)', code: 'MAT-SND-02', unit: 'Cu. Meters', stock: 65, minThreshold: 80, location: 'Central Storage Yard B', status: 'LOW_STOCK' },
  { id: 5, name: 'Red AAC Bricks (600x200x150mm)', code: 'MAT-BRK-AAC', unit: 'Blocks', stock: 12000, minThreshold: 2000, location: 'Central Storage Yard A', status: 'IN_STOCK' },
];

export default function Materials() {
  const [materials, setMaterials] = useState(initialMaterials);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMat, setNewMat] = useState({ name: '', unit: 'Bags', stock: '', minThreshold: '100', location: 'Central Yard A' });

  const notify = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3500);
  };

  const handleIssueMaterial = (id, name) => {
    setMaterials((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const newQty = Math.max(0, m.stock - 50);
          return {
            ...m,
            stock: newQty,
            status: newQty < m.minThreshold ? 'LOW_STOCK' : 'IN_STOCK',
          };
        }
        return m;
      })
    );
    notify(`Issued 50 units of ${name} to Metro Tower Site.`);
  };

  const handleReceiveShipment = (id, name) => {
    setMaterials((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const newQty = m.stock + 200;
          return {
            ...m,
            stock: newQty,
            status: newQty < m.minThreshold ? 'LOW_STOCK' : 'IN_STOCK',
          };
        }
        return m;
      })
    );
    notify(`Received shipment of +200 units for ${name}. Stock replenished!`);
  };

  const handleAddMaterial = (e) => {
    e.preventDefault();
    if (!newMat.name) return;
    const stockNum = Number(newMat.stock) || 0;
    const minNum = Number(newMat.minThreshold) || 100;
    setMaterials([
      ...materials,
      {
        id: Date.now(),
        name: newMat.name,
        code: `MAT-${newMat.name.substring(0, 3).toUpperCase()}-0${materials.length + 1}`,
        unit: newMat.unit,
        stock: stockNum,
        minThreshold: minNum,
        location: newMat.location,
        status: stockNum < minNum ? 'LOW_STOCK' : 'IN_STOCK',
      },
    ]);
    setShowAddModal(false);
    setNewMat({ name: '', unit: 'Bags', stock: '', minThreshold: '100', location: 'Central Yard A' });
    notify(`Added material catalog item "${newMat.name}"`);
  };

  const filteredMaterials = materials.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.code.toLowerCase().includes(search.toLowerCase()) ||
      m.location.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockCount = materials.filter((m) => m.status === 'LOW_STOCK').length;

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <p className="eyebrow" style={{ color: 'var(--blue)', fontWeight: 600 }}>INVENTORY & LOGISTICS</p>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Construction Materials & Stock Management</h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '4px' }}>
            Company Admin stock control: track cement, steel rebar, aggregates, issue materials to sites, and monitor low stock alerts.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={16} /> Add New Material
        </button>
      </div>

      {notice && (
        <div style={{ background: 'rgba(36, 196, 107, 0.15)', border: '1px solid var(--green)', color: 'var(--green)', padding: '12px 18px', borderRadius: '10px', fontWeight: 600, fontSize: '14px' }}>
          {notice}
        </div>
      )}

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="panel" style={{ padding: '18px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Total Material Types</span>
          <h2 style={{ fontSize: '26px', color: 'var(--blue)', marginTop: '4px' }}>{materials.length} Items</h2>
          <small style={{ color: 'var(--muted)' }}>Across 3 Central Storage Yards</small>
        </div>
        <div className="panel" style={{ padding: '18px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Low Stock Alerts</span>
          <h2 style={{ fontSize: '26px', color: lowStockCount > 0 ? 'var(--orange)' : 'var(--green)', marginTop: '4px' }}>
            {lowStockCount} Items Below Threshold
          </h2>
          <small style={{ color: 'var(--orange)' }}>Re-order recommended</small>
        </div>
        <div className="panel" style={{ padding: '18px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Active Warehouses</span>
          <h2 style={{ fontSize: '26px', color: 'var(--purple)', marginTop: '4px' }}>3 Yards</h2>
          <small style={{ color: 'var(--green)' }}>Operational 24/7</small>
        </div>
      </div>

      {/* Materials Table Panel */}
      <div className="panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck size={20} style={{ color: 'var(--blue)' }} /> Material Stock Inventory Ledger
          </h3>

          <div className="search-box" style={{ width: '280px' }}>
            <Search size={16} />
            <input
              placeholder="Search material or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px' }}>Material & Code</th>
                <th style={{ padding: '12px' }}>Storage Location</th>
                <th style={{ padding: '12px' }}>Current Stock</th>
                <th style={{ padding: '12px' }}>Min Threshold</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Stock Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaterials.map((m) => (
                <tr key={m.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '14px 12px' }}>
                    <strong style={{ fontSize: '14px', display: 'block' }}>{m.name}</strong>
                    <span style={{ fontSize: '12px', color: 'var(--muted)' }}>SKU: {m.code}</span>
                  </td>
                  <td style={{ padding: '14px 12px', color: 'var(--muted)' }}>{m.location}</td>
                  <td style={{ padding: '14px 12px', fontWeight: 700, fontSize: '14px', color: 'var(--blue)' }}>
                    {m.stock} {m.unit}
                  </td>
                  <td style={{ padding: '14px 12px', color: 'var(--muted)' }}>{m.minThreshold} {m.unit}</td>
                  <td style={{ padding: '14px 12px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 700,
                        background: m.status === 'IN_STOCK' ? 'rgba(36, 196, 107, 0.15)' : 'rgba(242, 153, 74, 0.15)',
                        color: m.status === 'IN_STOCK' ? 'var(--green)' : 'var(--orange)',
                      }}
                    >
                      {m.status === 'IN_STOCK' ? 'In Stock' : '⚠️ LOW STOCK'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        type="button"
                        className="secondary-button"
                        style={{ padding: '4px 10px', fontSize: '12px', color: 'var(--blue)' }}
                        onClick={() => handleIssueMaterial(m.id, m.name)}
                      >
                        <ArrowUpRight size={14} /> Issue to Site
                      </button>
                      <button
                        type="button"
                        className="secondary-button"
                        style={{ padding: '4px 10px', fontSize: '12px', color: 'var(--green)' }}
                        onClick={() => handleReceiveShipment(m.id, m.name)}
                      >
                        <ArrowDownLeft size={14} /> Receive Stock
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Material */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
          }}
        >
          <div className="panel" style={{ width: '420px', padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Add New Construction Material</h3>
            <form onSubmit={handleAddMaterial} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>Material Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Waterproofing Chemical Compound"
                  value={newMat.name}
                  onChange={(e) => setNewMat({ ...newMat, name: e.target.value })}
                  style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>Unit of Measurement</label>
                <select
                  value={newMat.unit}
                  onChange={(e) => setNewMat({ ...newMat, unit: e.target.value })}
                  style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)' }}
                >
                  <option value="Bags">Bags</option>
                  <option value="Metric Tons">Metric Tons</option>
                  <option value="Cu. Meters">Cu. Meters</option>
                  <option value="Blocks">Blocks</option>
                  <option value="Liters">Liters</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>Initial Stock Quantity</label>
                <input
                  required
                  type="number"
                  placeholder="e.g. 500"
                  value={newMat.stock}
                  onChange={(e) => setNewMat({ ...newMat, stock: e.target.value })}
                  style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>Minimum Threshold Alert Level</label>
                <input
                  type="number"
                  value={newMat.minThreshold}
                  onChange={(e) => setNewMat({ ...newMat, minThreshold: e.target.value })}
                  style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" className="secondary-button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Add Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
