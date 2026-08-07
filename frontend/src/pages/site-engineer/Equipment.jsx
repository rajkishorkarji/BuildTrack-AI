import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Wrench, CheckCircle2, AlertTriangle, Plus, ShieldCheck } from 'lucide-react';

export default function SEEquipment() {
  const { equipment = [] } = useData();
  const [notice, setNotice] = useState('');

  const requestService = (item) => {
    setNotice(`✓ Maintenance service requested for ${item.name}. Alert sent to Company Admin.`);
    setTimeout(() => setNotice(''), 3500);
  };

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <ShieldCheck size={14} /> Equipment
          </p>
        </div>
      </section>

      {notice && (
        <div style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid var(--green)', color: 'var(--green)', padding: '12px 18px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', marginTop: '16px' }}>
          {notice}
        </div>
      )}

      <div className="panel" style={{ marginTop: '20px', padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--panel-soft)', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Equipment Name</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Category</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Operator</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {equipment.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Wrench size={16} style={{ color: 'var(--blue)' }} />
                    {item.name}
                  </div>
                </td>
                <td style={{ padding: '14px', color: 'var(--muted)' }}>{item.type}</td>
                <td style={{ padding: '14px', fontWeight: 600 }}>{item.operator || 'Site Crew'}</td>
                <td style={{ padding: '14px' }}>
                  <span style={{ padding: '3px 10px', borderRadius: '10px', background: item.status === 'Operational' ? 'rgba(34,197,94,0.12)' : 'rgba(245,154,22,0.12)', color: item.status === 'Operational' ? 'var(--green)' : 'var(--orange)', fontSize: '11px', fontWeight: 700 }}>
                    {item.status || 'Operational'}
                  </span>
                </td>
                <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                  <button type="button" className="secondary-button" style={{ fontSize: '11px', padding: '5px 10px', color: 'var(--orange)', borderColor: 'var(--orange)' }} onClick={() => requestService(item)}>
                    Request Service
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
