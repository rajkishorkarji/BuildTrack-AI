import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, TrendingUp, Cpu, Lightbulb, Bot, ShieldAlert } from 'lucide-react';
import aiInsightService from '../services/aiInsightService';

export default function AIInsights() {
  const { user } = useAuth();
  const role = user?.role || 'SUPER_ADMIN';

  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = aiInsightService.subscribeToInsights((data) => {
      setInsights(data);
    });
    return () => unsubscribe();
  }, []);

  if (role === 'SITE_ENGINEER' || role === 'CONTRACTOR' || role === 'WORKER') {
    return (
      <div className="dashboard-page">
        <div className="panel" style={{ padding: '32px', textAlign: 'center', marginTop: '20px' }}>
          <ShieldAlert size={48} style={{ color: 'var(--orange)', marginBottom: '12px' }} />
          <h2>AI Insights Direct Access Restricted</h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px', maxWidth: '520px', margin: '8px auto 0 auto' }}>
            Direct AI model analytics are reserved for Project Managers, Company Admins, and Super Admins. Relevant field alerts are automatically dispatched to your dashboard and notifications feed.
          </p>
        </div>
      </div>
    );
  }

  const handleRunInference = async () => {
    setLoading(true);
    await aiInsightService.runAnalysis();
    setLoading(false);
  };

  return (
    <div className="dashboard-page">
      {/* Hero Header */}
      <section className="hero-row">
        <div>
          <p className="eyebrow">Predictive ML Telemetry & Optimization</p>
          <h1>AI Insights Hub</h1>
        </div>
        <button
          type="button"
          className="primary-button"
          onClick={handleRunInference}
          disabled={loading}
          style={{ background: 'linear-gradient(135deg, var(--purple), var(--blue))' }}
        >
          <Cpu size={16} /> {loading ? 'Running ML Inference...' : 'Re-run ML Inference'}
        </button>
      </section>

      {/* KPI Prediction Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px', marginTop: '20px' }}>
        <div className="panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', color: 'var(--muted)', fontWeight: 600 }}>1. Schedule Delay Prediction</span>
            <AlertTriangle size={18} style={{ color: 'var(--orange)' }} />
          </div>
          <h2 style={{ fontSize: '32px', color: 'var(--orange)' }}>0% Risk</h2>
          <span style={{ fontSize: '13px', color: 'var(--muted)', display: 'block', marginTop: '6px' }}>
            —
          </span>
        </div>

        <div className="panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', color: 'var(--muted)', fontWeight: 600 }}>2. Cost Overrun Prediction</span>
            <TrendingUp size={18} style={{ color: 'var(--green)' }} />
          </div>
          <h2 style={{ fontSize: '32px', color: 'var(--green)' }}>0% Risk</h2>
          <span style={{ fontSize: '13px', color: 'var(--muted)', display: 'block', marginTop: '6px' }}>
            —
          </span>
        </div>

        <div className="panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', color: 'var(--muted)', fontWeight: 600 }}>3. Worker Productivity Prediction</span>
            <Bot size={18} style={{ color: 'var(--purple)' }} />
          </div>
          <h2 style={{ fontSize: '32px', color: 'var(--purple)' }}>0 / 100</h2>
          <span style={{ fontSize: '13px', color: 'var(--muted)', display: 'block', marginTop: '6px' }}>
            —
          </span>
        </div>
      </div>

      {/* Recommendations Feed & Model Health */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lightbulb size={20} style={{ color: 'var(--orange)' }} /> 4. Smart AI Recommendations Feed
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'var(--panel-soft)', padding: '16px', borderRadius: '12px', borderLeft: '4px solid var(--blue)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <strong style={{ fontSize: '15px' }}>—</strong>
                <span className="schedule-pill">—</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
                —
              </p>
            </div>

            <div style={{ background: 'var(--panel-soft)', padding: '16px', borderRadius: '12px', borderLeft: '4px solid var(--purple)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <strong style={{ fontSize: '15px' }}>—</strong>
                <span className="schedule-pill">—</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
                —
              </p>
            </div>

            <div style={{ background: 'var(--panel-soft)', padding: '16px', borderRadius: '12px', borderLeft: '4px solid var(--orange)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <strong style={{ fontSize: '15px' }}>—</strong>
                <span className="schedule-pill" style={{ background: 'rgba(245, 154, 22, 0.15)', color: 'var(--orange)' }}>—</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
                —
              </p>
            </div>
          </div>
        </div>

        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Model Health & Inputs</h3>
          <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--muted)' }}>Inference Engine</span>
              <strong>—</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--muted)' }}>Dataset Telemetry</span>
              <strong>0 Site Logs</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--muted)' }}>Model Accuracy</span>
              <strong>0% F1 Score</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--muted)' }}>Inference Sync</span>
              <strong>—</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
