import { useEffect, useState, useMemo } from 'react';
import { Activity, AlertTriangle, Bot, BrainCircuit, Building2, RefreshCw, ShieldAlert, ShieldCheck, Clock } from 'lucide-react';
import aiInsightService from '../../services/aiInsightService';
import projectService from '../../services/projectService';
import { realtimeBus } from '../../services/api';

const RISK_META = {
  LOW: { color: 'var(--green)', bg: 'rgba(34,197,94,0.12)', label: 'Low Risk' },
  MEDIUM: { color: 'var(--orange)', bg: 'rgba(245,158,11,0.12)', label: 'Medium Risk' },
  HIGH: { color: 'var(--red)', bg: 'rgba(239,68,68,0.12)', label: 'High Risk' },
  CRITICAL: { color: '#a21caf', bg: 'rgba(162,28,175,0.12)', label: 'Critical Risk' },
};

function getRiskMeta(level, score) {
  const key = String(level || '').toUpperCase();
  if (key === 'CRITICAL' || score >= 80) return RISK_META.CRITICAL;
  if (key === 'HIGH' || score >= 60) return RISK_META.HIGH;
  if (key === 'MEDIUM' || score >= 35) return RISK_META.MEDIUM;
  return RISK_META.LOW;
}

export default function SuperAdminAIInsights() {
  const [insights, setInsights] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [insightData, projectData] = await Promise.all([
        aiInsightService.list(),
        projectService.list().catch(() => []),
      ]);
      setInsights(insightData || []);
      setProjects(projectData || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to load platform AI insights.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const unsub = realtimeBus.subscribe('SERVER_UPDATE', () => {
      load();
    });
    return () => unsub();
  }, []);

  const run = async () => {
    setRunning(true);
    setError('');
    try {
      // Run AI diagnostics for all available platform projects to compute fresh real-time insights
      if (projects.length > 0) {
        await Promise.allSettled(projects.map(p => aiInsightService.diagnose(p.id)));
      }
      await load();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to refresh AI intelligence.');
    } finally {
      setRunning(false);
    }
  };

  const highRisk = useMemo(() => {
    return insights.filter(i => {
      const level = String(i.riskLevel || '').toUpperCase();
      const score = Number(i.riskScore || 0);
      return level === 'HIGH' || level === 'CRITICAL' || level === 'URGENT' || score >= 60;
    }).length;
  }, [insights]);

  const averageRisk = useMemo(() => {
    return insights.length
      ? Math.round(insights.reduce((sum, item) => sum + Number(item.riskScore || 0), 0) / insights.length)
      : 0;
  }, [insights]);

  const analyzedProjectsCount = useMemo(() => {
    return new Set(insights.map(i => i.projectId)).size;
  }, [insights]);

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--blue)', fontWeight: 700 }}>
            <Bot size={14} /> AI Platform Diagnostics
          </p>
        </div>
        <button className="primary-button" onClick={run} disabled={running}>
          <BrainCircuit size={15} /> {running ? 'Analysing Platform Projects...' : 'Refresh AI Intelligence'}
        </button>
      </section>

      {error && (
        <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, color: 'var(--red)', fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16, marginTop: 20 }}>
        <div className="panel" style={{ padding: 20, borderLeft: '4px solid var(--red)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 700 }}>High / Critical Insights</span>
            <ShieldAlert size={18} style={{ color: 'var(--red)' }} />
          </div>
          <strong style={{ fontSize: 28, color: highRisk > 0 ? 'var(--red)' : 'var(--green)', marginTop: 8, display: 'block', fontWeight: 800 }}>
            {highRisk}
          </strong>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>
            {highRisk > 0 ? 'Action required on critical project risks' : 'No critical risk anomalies detected'}
          </span>
        </div>

        <div className="panel" style={{ padding: 20, borderLeft: '4px solid var(--blue)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 700 }}>Average Risk Score</span>
            <Activity size={18} style={{ color: 'var(--blue)' }} />
          </div>
          <strong style={{ fontSize: 28, color: 'var(--blue)', marginTop: 8, display: 'block', fontWeight: 800 }}>
            {averageRisk} / 100
          </strong>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>Platform-wide weighted risk index</span>
        </div>

        <div className="panel" style={{ padding: 20, borderLeft: '4px solid var(--purple)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 700 }}>Projects Analysed</span>
            <Building2 size={18} style={{ color: 'var(--purple)' }} />
          </div>
          <strong style={{ fontSize: 28, color: 'var(--purple)', marginTop: 8, display: 'block', fontWeight: 800 }}>
            {analyzedProjectsCount}
          </strong>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>Active tenant project diagnostic feeds</span>
        </div>
      </div>

      {/* Insights Feed */}
      <div className="panel" style={{ marginTop: 20, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>Latest Platform AI Insights</h3>
          <button className="secondary-button" onClick={load} disabled={loading} style={{ fontSize: 12, padding: '6px 12px' }}>
            <RefreshCw size={13} style={loading ? { animation: 'spin 1s linear infinite' } : {}} /> Refresh Feed
          </button>
        </div>

        {loading ? (
          <p style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: '30px 0' }}>Loading real-time platform insights...</p>
        ) : insights.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <BrainCircuit size={36} style={{ color: 'var(--muted)', marginBottom: 12 }} />
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>No AI diagnostics generated yet. Click "Refresh AI Intelligence" to analyze platform projects.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {insights.slice(0, 50).map(item => {
              const meta = getRiskMeta(item.riskLevel, Number(item.riskScore || 0));
              const createdAt = item.createdAt;
              return (
                <div key={item.id} style={{ padding: 16, border: `1px solid ${meta.color}30`, background: 'var(--panel-soft)', borderRadius: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <strong style={{ fontSize: 14 }}>{item.projectName || `Project #${item.projectId}`}</strong>
                      <span style={{ padding: '2px 8px', borderRadius: 6, background: meta.bg, color: meta.color, fontSize: 10, fontWeight: 800 }}>
                        {item.insightType || 'HEALTH'}
                      </span>
                    </div>
                    <span style={{ padding: '4px 10px', borderRadius: 8, background: meta.bg, color: meta.color, fontSize: 11, fontWeight: 800 }}>
                      {meta.label} · Score {item.riskScore}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 6px 0', fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>{item.recommendation}</p>
                  {createdAt && (
                    <div style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={10} /> Analyzed: {new Date(createdAt).toLocaleString('en-IN')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
