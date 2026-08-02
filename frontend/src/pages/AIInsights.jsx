import { useState } from 'react';
import { Building2, AlertTriangle, TrendingUp, Cpu, Lightbulb, CheckCircle2 } from 'lucide-react';

export default function AIInsights() {
  const [delayRisk] = useState(34.5);
  const [costRisk] = useState(12.0);
  const [prodScore] = useState(92.4);

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow">Predictive Analytics Engine</p>
          <h1>AI Insights & Risk Optimization</h1>
        </div>
        <button type="button" className="primary-button" style={{ background: 'linear-gradient(135deg, var(--purple), var(--blue))' }}>
          <Cpu size={16} /> Re-run ML Inference
        </button>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', color: 'var(--muted)', fontWeight: 600 }}>Schedule Delay Risk</span>
            <AlertTriangle size={18} style={{ color: 'var(--orange)' }} />
          </div>
          <h2 style={{ fontSize: '32px', color: 'var(--orange)' }}>{delayRisk}%</h2>
          <span style={{ fontSize: '13px', color: 'var(--muted)', display: 'block', marginTop: '6px' }}>Est. 4 days potential variance on Floor 14</span>
        </div>

        <div className="panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', color: 'var(--muted)', fontWeight: 600 }}>Cost Overrun Risk</span>
            <TrendingUp size={18} style={{ color: 'var(--green)' }} />
          </div>
          <h2 style={{ fontSize: '32px', color: 'var(--green)' }}>{costRisk}%</h2>
          <span style={{ fontSize: '13px', color: 'var(--muted)', display: 'block', marginTop: '6px' }}>Within 3% material cost tolerance</span>
        </div>

        <div className="panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', color: 'var(--muted)', fontWeight: 600 }}>Worker Productivity Index</span>
            <Cpu size={18} style={{ color: 'var(--purple)' }} />
          </div>
          <h2 style={{ fontSize: '32px', color: 'var(--purple)' }}>{prodScore} / 100</h2>
          <span style={{ fontSize: '13px', color: 'var(--muted)', display: 'block', marginTop: '6px' }}>Top performance across 786 workers</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lightbulb size={20} style={{ color: 'var(--orange)' }} /> Smart AI Recommendations
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'var(--panel-soft)', padding: '16px', borderRadius: '12px', borderLeft: '4px solid var(--orange)' }}>
              <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text)', marginBottom: '4px' }}>
                Resource Re-allocation for HVAC Ducting
              </div>
              <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: '1.5' }}>
                Machine learning model predicts a 4-day schedule bottleneck in 02190 Core Drilling on Floor 14. Recommend re-assigning 4 masons from Zone B to assist concrete curing.
              </p>
            </div>

            <div style={{ background: 'var(--panel-soft)', padding: '16px', borderRadius: '12px', borderLeft: '4px solid var(--blue)' }}>
              <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text)', marginBottom: '4px' }}>
                Concrete Pump Preventive Maintenance
              </div>
              <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: '1.5' }}>
                Mobile Concrete Pump 5000 is showing a 78% probability of pressure seal degradation. Schedule maintenance before foundation slab pour on July 5th.
              </p>
            </div>

            <div style={{ background: 'var(--panel-soft)', padding: '16px', borderRadius: '12px', borderLeft: '4px solid var(--green)' }}>
              <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text)', marginBottom: '4px' }}>
                Bulk Material Purchase Optimization
              </div>
              <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: '1.5' }}>
                Steel reinforcement prices are projected to rise by 4.2% next month. Placing advance purchase order #INV-2025-004 now saves approximately $3,200.
              </p>
            </div>
          </div>
        </div>

        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Model Health & Inputs</h3>
          <div style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--muted)' }}>Inference Engine</span>
              <strong>Python ML v2.4</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--muted)' }}>Dataset Size</span>
              <strong>12,450 Site Logs</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--muted)' }}>Accuracy Metric</span>
              <strong>94.8% F1 Score</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--muted)' }}>Last Training Run</span>
              <strong>Today, 06:00 AM</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
