import { FileText } from 'lucide-react';

export default function WorkerDocuments() {
  const docs = [
    { id: 1, name: 'Site Safety Rules & Protocol', category: 'Safety Guide' },
    { id: 2, name: 'Rebar Tying Standard Operating Procedure', category: 'SOP' },
  ];

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <FileText size={14} /> Documents
          </p>
        </div>
      </section>

      <div className="panel" style={{ marginTop: '20px', padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--panel-soft)', color: 'var(--muted)' }}>
              <th style={{ padding: '12px 20px', fontWeight: 600 }}>Document</th>
              <th style={{ padding: '12px', fontWeight: 600 }}>Category</th>
            </tr>
          </thead>
          <tbody>
            {docs.map(d => (
              <tr key={d.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 20px', fontWeight: 700, color: 'var(--text)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={16} style={{ color: 'var(--blue)' }} />
                    {d.name}
                  </div>
                </td>
                <td style={{ padding: '12px', color: 'var(--purple)', fontWeight: 600 }}>{d.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
