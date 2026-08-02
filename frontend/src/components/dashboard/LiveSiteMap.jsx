import { zones } from '../../data/dashboardMockData';

export default function LiveSiteMap() {
  return (
    <article className="panel site-map-panel">
      <div className="panel-header">
        <div>
          <h3>Live Site Map</h3>
          <p>Real-time worker locations</p>
        </div>
        <span className="live-pill">LIVE</span>
      </div>

      <div className="site-map">
        <div className="site-map-grid">
          <span className="map-node map-blue" style={{ left: '18%', top: '18%' }}>Zone A</span>
          <span className="map-node map-green" style={{ left: '57%', top: '14%' }}>Zone B</span>
          <span className="map-node map-orange" style={{ left: '72%', top: '44%' }}>Zone C</span>
          <span className="map-node map-purple" style={{ left: '43%', top: '60%' }}>Zone D</span>
          <span className="map-node map-red" style={{ left: '15%', top: '52%' }}>Zone E</span>
        </div>
      </div>

      <div className="zone-row">
        {zones.map((zone) => (
          <div key={zone.name} className="zone-chip">
            <div className={`zone-badge zone-${zone.tone}`}>{zone.count}</div>
            <div>
              <strong>{zone.name}</strong>
              <span>Workers</span>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}