import { Package } from 'lucide-react';

export default function WorkerMaterials() {
  const materials = [
    { id: 1, name: 'Structural Steel Rebar 16mm', quantity: '450 Tons' },
    { id: 2, name: 'Tie Wire Spools', quantity: '80 Rolls' },
  ];

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <Package size={14} /> Materials
          </p>
        </div>
      </section>

      <div className="panel" style={{ marginTop: '20px', padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--panel-soft)', color: 'var(--muted)' }}>
              <th style={{ padding: '12px 20px', fontWeight: 600 }}>Material Name</th>
              <th style={{ padding: '12px 20px', fontWeight: 600 }}>Quantity Available</th>
            </tr>
          </thead>
          <tbody>
            {materials.map(m => (
              <tr key={m.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 20px', fontWeight: 700, color: 'var(--text)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Package size={16} style={{ color: 'var(--blue)' }} />
                    {m.name}
                  </div>
                </td>
                <td style={{ padding: '12px 20px', fontWeight: 700, color: 'var(--blue)' }}>{m.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
