import { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  Send,
  Upload,
  Calendar,
  Layers,
  Clock,
} from 'lucide-react';

export default function DailyProgressReport() {
  const [progressPercent, setProgressPercent] = useState('80');
  const [siteNotes, setSiteNotes] = useState('Completed Floor 14 riser shaft concrete pour. Slump tests passed (Grade M40). Rebar shuttering 100% verified.');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [notice, setNotice] = useState('');

  const notify = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3500);
  };

  const handleSubmitReport = (e) => {
    e.preventDefault();
    setReportSubmitted(true);
    notify("Submitted Today's Engineering Report to Project Manager (Vikram Nair)!");
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <p className="eyebrow" style={{ color: 'var(--blue)', fontWeight: 600 }}>FIELD DAILY REPORTING</p>
        <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Daily Site Progress & Engineering Logs</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '4px' }}>
          Site Engineer desk to record daily completion percentages, log engineering observations, and dispatch daily reports to PM.
        </p>
      </div>

      {notice && (
        <div style={{ background: 'rgba(36, 196, 107, 0.15)', border: '1px solid var(--green)', color: 'var(--green)', padding: '12px 18px', borderRadius: '10px', fontWeight: 600, fontSize: '14px' }}>
          {notice}
        </div>
      )}

      {/* Progress Form */}
      <div className="panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} style={{ color: 'var(--blue)' }} /> Today&apos;s Engineering Progress Submission
          </h3>
          <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600 }}>Date: 2026-08-03</span>
        </div>

        <form onSubmit={handleSubmitReport} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
              Work Completion Percentage for Today (%): <strong style={{ color: 'var(--blue)' }}>{progressPercent}% Completed</strong>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={progressPercent}
              onChange={(e) => setProgressPercent(e.target.value)}
              style={{ width: '100%', accentColor: 'var(--blue)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
              <span>0% (Not Started)</span>
              <span>50% (Halfway)</span>
              <span>100% (Shift Work Completed)</span>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>Daily Site Engineering Notes & Quality Log</label>
            <textarea
              rows={4}
              value={siteNotes}
              onChange={(e) => setSiteNotes(e.target.value)}
              placeholder="Record slump test results, concrete grades, shuttering status, safety checks..."
              style={{ width: '100%', padding: '12px', marginTop: '4px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--panel-soft)', padding: '16px', borderRadius: '10px' }}>
            <div>
              <strong style={{ fontSize: '14px', display: 'block' }}>Attach Site Inspection Photo Log</strong>
              <span style={{ color: 'var(--muted)', fontSize: '12px' }}>2 geo-tagged photos attached from today&apos;s field inspection</span>
            </div>
            <button
              type="button"
              className="secondary-button"
              style={{ padding: '6px 12px', fontSize: '12px' }}
              onClick={() => notify('Photo log linked to today\'s report!')}
            >
              <Upload size={14} /> Attach Photos
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button
              type="submit"
              className="primary-button"
              style={{ background: 'var(--green)', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Send size={16} /> Submit Daily Report to Project Manager
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
