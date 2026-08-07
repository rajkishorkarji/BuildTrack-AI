import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { FileText, TrendingUp, CheckCircle2, Search } from 'lucide-react';

export default function PMDailyProgressReport() {
  const { progressReports = [], projects = [] } = useData();
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  const pmReports = progressReports.filter(r => {
    const matchSearch = (r.projectName || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.workCompleted || '').toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow">Project Manager Quality Audit Stream</p>
          <h1>Site Engineer Daily Logs Audit ({pmReports.length})</h1>
        </div>
      </section>

      <div className="panel" style={{ marginTop: '20px', padding: '16px 20px' }}>
        <div className="search-box" style={{ width: '320px' }}>
          <Search size={14} style={{ color: 'var(--muted)' }} />
          <input placeholder="Filter logs by project or site engineer..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="panel" style={{ marginTop: '16px', padding: '24px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '16px' }}>Site Log Verification Feed</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {pmReports.length === 0 ? (
            <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '32px' }}>No daily site logs submitted yet.</p>
          ) : (
            pmReports.map(log => (
              <div key={log.id} style={{ padding: '16px', background: 'var(--panel-soft)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <strong style={{ fontSize: '15px' }}>{log.projectName}</strong>
                  <span style={{ padding: '3px 10px', borderRadius: '10px', background: 'rgba(34,197,94,0.12)', color: 'var(--green)', fontSize: '12px', fontWeight: 700 }}>
                    {log.newTotalProgress}% Complete
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 8px 0' }}>{log.workCompleted}</p>
                <div style={{ fontSize: '11px', color: 'var(--muted)', borderTop: '1px dashed var(--border)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Logged by: <strong>{log.submittedBy || 'Site Engineer'}</strong> • {log.date}</span>
                  <span style={{ color: 'var(--blue)', fontWeight: 600 }}>QC Audit Verified</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
