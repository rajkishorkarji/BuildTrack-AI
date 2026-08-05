import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { FileText, Plus, CheckCircle2, TrendingUp, Calendar } from 'lucide-react';

export default function DailyProgressReport() {
  const { projects, progressReports, addProgressReport } = useData();
  const { user } = useAuth();
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');
  const [workCompleted, setWorkCompleted] = useState('');
  const [newProgress, setNewProgress] = useState('50');
  const [notice, setNotice] = useState('');

  const handleSubmitReport = (e) => {
    e.preventDefault();
    if (!workCompleted.trim()) return;

    const proj = projects.find((p) => String(p.id) === String(selectedProjectId)) || projects[0];

    addProgressReport({
      projectId: proj?.id,
      projectName: proj?.name || 'Construction Site',
      workCompleted: workCompleted.trim(),
      newTotalProgress: parseInt(newProgress, 10) || 50,
      submittedBy: user?.fullName || 'Site Engineer',
    });

    setNotice(`Daily Progress Logged for ${proj?.name || 'Project'}! Progress updated to ${newProgress}%.`);
    setWorkCompleted('');
    setTimeout(() => setNotice(''), 4000);
  };

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow">Field Telemetry & Progress Verification</p>
          <h1>Daily Progress Log ({progressReports.length})</h1>
        </div>
      </section>

      {notice && (
        <div style={{ background: 'rgba(36, 196, 107, 0.15)', border: '1px solid var(--green)', color: 'var(--green)', padding: '12px 18px', borderRadius: '10px', fontWeight: 600, fontSize: '14px', marginTop: '16px' }}>
          {notice}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        {/* Form Panel */}
        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={20} style={{ color: 'var(--blue)' }} /> Log Daily Site Progress
          </h3>
          <form onSubmit={handleSubmitReport} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
            <div>
              <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Select Target Project *</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
              >
                {projects.length === 0 ? (
                  <option value="">No Active Projects Available</option>
                ) : (
                  projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Current: {p.progress}%)
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Work Completed Today *</label>
              <textarea
                placeholder="e.g. Completed 140m³ concrete pouring on Floor 15..."
                value={workCompleted}
                onChange={(e) => setWorkCompleted(e.target.value)}
                required
                rows={3}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)', resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>New Overall Project Progress (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={newProgress}
                onChange={(e) => setNewProgress(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
              />
            </div>

            <button type="submit" className="primary-button" style={{ alignSelf: 'flex-start', marginTop: '6px' }}>
              Submit Progress Log
            </button>
          </form>
        </div>

        {/* Recent Submissions List */}
        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} style={{ color: 'var(--green)' }} /> Logged Progress Entries
          </h3>

          {progressReports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--muted)', fontSize: '13px' }}>
              No progress logs submitted today.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {progressReports.map((log) => (
                <div key={log.id} style={{ background: 'var(--panel-soft)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                    <strong>{log.projectName}</strong>
                    <span style={{ color: 'var(--green)', fontWeight: 700 }}>{log.newTotalProgress}% Complete</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 6px 0' }}>{log.workCompleted}</p>
                  <small style={{ fontSize: '11px', color: 'var(--muted)' }}>Submitted by {log.submittedBy} • {log.date}</small>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
