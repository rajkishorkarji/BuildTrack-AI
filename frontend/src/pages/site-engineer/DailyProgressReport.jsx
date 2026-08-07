import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { TrendingUp, Plus, FileText, Camera, MapPin } from 'lucide-react';

export default function SEDailyProgressReport() {
  const { progressReports = [], addProgressReport, projects = [] } = useData();
  const { user } = useAuth();

  const [workCompleted, setWorkCompleted] = useState('');
  const [newProgress, setNewProgress] = useState('50');
  const [weather, setWeather] = useState('Sunny 28°C');
  const [geoTag, setGeoTag] = useState('20.2961° N, 85.8245° E');
  const [notice, setNotice] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!workCompleted.trim()) return;

    if (addProgressReport) {
      addProgressReport({
        projectId: projects[0]?.id || Date.now(),
        projectName: projects[0]?.name || 'Metro Tower Site A',
        workCompleted: workCompleted.trim(),
        newTotalProgress: parseInt(newProgress, 10) || 50,
        weather,
        submittedBy: user?.fullName || 'Site Engineer',
        date: new Date().toISOString().slice(0, 10),
      });
    }

    setNotice(`✓ Daily Log submitted! Progress updated to ${newProgress}%.`);
    setWorkCompleted('');
    setTimeout(() => setNotice(''), 3500);
  };

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <FileText size={14} /> Daily Logs
          </p>
        </div>
      </section>

      {notice && (
        <div style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid var(--green)', color: 'var(--green)', padding: '12px 18px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', marginTop: '16px' }}>
          {notice}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {/* Form Panel */}
        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} style={{ color: 'var(--blue)' }} /> Submit Daily Progress Log
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div>
              <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Work Completed Today *</label>
              <textarea required rows={3} value={workCompleted} onChange={e => setWorkCompleted(e.target.value)} placeholder="e.g. Completed 240m³ concrete pouring on Column C4 with 2 boom pumps..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>New Total Progress (%)</label>
                <input type="number" min="0" max="100" value={newProgress} onChange={e => setNewProgress(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)', fontWeight: 700 }} />
              </div>
              <div>
                <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Weather Condition</label>
                <input type="text" value={weather} onChange={e => setWeather(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }} />
              </div>
            </div>

            <div>
              <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>GPS Geo-Coordinates</label>
              <input type="text" value={geoTag} onChange={e => setGeoTag(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)', fontWeight: 600 }} />
            </div>

            <button type="submit" className="primary-button" style={{ marginTop: '6px' }}>
              <Plus size={16} /> Submit Daily Log Entry
            </button>
          </form>
        </div>

        {/* History Panel */}
        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} style={{ color: 'var(--green)' }} /> Logged Progress Stream
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
            {progressReports.map(r => (
              <div key={r.id} style={{ padding: '14px', background: 'var(--panel-soft)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '14px' }}>{r.projectName || 'Metro Tower Site'}</strong>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--green)' }}>{r.newTotalProgress}% Progress</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '0 0 6px 0' }}>{r.workCompleted}</p>
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>By {r.submittedBy || 'Site Engineer'} • {r.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
