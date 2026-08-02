import { stats } from '../../data/dashboardMockData';

function ToneIcon({ tone }) {
  return <div className={`tone-icon tone-${tone}`} />;
}

export default function DashboardStats() {
  return (
    <section className="stats-grid">
      {stats.map((stat) => (
        <article key={stat.label} className={`stat-card stat-${stat.tone}`}>
          <div className="stat-card-top">
            <div>
              <p>{stat.label}</p>
              <h2>{stat.value}</h2>
            </div>
            <ToneIcon tone={stat.tone} />
          </div>
          <div className="stat-card-meta">
            <span>{stat.delta}</span>
            <small>{stat.subtitle}</small>
          </div>
        </article>
      ))}
    </section>
  );
}