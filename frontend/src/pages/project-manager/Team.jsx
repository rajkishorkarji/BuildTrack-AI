import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Users, UserPlus, Shield, Activity, Phone, Mail } from 'lucide-react';

export default function PMTeam() {
  const { workers } = useData();

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow">Project Labor & Site Staffing</p>
          <h1>Project Team ({workers.length})</h1>
        </div>
        <button type="button" className="primary-button">
          <UserPlus size={16} /> Assign Team Member
        </button>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '20px' }}>
        {workers.map(w => (
          <div key={w.id} className="panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <strong style={{ fontSize: '15px', color: 'var(--text)' }}>{w.name}</strong>
                <span style={{ display: 'block', fontSize: '12px', color: 'var(--blue)', fontWeight: 600, marginTop: '2px' }}>{w.role}</span>
              </div>
              <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: 'rgba(34,197,94,0.12)', color: 'var(--green)' }}>
                Active
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', borderTop: '1px solid var(--border)', paddingTop: '10px', marginTop: '4px' }}>
              <div>Site: {w.site || 'Metro Tower'}</div>
              <div>Shift: Morning (08:00 - 17:00)</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
