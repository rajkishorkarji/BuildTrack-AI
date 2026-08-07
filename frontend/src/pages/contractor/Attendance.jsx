import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Clock, CheckCircle2, QrCode, Search, UserCheck } from 'lucide-react';

export default function ContractorAttendance() {
  const { workers = [], attendanceLogs = [] } = useData();
  const [search, setSearch] = useState('');

  const filtered = workers.filter(w => (w.fullName || w.name || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <UserCheck size={14} /> Attendance
          </p>
        </div>
      </section>

      <div className="panel" style={{ marginTop: '20px', padding: '16px 20px' }}>
        <div className="search-box" style={{ width: '300px' }}>
          <Search size={14} style={{ color: 'var(--muted)' }} />
          <input placeholder="Search crew members..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="panel" style={{ marginTop: '16px', padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--panel-soft)', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Worker Name</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Role</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Shift Status</th>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Attendance Verification</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(w => (
              <tr key={w.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text)' }}>{w.fullName || w.name}</td>
                <td style={{ padding: '14px', color: 'var(--muted)' }}>{w.role || 'Crew Member'}</td>
                <td style={{ padding: '14px', color: 'var(--blue)', fontWeight: 600 }}>Day Shift (08:00 - 17:00)</td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '10px', background: 'rgba(34,197,94,0.12)', color: 'var(--green)', fontSize: '11px', fontWeight: 700 }}>
                    Verified Present
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
