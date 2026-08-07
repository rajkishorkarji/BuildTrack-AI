import { useData } from '../../context/DataContext';
import { ShieldCheck, Plus, Wrench, Clock, CheckCircle2 } from 'lucide-react';

export default function PMEquipment() {
  const { equipment } = useData();

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <ShieldCheck size={14} /> Equipment
          </p>
        </div>
        <button type="button" className="primary-button">
          <Plus size={16} /> Request Equipment Allocation
        </button>
      </section>

      <div className="panel" style={{ marginTop: '20px', padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--panel-soft)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Equipment Name</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Category</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Assigned Project</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Operator</th>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Availability Status</th>
            </tr>
          </thead>
          <tbody>
            {equipment.map(eq => (
              <tr key={eq.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text)' }}>{eq.name}</td>
                <td style={{ padding: '14px', color: 'var(--muted)' }}>{eq.category || 'Heavy Machinery'}</td>
                <td style={{ padding: '14px', color: 'var(--muted)' }}>{eq.project || 'Metro Site'}</td>
                <td style={{ padding: '14px', fontWeight: 500 }}>{eq.operator || 'Assigned Crew'}</td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{ padding: '3px 10px', borderRadius: '10px', background: 'rgba(34,197,94,0.12)', color: 'var(--green)', fontSize: '11px', fontWeight: 600 }}>
                    {eq.status || 'Active'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
