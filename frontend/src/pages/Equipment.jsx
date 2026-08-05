import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  Wrench,
  Plus,
  Search,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building2,
  MapPin,
} from 'lucide-react';

export default function Equipment() {
  const { equipment, addEquipment } = useData();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEquip, setNewEquip] = useState({
    name: '',
    type: 'Crane / Lifting',
    operator: '',
    companyName: user?.companyName || 'Solviontech Infrastructure Ltd',
    projectName: 'Metro Tower Site',
  });

  const handleAddEquipment = (e) => {
    e.preventDefault();
    if (!newEquip.name.trim()) return;

    addEquipment({
      name: newEquip.name.trim(),
      type: newEquip.type,
      operator: newEquip.operator || 'Assigned Operator',
      companyName: newEquip.companyName,
      projectName: newEquip.projectName,
      status: 'Operational',
    });

    setShowAddModal(false);
    setNewEquip({
      name: '',
      type: 'Crane / Lifting',
      operator: '',
      companyName: user?.companyName || 'Solviontech Infrastructure Ltd',
      projectName: 'Metro Tower Site',
    });
  };

  const filtered = equipment.filter(
    (e) =>
      (e.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.type || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.companyName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow">Equipment & Fleet Telemetry</p>
          <h1>Heavy Equipment Suite ({equipment.length})</h1>
        </div>

        <button type="button" className="primary-button" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Register Machinery
        </button>
      </section>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
        <div className="search-box" style={{ width: '320px' }}>
          <Search size={16} style={{ color: 'var(--muted)' }} />
          <input placeholder="Search machine name or type..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {filtered.length === 0 ? (
          <div className="panel" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
            <Wrench size={36} style={{ marginBottom: '12px', color: 'var(--muted)' }} />
            <h3 style={{ fontSize: '16px', color: 'var(--text)', margin: '0 0 6px 0' }}>No Heavy Equipment Registered</h3>
            <p style={{ fontSize: '13px', margin: 0 }}>Click &quot;Register Machinery&quot; above to add fleet equipment.</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div key={item.id} className="panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span className="schedule-pill" style={{ background: 'rgba(36, 196, 107, 0.15)', color: 'var(--green)' }}>
                  {item.status}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>{item.type}</span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>{item.name}</h3>
              <span style={{ fontSize: '12px', color: 'var(--blue)', fontWeight: 600, display: 'block', marginBottom: '10px' }}>
                {item.companyName}
              </span>
              <p style={{ fontSize: '13px', color: 'var(--muted)' }}>Operator: <strong style={{ color: 'var(--text)' }}>{item.operator}</strong></p>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="panel" style={{ width: '100%', maxWidth: '480px', padding: '28px', borderRadius: '16px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--text)' }}>Register Heavy Machinery</h2>
            <form onSubmit={handleAddEquipment} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div>
                <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Machinery Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Tower Crane TC-500"
                  value={newEquip.name}
                  onChange={(e) => setNewEquip({ ...newEquip, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
                />
              </div>

              <div>
                <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Equipment Type</label>
                <input
                  type="text"
                  placeholder="e.g. Crane / Concrete Pump / Excavator"
                  value={newEquip.type}
                  onChange={(e) => setNewEquip({ ...newEquip, type: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
                />
              </div>

              <div>
                <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Assigned Operator</label>
                <input
                  type="text"
                  placeholder="Operator Name"
                  value={newEquip.operator}
                  onChange={(e) => setNewEquip({ ...newEquip, operator: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="secondary-button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Save Equipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
