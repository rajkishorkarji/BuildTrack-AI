import { useEffect, useMemo, useState } from 'react';
import { Activity, AlertTriangle, Bot, BrainCircuit, RefreshCw, Target, TrendingUp, Users, Wrench } from 'lucide-react';
import projectService from '../../services/projectService';
import aiInsightService from '../../services/aiInsightService';

const money = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(Number(value || 0));

export default function AIInsights() {
  const [projects, setProjects] = useState([]);
  const [insights, setInsights] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [diagnostic, setDiagnostic] = useState(null);
  const [skill, setSkill] = useState('Mason');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [projectData, insightData] = await Promise.all([
        projectService.getProjects(),
        aiInsightService.list(),
      ]);
      setProjects(projectData);
      setInsights(insightData);
      if (!selectedProject && projectData[0]?.id) setSelectedProject(String(projectData[0].id));
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to load AI insights.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const run = async () => {
    if (!selectedProject) return;
    setRunning(true);
    setError('');
    try {
      const result = await aiInsightService.diagnose(Number(selectedProject));
      setDiagnostic(result);
      const latest = await aiInsightService.list(Number(selectedProject));
      setInsights(prev => [
        ...latest,
        ...prev.filter(item => String(item.projectId) !== String(selectedProject)),
      ]);
    } catch (e) {
      setError(e.response?.data?.message || 'AI diagnostics failed.');
    } finally {
      setRunning(false);
    }
  };

  const findWorkers = async () => {
    if (!selectedProject || !skill.trim()) return;
    setError('');
    try {
      setMatches(await aiInsightService.workerMatches(Number(selectedProject), skill.trim()));
    } catch (e) {
      setError(e.response?.data?.message || 'Worker matching failed.');
    }
  };

  const currentProject = projects.find(p => String(p.id) === String(selectedProject));
  const latestRisk = diagnostic?.overallRiskLevel || insights.find(i => String(i.projectId) === String(selectedProject))?.riskLevel || 'LOW';

  const stats = useMemo(() => {
    const all = diagnostic?.operational || {};
    return [
      { label: 'Project risk', value: latestRisk, icon: AlertTriangle },
      { label: 'Open tasks', value: all.openTasks ?? '—', icon: Target },
      { label: 'Overdue tasks', value: all.overdueTasks ?? '—', icon: TrendingUp },
      { label: 'Active workers', value: all.activeWorkers ?? '—', icon: Users },
    ];
  }, [diagnostic, latestRisk]);

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Bot size={14} /> AI Insights
          </p>
          <h1>Project intelligence</h1>
          <p className="muted">Diagnostics are calculated from live project, task, workforce, equipment and material data.</p>
        </div>
        <button className="primary-button" disabled={!selectedProject || running} onClick={run}>
          <BrainCircuit size={15} /> {running ? 'Analysing…' : 'Run AI Diagnostics'}
        </button>
      </section>

      {error && <div className="error-banner">{error}</div>}

      <div className="panel" style={{ marginTop: 20, padding: 20 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Project</label>
        <select value={selectedProject} onChange={(e) => { setSelectedProject(e.target.value); setDiagnostic(null); }} style={{ maxWidth: 520 }}>
          <option value="">Select a project</option>
          {projects.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 16, marginTop: 16 }}>
        {stats.map(({ label, value, icon: Icon }) => (
          <div className="panel" key={label} style={{ padding: 20 }}>
            <Icon size={18} />
            <div style={{ marginTop: 10, color: 'var(--muted)', fontSize: 12 }}>{label}</div>
            <strong style={{ display: 'block', fontSize: 22, marginTop: 4 }}>{value}</strong>
          </div>
        ))}
      </div>

      {diagnostic && (
        <div className="panel" style={{ marginTop: 16, padding: 24 }}>
          <h3 style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Activity size={18} /> {diagnostic.projectName}
          </h3>
          <p className="muted">Overall risk score: <strong>{diagnostic.overallRiskScore}</strong></p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
            <div>
              <strong>Cost forecast</strong>
              <p>Projected final cost: {money(diagnostic.cost?.projected_final_cost)}</p>
              <p>Projected overrun: {money(diagnostic.cost?.projected_overrun_amount)}</p>
              <p>Risk: {diagnostic.cost?.risk_level || '—'}</p>
            </div>
            <div>
              <strong>Schedule forecast</strong>
              <p>Risk: {diagnostic.delay?.risk_level || '—'}</p>
              <p>Risk score: {diagnostic.delay?.risk_score ?? '—'}</p>
              <p>Estimated delay: {diagnostic.delay?.estimated_delay_days ?? 0} days</p>
            </div>
            <div>
              <strong>Operations</strong>
              <p>Equipment issues: {diagnostic.operational?.equipmentIssues ?? 0}</p>
              <p>Low-stock materials: {diagnostic.operational?.lowStockMaterials ?? 0}</p>
            </div>
          </div>
          <div style={{ marginTop: 18, padding: 16, borderRadius: 12, background: 'var(--panel-soft)' }}>
            <strong>Recommendation</strong>
            <p>{diagnostic.recommendation}</p>
          </div>
        </div>
      )}

      <div className="panel" style={{ marginTop: 16, padding: 24 }}>
        <h3 style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Users size={18} /> AI worker matching</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Required skill</label>
            <input value={skill} onChange={(e) => setSkill(e.target.value)} placeholder="e.g. Mason" />
          </div>
          <button className="secondary-button" disabled={!selectedProject} onClick={findWorkers}>
            <Users size={14} /> Find best workers
          </button>
        </div>
        {matches.length > 0 && (
          <div style={{ marginTop: 14 }}>
            {matches.slice(0, 10).map(worker => (
              <div key={worker.worker_id || worker.workerId} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: 12, borderBottom: '1px solid var(--border)' }}>
                <div>
                  <strong>{worker.full_name || worker.fullName}</strong>
                  <div className="muted">{worker.skill_trade || worker.skillTrade} · {worker.status}</div>
                </div>
                <strong>{Number(worker.match_score ?? worker.matchScore ?? 0).toFixed(0)}%</strong>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="panel" style={{ marginTop: 16, padding: 24 }}>
        <h3 style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Wrench size={18} /> Stored AI insights</h3>
        {loading ? <p className="muted">Loading…</p> : insights.length === 0 ? (
          <p className="muted">No AI insights have been generated yet.</p>
        ) : insights.slice(0, 20).map(item => (
          <div key={item.id} style={{ padding: 14, borderBottom: '1px solid var(--border)' }}>
            <strong>{item.projectName}</strong>
            <div style={{ fontSize: 12, marginTop: 4 }}>{item.insightType} · {item.riskLevel} · score {item.riskScore}</div>
            <p style={{ marginBottom: 0 }}>{item.recommendation}</p>
          </div>
        ))}
        <button className="secondary-button" style={{ marginTop: 14 }} onClick={load}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {currentProject && (
        <p className="muted" style={{ marginTop: 12 }}>
          AI is scoped to <strong>{currentProject.name}</strong> and the current company tenant.
        </p>
      )}
    </div>
  );
}
