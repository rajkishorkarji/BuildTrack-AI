import { Wrench } from 'lucide-react';

export default function WorkerEquipment() {
  const tools = [
    { id: 1, name: 'Rebar Tying Tool E-20', status: 'Assigned' },
    { id: 2, name: 'Safety Harness & Helmet Kit', status: 'Active' },
  ];

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <Wrench size={14} /> Equipment
          </p>
        </div>
      </section>

      <div className="panel" style={{ marginTop: '20px', padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--panel-soft)', color: 'var(--muted)' }}>
              <th style={{ padding: '12px 20px', fontWeight: 600 }}>Tool / Gear</th>
              <th style={{ padding: '12px 20px', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {tools.map(t => (
              <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 20px', fontWeight: 700, color: 'var(--text)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Wrench size={16} style={{ color: 'var(--blue)' }} />
                    {t.name}
                  </div>
                </td>
                <td style={{ padding: '12px 20px' }}>
                  <span style={{ padding: '3px 8px', borderRadius: '8px', background: 'rgba(34,197,94,0.12)', color: 'var(--green)', fontSize: '11px', fontWeight: 700 }}>
                    {t.status}
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
