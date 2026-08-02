import { useState } from 'react';
import { HardHat, Wrench, AlertTriangle, Plus, CheckCircle2 } from 'lucide-react';

const initialEquipment = [
  { id: 1, name: 'Tower Crane CAT-900', category: 'Heavy Machinery', serial: 'EQ-TC-900', status: 'Operational', dailyCost: '$3,500', nextService: 'Aug 10, 2025' },
  { id: 2, name: 'Hydraulic Excavator EX-200', category: 'Earthmoving', serial: 'EQ-EX-200', status: 'Operational', dailyCost: '$2,800', nextService: 'Jul 15, 2025' },
  { id: 3, name: 'Mobile Concrete Pump 5000', category: 'Concrete Tools', serial: 'EQ-CP-500', status: 'In Maintenance', dailyCost: '$1,800', nextService: 'Jun 28, 2025' },
  { id: 4, name: 'Diesel Generator Set 250kVA', category: 'Power Supply', serial: 'EQ-DG-250', status: 'Idle', dailyCost: '$950', nextService: 'Sep 01, 2025' },
];

export default function Equipment() {
  const [equipmentList, setEquipmentList] = useState(initialEquipment);
  const [showModal, setShowModal] = useState(false);
  const [item, setItem] = useState({ name: '', category: 'Heavy Machinery', dailyCost: '' });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!item.name) return;
    const added = {
      id: equipmentList.length + 1,
      ...item,
      serial: `EQ-NEW-00${equipmentList.length + 1}`,
      status: 'Operational',
      dailyCost: `$${item.dailyCost}`,
      nextService: 'Oct 30, 2025',
    };
    setEquipmentList([added, ...equipmentList]);
    setShowModal(false);
    setItem({ name: '', category: 'Heavy Machinery', dailyCost: '' });
  };

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow">Machinery & Inventory</p>
          <h1>Site Equipment Management</h1>
        </div>
        <button type="button" className="primary-button" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Equipment
        </button>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Total Units</span>
          <h2 style={{ fontSize: '26px', marginTop: '6px' }}>96 Units</h2>
        </div>
        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Operational Fleet</span>
          <h2 style={{ fontSize: '26px', color: 'var(--green)', marginTop: '6px' }}>84 Units (87.5%)</h2>
        </div>
        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Maintenance Pending</span>
          <h2 style={{ fontSize: '26px', color: 'var(--orange)', marginTop: '6px' }}>8 Units</h2>
        </div>
      </div>

      <div className="panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Equipment Fleet Status</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: 'var(--panel-soft)', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '14px 20px' }}>Equipment Name & Serial</th>
              <th style={{ padding: '14px 20px' }}>Category</th>
              <th style={{ padding: '14px 20px' }}>Daily Rate</th>
              <th style={{ padding: '14px 20px' }}>Next Service Due</th>
              <th style={{ padding: '14px 20px' }}>Operational Status</th>
            </tr>
          </thead>
          <tbody>
            {equipmentList.map((eq) => (
              <tr key={eq.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text)' }}>
                  <div>{eq.name}</div>
                  <small style={{ color: 'var(--blue)', fontFamily: 'monospace' }}>{eq.serial}</small>
                </td>
                <td style={{ padding: '14px 20px', color: 'var(--muted)' }}>{eq.category}</td>
                <td style={{ padding: '14px 20px', fontWeight: 600 }}>{eq.dailyCost} / day</td>
                <td style={{ padding: '14px 20px' }}>{eq.nextService}</td>
                <td style={{ padding: '14px 20px' }}>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: eq.status === 'Operational' ? 'rgba(36, 196, 107, 0.15)' : eq.status === 'In Maintenance' ? 'rgba(245, 154, 22, 0.15)' : 'rgba(113, 128, 151, 0.15)',
                      color: eq.status === 'Operational' ? 'var(--green)' : eq.status === 'In Maintenance' ? 'var(--orange)' : 'var(--muted)',
                    }}
                  >
                    {eq.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="panel" style={{ width: '100%', maxWidth: '450px', padding: '28px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Add New Equipment</h2>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input
                type="text"
                placeholder="Equipment Name"
                value={item.name}
                onChange={(e) => setItem({ ...item, name: e.target.value })}
                required
                style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
              />
              <input
                type="number"
                placeholder="Daily Operational Cost ($)"
                value={item.dailyCost}
                onChange={(e) => setItem({ ...item, dailyCost: e.target.value })}
                required
                style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
              />
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Save Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
