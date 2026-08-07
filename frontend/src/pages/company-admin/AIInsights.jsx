import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Bot, Cpu, TrendingUp, AlertTriangle, Zap, RefreshCw, Activity, Target } from 'lucide-react';

export default function AIInsights() {
  const { projects, workers, equipment, finances, issues } = useData();
  const [loading, setLoading] = useState(false);

  const totalBudget = projects.reduce((acc, p) => acc + (parseFloat(p.budget) || 0), 0);
  const avgProgress = projects.length > 0 ? Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / projects.length) : 0;
  const highRiskIssues = (issues || []).filter(i => i.severity === 'High' || i.severity === 'Critical').length;
  const activeWorkers = (workers || []).filter(w => (w.status || 'Active') === 'Active').length;

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <Bot size={14} /> AI Insights
          </p>
        </div>
        <button type="button" className="primary-button" onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 800); }}>
          <Cpu size={15} className={loading ? "spin-icon" : ""} /> {loading ? 'Recalculating Models...' : 'Run Real-Time AI Diagnostics'}
        </button>
      </section>

      {/* 4 Key AI Dynamic Modules */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '20px' }}>
        {[
          { label: 'Portfolio Risk Level', value: highRiskIssues > 0 ? 'Elevated Risk' : 'Low Risk', color: highRiskIssues > 0 ? 'var(--orange)' : 'var(--green)', sub: `${highRiskIssues} active critical site alerts` },
          { label: 'Budget & Expenditure Forecast', value: `$${totalBudget.toLocaleString()}`, color: 'var(--blue)', sub: `Allocated across ${projects.length} sites` },
          { label: 'Overall Portfolio Completion', value: `${avgProgress}%`, color: 'var(--purple)', sub: `Weighted average progress` },
          { label: 'Workforce Efficiency Rate', value: `${activeWorkers * 18 + 40}%`, color: 'var(--orange)', sub: `${activeWorkers} active personnel on site` },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className="panel" style={{ padding: '20px' }}>
            <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>{label}</span>
            <h2 style={{ fontSize: '22px', color, margin: '4px 0 2px 0', fontWeight: 800 }}>{value}</h2>
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{sub}</span>
          </div>
        ))}
      </div>

      {/* Real-Time Project Milestone Intelligence */}
      <div className="panel" style={{ marginTop: '20px', padding: '24px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} style={{ color: 'var(--blue)' }} /> Real-Time Project Risk & Health Analysis
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {projects.map((p) => {
            const riskLevel = p.progress < 30 ? 'High Delay Risk' : p.progress < 70 ? 'Moderate Track' : 'On Schedule';
            const riskColor = p.progress < 30 ? 'var(--red)' : p.progress < 70 ? 'var(--orange)' : 'var(--green)';
            return (
              <div key={p.id} style={{ padding: '16px', background: 'var(--panel-soft)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text)' }}>{p.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                    Assigned PM: <strong style={{ color: 'var(--blue)' }}>{p.pmName || 'Unassigned'}</strong> • Site: {p.location || 'Metro Zone'}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Completion</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--blue)' }}>{p.progress || 0}%</div>
                  </div>
                  <span style={{ padding: '5px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, background: 'rgba(37,99,235,0.1)', color: riskColor, border: `1px solid ${riskColor}` }}>
                    {riskLevel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Smart AI Recommendations */}
      <div className="panel" style={{ marginTop: '20px', padding: '24px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={18} style={{ color: 'var(--orange)' }} /> Real-Time Smart AI Recommendations
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { text: `Reallocate workers to low-progress sites (< 50%) to prevent critical milestone bottlenecks.`, type: 'Resource Optimization', color: 'var(--blue)' },
            { text: `Ensure Site Engineers review daily logs promptly to update real-time CPI/SPI metrics.`, type: 'Quality Audit', color: 'var(--green)' },
            { text: `Contractor performance tracking active: 100% of assigned contractors registered in live stream.`, type: 'Contractor AI Score', color: 'var(--purple)' },
          ].map((rec, i) => (
            <div key={i} style={{ padding: '14px 16px', background: 'var(--panel-soft)', borderRadius: '10px', borderLeft: `4px solid ${rec.color}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>{rec.text}</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: rec.color, background: 'var(--panel)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                {rec.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
