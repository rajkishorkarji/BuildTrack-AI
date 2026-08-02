import { AlertTriangle, CheckCircle2, CircleAlert } from 'lucide-react';

export default function OverallCompletion() {
  const completion = 88;

  return (
    <article className="panel completion-panel">
      <div className="panel-header">
        <div>
          <h3>Overall Completion</h3>
          <p>Across 42 active projects</p>
        </div>
      </div>

      <div className="ring-wrap">
        <div
          className="completion-ring"
          style={{ background: `conic-gradient(var(--blue) ${completion * 3.6}deg, #e7eefb 0)` }}
        >
          <div className="completion-ring-inner">
            <strong>{completion}%</strong>
            <span>Complete</span>
          </div>
        </div>
      </div>

      <div className="completion-stats">
        <div className="mini-stat">
          <CheckCircle2 size={16} />
          <strong>36</strong>
          <span>On Track</span>
        </div>
        <div className="mini-stat">
          <AlertTriangle size={16} />
          <strong>4</strong>
          <span>At Risk</span>
        </div>
        <div className="mini-stat">
          <CircleAlert size={16} />
          <strong>2</strong>
          <span>Delayed</span>
        </div>
      </div>
    </article>
  );
}