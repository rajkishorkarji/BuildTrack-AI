import { Gauge, Download, BarChart2, PieChart } from 'lucide-react';

export default function Reports() {
  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow">Executive Analytics</p>
          <h1>Project Completion & Performance Reports</h1>
        </div>
        <button type="button" className="primary-button" onClick={() => alert("Downloading PDF Project Report...")}>
          <Download size={16} /> Export Report (.PDF)
        </button>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart2 size={20} style={{ color: 'var(--blue)' }} /> Revenue & Budget Burn Rate
          </h3>
          <div style={{ background: 'var(--panel-soft)', height: '220px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '14px' }}>
            [ Sales vs. Labor Costs Performance Chart: $162,600 Budget / $132,600 Actual Spent ]
          </div>
        </div>

        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={20} style={{ color: 'var(--green)' }} /> Resource Utilization
          </h3>
          <div style={{ background: 'var(--panel-soft)', height: '220px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '14px' }}>
            [ Workforce Utilization: 92.4% Active | Equipment Fleet: 87.5% Operational ]
          </div>
        </div>
      </div>
    </div>
  );
}
