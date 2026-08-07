import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { ShieldCheck, Plus, Search, Wrench, Clock, CheckCircle2, Tag, UserCheck, AlertTriangle } from 'lucide-react';

const INPUT = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: '13px' };

export default function CompanyAdminEquipment() {
  const { equipment, addEquipment, deleteEquipment, updateEquipmentStatus, workers = [], projects = [] } = useData();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [machineryForm, setMachineryForm] = useState({
    name: '',
    equipmentId: '',
    category: 'Heavy Machinery',
    currentStatus: 'Operational',
    assignTo: '',
  });

  const handleRegisterMachinery = (e) => {
    e.preventDefault();
    if (!machineryForm.name.trim()) return;

    const newAsset = {
      id: Date.now().toString(),
      name: machineryForm.name.trim(),
      equipmentId: machineryForm.equipmentId.trim() || `EQ-${Date.now().toString().slice(-4)}`,
      category: machineryForm.category,
      status: machineryForm.currentStatus,
      operator: machineryForm.assignTo || 'Unassigned',
      projectName: projects[0]?.name || 'Metro Tower Site A',
      companyName: 'Solviontech Infrastructure Ltd',
      createdAt: new Date().toISOString(),
    };

    addEquipment(newAsset);

    setShowAddModal(false);
    setMachineryForm({
      name: '',
      equipmentId: '',
      category: 'Heavy Machinery',
      currentStatus: 'Operational',
      assignTo: '',
    });
  };

  const filtered = equipment.filter(eq =>
    (eq.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (eq.equipmentId || eq.code || '').toLowerCase().includes(search.toLowerCase()) ||
    (eq.category || '').toLowerCase().includes(search.toLowerCase()) ||
    (eq.operator || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <Wrench size={14} /> Equipment
          </p>
        </div>
        <button type="button" className="primary-button" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Register Machinery
        </button>
      </section>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginTop: '20px' }}>
        {[
          { label: 'Total Fleet Assets', value: equipment.length, color: 'var(--blue)' },
          { label: 'Operational Fleet', value: equipment.filter(e => (e.status || 'Operational') === 'Operational').length, color: 'var(--green)' },
          { label: 'In Maintenance', value: equipment.filter(e => e.status === 'In Maintenance').length, color: 'var(--orange)' },
          { label: 'Deployed Assets', value: equipment.filter(e => e.status === 'Deployed').length, color: 'var(--purple)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="panel" style={{ padding: '18px' }}>
            <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>{label}</span>
            <h3 style={{ fontSize: '22px', color, margin: '4px 0 0 0', fontWeight: 800 }}>{value}</h3>
          </div>
        ))}
      </div>

      {/* Search Toolbar */}
      <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
        <div className="search-box" style={{ width: '360px' }}>
          <Search size={16} style={{ color: 'var(--muted)' }} />
          <input
            placeholder="Search equipment by name, ID, category, or assigned operator..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Assets Table */}
      <div className="panel" style={{ marginTop: '20px', padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--panel-soft)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Equipment Name & ID</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Category</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Assigned To (Operator / Site)</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Current Status</th>
              <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(eq => (
              <tr key={eq.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text)' }}>
                  <div>{eq.name}</div>
                  <code style={{ fontSize: '11px', color: 'var(--blue)', background: 'rgba(37,99,235,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                    {eq.equipmentId || eq.code || `EQ-${eq.id}`}
                  </code>
                </td>
                <td style={{ padding: '14px', color: 'var(--muted)', fontWeight: 500 }}>
                  {eq.category || 'Heavy Machinery'}
                </td>
                <td style={{ padding: '14px', fontWeight: 600, color: eq.operator && eq.operator !== 'Unassigned' ? 'var(--text)' : 'var(--orange)' }}>
                  {eq.operator || 'Unassigned'}
                </td>
                <td style={{ padding: '14px' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '10px',
                    background: (eq.status || 'Operational') === 'Operational' ? 'rgba(34,197,94,0.12)' : (eq.status === 'In Maintenance' ? 'rgba(245,154,22,0.12)' : 'rgba(37,99,235,0.12)'),
                    color: (eq.status || 'Operational') === 'Operational' ? 'var(--green)' : (eq.status === 'In Maintenance' ? 'var(--orange)' : 'var(--blue)'),
                    fontSize: '11px',
                    fontWeight: 700,
                  }}>
                    {eq.status || 'Operational'}
                  </span>
                </td>
                <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="secondary-button"
                      style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 600 }}
                      onClick={() => {
                        const nextStatus = (eq.status || 'Operational') === 'Operational' ? 'In Maintenance' : 'Operational';
                        updateEquipmentStatus(eq.id, nextStatus);
                      }}
                    >
                      <Wrench size={12} style={{ marginRight: '4px' }} /> Toggle Status
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--red)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                      onClick={() => deleteEquipment(eq.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Register Machinery Modal ── */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="panel" style={{ width: '100%', maxWidth: '520px', padding: '28px', borderRadius: '18px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '4px', color: 'var(--text)' }}>Register Machinery</h2>
            <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '20px' }}>Company Admin Machinery Registration Form</p>

            <form onSubmit={handleRegisterMachinery} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--muted)', marginBottom: '4px', fontWeight: 600 }}>Equipment Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Caterpillar Excavator 320D"
                  style={INPUT}
                  value={machineryForm.name}
                  onChange={e => setMachineryForm({ ...machineryForm, name: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--muted)', marginBottom: '4px', fontWeight: 600 }}>Equipment ID</label>
                <input
                  type="text"
                  placeholder="e.g. EQ-9021-CAT"
                  style={INPUT}
                  value={machineryForm.equipmentId}
                  onChange={e => setMachineryForm({ ...machineryForm, equipmentId: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--muted)', marginBottom: '4px', fontWeight: 600 }}>Category</label>
                <select
                  style={{ ...INPUT, fontWeight: 600 }}
                  value={machineryForm.category}
                  onChange={e => setMachineryForm({ ...machineryForm, category: e.target.value })}
                >
                  <option value="Heavy Machinery">Heavy Machinery</option>
                  <option value="Earthmoving">Earthmoving</option>
                  <option value="Concrete Equipment">Concrete Equipment</option>
                  <option value="Lifting & Cranes">Lifting & Cranes</option>
                  <option value="Generators & Power">Generators & Power</option>
                  <option value="Transport & Vehicles">Transport & Vehicles</option>
                  <option value="Tools & Light Gear">Tools & Light Gear</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--muted)', marginBottom: '4px', fontWeight: 600 }}>Current Status</label>
                <select
                  style={INPUT}
                  value={machineryForm.currentStatus}
                  onChange={e => setMachineryForm({ ...machineryForm, currentStatus: e.target.value })}
                >
                  <option value="Operational">Operational</option>
                  <option value="In Maintenance">In Maintenance</option>
                  <option value="Deployed">Deployed</option>
                  <option value="Idle">Idle</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--muted)', marginBottom: '4px', fontWeight: 600 }}>Assign To (Optional)</label>
                <select
                  style={INPUT}
                  value={machineryForm.assignTo}
                  onChange={e => setMachineryForm({ ...machineryForm, assignTo: e.target.value })}
                >
                  <option value="">-- Unassigned (Fleet Depot) --</option>
                  {workers.map(w => (
                    <option key={w.id} value={w.name || w.fullName}>{w.name || w.fullName} ({w.role})</option>
                  ))}
                  <option value="Vikram Operator (Heavy Equipment)">Vikram Operator (Heavy Equipment)</option>
                  <option value="Metro Tower Site A">Metro Tower Site A</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" className="secondary-button" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="primary-button">Register Machinery</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
