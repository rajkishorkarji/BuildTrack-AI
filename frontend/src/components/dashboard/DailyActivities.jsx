import { ArrowRight } from 'lucide-react';
import { dailyActivities } from '../../data/dashboardMockData';

export default function DailyActivities() {
  return (
    <article className="panel activity-panel">
      <div className="panel-header">
        <div>
          <h3>Daily Site Activities</h3>
          <p>Live feed from all sites</p>
        </div>
        <button type="button" className="text-link">
          View all <ArrowRight size={14} />
        </button>
      </div>

      <div className="activity-list">
        {dailyActivities.map((item) => (
          <div key={`${item.name}-${item.time}`} className="activity-item">
            <div className={`activity-dot ${item.status}`} />
            <div className="activity-copy">
              <strong>{item.name}</strong>
              <span>{item.detail}</span>
            </div>
            <time>{item.time}</time>
          </div>
        ))}
      </div>
    </article>
  );
}