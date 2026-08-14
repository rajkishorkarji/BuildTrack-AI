import { useEffect, useMemo, useState } from 'react';
import { Activity, AlertTriangle, Bot, BrainCircuit, RefreshCw, Target, TrendingUp, Users, Wrench, ShieldAlert, ShieldCheck, Info } from 'lucide-react';
import projectService from '../../services/projectService';
import aiInsightService from '../../services/aiInsightService';
import { realtimeBus } from '../../services/api';

const money = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(Number(value || 0));

const RISK_META = {
  LOW: { color: 'var(--green)', bg: 'rgba(34,197,94,0.12)', icon: ShieldCheck, label: 'Low Risk' },
  MEDIUM: { color: 'var(--orange)', bg: 'rgba(245,158,11,0.12)', icon: ShieldAlert, label: 'Medium Risk' },
  HIGH: { color: 'var(--red)', bg: 'rgba(239,68,68,0.12)', icon: AlertTriangle, label: 'High Risk' },
  CRITICAL: { color: '#a21caf', bg: 'rgba(162,28,175,0.12)', icon: AlertTriangle, label: 'Critical Risk' },
};

function getRiskMeta(level) {
  const key = String(level || 'LOW').toUpperCase();
  return RISK_META[key] || RISK_META.LOW;
}

