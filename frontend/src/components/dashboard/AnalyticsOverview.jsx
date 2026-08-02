import { analytics } from '../../data/dashboardMockData';

export default function AnalyticsOverview() {
  return (
    <section className="analytics-section">
      <div className="analytics-header">
        <h3>Analytics Overview</h3>
        <div className="range-tabs">
          <button type="button">7D</button>
          <button type="button" className="active">30D</button>
          <button type="button">90D</button>
          <button type="button">1Y</button>
        </div>
      </div>

      <div className="analytics-grid">
        {analytics.map((item) => (
          <article key={item.label} className="analytics-card">
            <div className="analytics-card-head">
              <span>{item.label}</span>
              <small className={`trend-${item.trend.startsWith('-') ? 'down' : 'up'}`}>{item.trend}</small>
            </div>
            <strong>{item.value}</strong>
            <div className={`sparkline spark-${item.tone}`} />
          </article>
        ))}
      </div>
    </section>
  );
}