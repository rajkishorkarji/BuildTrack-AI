import { projectProgress } from '../../data/dashboardMockData';

export default function ProjectProgress() {
  return (
    <article className="panel progress-panel">
      <div className="panel-header">
        <div>
          <h3>Project Progress</h3>
          <p>Budget vs actual cost</p>
        </div>
        <div className="legend">
          <span><i className="legend-line legend-blue" />Budget</span>
          <span><i className="legend-line legend-indigo" />Actual</span>
          <span><i className="legend-line legend-green" />Done %</span>
        </div>
      </div>

      <div className="progress-list">
        {projectProgress.map((project) => (
          <div key={project.name} className="progress-row">
            <div className="progress-meta">
              <strong>{project.name}</strong>
              <span>{project.value}%</span>
            </div>
            <div className="progress-bars">
              <div className="bar bar-budget" style={{ width: `${Math.min(100, project.value + 16)}%` }} />
              <div className="bar bar-actual" style={{ width: `${project.value}%` }} />
              <div className="bar bar-done" style={{ width: `${Math.max(8, project.value - 6)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}