export default function AIInsights() {
  const [projects, setProjects] = useState([]);
  const [insights, setInsights] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [diagnostic, setDiagnostic] = useState(null);

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

  useEffect(() => {
    load();
    const unsub = realtimeBus.subscribe('SERVER_UPDATE', () => load());
    return () => unsub();
  }, []);

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



  const currentProject = projects.find(p => String(p.id) === String(selectedProject));
  const latestRisk = diagnostic?.overallRiskLevel || insights.find(i => String(i.projectId) === String(selectedProject))?.riskLevel || 'LOW';
  const riskMeta = getRiskMeta(latestRisk);
  const RiskIcon = riskMeta.icon;

  const stats = useMemo(() => {
    const all = diagnostic?.operational || {};
    return [
      { label: 'Project Risk Level', value: latestRisk, icon: AlertTriangle, meta: riskMeta },
      { label: 'Open Tasks', value: all.openTasks ?? '—', icon: Target, meta: null },
      { label: 'Overdue Tasks', value: all.overdueTasks ?? '—', icon: TrendingUp, meta: null },
      { label: 'Active Workers', value: all.activeWorkers ?? '—', icon: Users, meta: null },
    ];
  }, [diagnostic, latestRisk]);

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--blue)', fontWeight: 700 }}>
            <Bot size={14} /> AI Insights
          </p>
           </div>
        <button className="primary-button" disabled={!selectedProject || running} onClick={run}>
          <BrainCircuit size={15} /> {running ? 'Analysing…' : 'Run AI Diagnostics'}
        </button>
      </section>

      {error && (
        <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, color: 'var(--red)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      {/* Project Selector */}
      <div className="panel" style={{ marginTop: 20, padding: 20 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--muted)' }}>Select Project for Diagnostics</label>
        <select
          value={selectedProject}
          onChange={(e) => { setSelectedProject(e.target.value); setDiagnostic(null); }}
          style={{ maxWidth: 520, width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 }}
        >
          <option value="">Select a project</option>
          {projects.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}
        </select>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 16, marginTop: 16 }}>
        {stats.map(({ label, value, icon: Icon, meta }) => (
          <div className="panel" key={label} style={{
            padding: 20,
            border: meta ? `1px solid ${meta.color}40` : '1px solid var(--border)',
            background: meta ? meta.bg : undefined,
          }}>
            <Icon size={18} style={{ color: meta ? meta.color : 'var(--blue)' }} />
            <div style={{ marginTop: 10, color: 'var(--muted)', fontSize: 12, fontWeight: 600 }}>{label}</div>
            <strong style={{
              display: 'block', fontSize: 22, marginTop: 4,
              color: meta ? meta.color : 'var(--text)',
            }}>{value}</strong>
          </div>
        ))}
      </div>

      {/* Diagnostic Results */}
      {diagnostic && (
        <div className="panel" style={{ marginTop: 16, padding: 24 }}>
          <h3 style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '0 0 4px' }}>
            <Activity size={18} style={{ color: 'var(--blue)' }} /> {diagnostic.projectName}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <span style={{ padding: '4px 12px', borderRadius: 10, background: riskMeta.bg, color: riskMeta.color, fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <RiskIcon size={12} /> {riskMeta.label}
            </span>
            <span style={{ color: 'var(--muted)', fontSize: 13 }}>Overall risk score: <strong>{diagnostic.overallRiskScore}</strong></span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
            <div style={{ padding: 16, background: 'var(--panel-soft)', borderRadius: 10 }}>
              <strong style={{ fontSize: 13 }}>💰 Cost Forecast</strong>
              <div style={{ marginTop: 8, fontSize: 13, color: 'var(--muted)', lineHeight: 1.8 }}>
                <div>Projected final cost: <strong style={{ color: 'var(--text)' }}>{money(diagnostic.cost?.projected_final_cost)}</strong></div>
                <div>Projected overrun: <strong style={{ color: diagnostic.cost?.projected_overrun_amount > 0 ? 'var(--red)' : 'var(--green)' }}>{money(diagnostic.cost?.projected_overrun_amount)}</strong></div>
                <div>Risk: <span style={{ color: getRiskMeta(diagnostic.cost?.risk_level).color, fontWeight: 700 }}>{diagnostic.cost?.risk_level || '—'}</span></div>
              </div>
            </div>
            <div style={{ padding: 16, background: 'var(--panel-soft)', borderRadius: 10 }}>
              <strong style={{ fontSize: 13 }}>📅 Schedule Forecast</strong>
              <div style={{ marginTop: 8, fontSize: 13, color: 'var(--muted)', lineHeight: 1.8 }}>
                <div>Risk: <span style={{ color: getRiskMeta(diagnostic.delay?.risk_level).color, fontWeight: 700 }}>{diagnostic.delay?.risk_level || '—'}</span></div>
                <div>Risk score: <strong style={{ color: 'var(--text)' }}>{diagnostic.delay?.risk_score ?? '—'}</strong></div>
                <div>Est. delay: <strong style={{ color: (diagnostic.delay?.estimated_delay_days || 0) > 0 ? 'var(--orange)' : 'var(--green)' }}>{diagnostic.delay?.estimated_delay_days ?? 0} days</strong></div>
              </div>
            </div>
            <div style={{ padding: 16, background: 'var(--panel-soft)', borderRadius: 10 }}>
              <strong style={{ fontSize: 13 }}>⚙️ Operations</strong>
              <div style={{ marginTop: 8, fontSize: 13, color: 'var(--muted)', lineHeight: 1.8 }}>
                <div>Equipment issues: <strong style={{ color: (diagnostic.operational?.equipmentIssues || 0) > 0 ? 'var(--orange)' : 'var(--green)' }}>{diagnostic.operational?.equipmentIssues ?? 0}</strong></div>
                <div>Low-stock materials: <strong style={{ color: (diagnostic.operational?.lowStockMaterials || 0) > 0 ? 'var(--orange)' : 'var(--green)' }}>{diagnostic.operational?.lowStockMaterials ?? 0}</strong></div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 18, padding: 16, borderRadius: 12, background: 'rgba(37,99,235,0.07)', border: '1px solid rgba(37,99,235,0.15)' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <Info size={15} style={{ color: 'var(--blue)' }} />
              <strong style={{ fontSize: 13, color: 'var(--blue)' }}>AI Recommendation</strong>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.6 }}>{diagnostic.recommendation}</p>
          </div>
        </div>
      )}



      {/* Stored Insights */}
      <div className="panel" style={{ marginTop: 16, padding: 24 }}>
        <h3 style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '0 0 16px' }}>
          <Wrench size={18} style={{ color: 'var(--blue)' }} /> Stored AI Insights
        </h3>
        {loading ? (
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>Loading insights...</p>
        ) : insights.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <BrainCircuit size={32} style={{ color: 'var(--muted)', marginBottom: 10 }} />
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>No AI insights generated yet. Select a project and run diagnostics.</p>
          </div>
        ) : (
          insights.slice(0, 20).map(item => {
            const meta = getRiskMeta(item.riskLevel);
            return (
              <div key={item.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <strong style={{ fontSize: 14 }}>{item.projectName}</strong>
                  <span style={{ padding: '3px 10px', borderRadius: 8, background: meta.bg, color: meta.color, fontSize: 11, fontWeight: 700 }}>
                    {meta.label} · score {item.riskScore}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>{item.insightType}</div>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>{item.recommendation}</p>
              </div>
            );
          })
        )}
        <button className="secondary-button" style={{ marginTop: 14 }} onClick={load}>
          <RefreshCw size={14} /> Refresh Insights
        </button>
      </div>

      {currentProject && (
        <p style={{ marginTop: 12, color: 'var(--muted)', fontSize: 12 }}>
          AI diagnostics are scoped to <strong>{currentProject.name}</strong> and your company tenant.
        </p>
      )}
    </div>
  );
}
