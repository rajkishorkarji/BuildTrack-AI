import { useEffect, useState } from 'react';
import { Activity, Bot, BrainCircuit, Building2, RefreshCw, ShieldCheck } from 'lucide-react';
import aiInsightService from '../../services/aiInsightService';

const money = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(Number(value || 0));

export default function SuperAdminAIInsights() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      setInsights(await aiInsightService.list());
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to load platform AI insights.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const run = async () => {
    setRunning(true);
    setError('');
    try {
      await load();
    } finally {
      setRunning(false);
    }
  };

  const highRisk = insights.filter(i => ['HIGH', 'CRITICAL'].includes(i.riskLevel)).length;
  const averageRisk = insights.length
    ? Math.round(insights.reduce((sum, item) => sum + Number(item.riskScore || 0), 0) / insights.length)
    : 0;

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Bot size={14} /> AI Insights
          </p>
          </div>
        <button className="primary-button" onClick={run} disabled={running}>
          <BrainCircuit size={15} /> {running ? 'Refreshing…' : 'Refresh AI Intelligence'}
        </button>
      </section>

      {error && <div className="error-banner">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginTop: 20 }}>
        <div className="panel" style={{ padding: 20 }}><ShieldCheck size={18} /><div className="muted">High / critical insights</div><strong style={{ fontSize: 24 }}>{highRisk}</strong></div>
        <div className="panel" style={{ padding: 20 }}><Activity size={18} /><div className="muted">Average risk score</div><strong style={{ fontSize: 24 }}>{averageRisk}</strong></div>
        <div className="panel" style={{ padding: 20 }}><Building2 size={18} /><div className="muted">Projects analysed</div><strong style={{ fontSize: 24 }}>{new Set(insights.map(i => i.projectId)).size}</strong></div>
      </div>

      <div className="panel" style={{ marginTop: 20, padding: 24 }}>
        <h3>Latest platform insights</h3>
        {loading ? <p className="muted">Loading…</p> : insights.length === 0 ? (
          <p className="muted">No AI diagnostics have been generated yet.</p>
        ) : insights.slice(0, 50).map(item => (
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
    </div>
  );
}
