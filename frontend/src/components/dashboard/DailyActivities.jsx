import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import dashboardService from '../../services/dashboardService';

export default function DailyActivities() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const unsubscribe = dashboardService.subscribeToLiveFeed((data) => {
      setActivities(data);
    });
    return () => unsubscribe();
  }, []);

  return (
    <article className="panel activity-panel">
      <div className="panel-header">
        <div>
          <h3>Daily Site Activities</h3>
          <p>Live real-time feed from all sites</p>
        </div>
        <button type="button" className="text-link">
          View <ArrowRight size={14} />
        </button>
      </div>

      <div className="activity-list">
        {activities.map((item, idx) => (
          <div key={`${item.name}-${item.time}-${idx}`} className="activity-item">
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