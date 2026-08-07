import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  Building2, FolderKanban, Users, CreditCard, Bot, TrendingUp,
  BarChart3, Calendar, ArrowUpRight, ArrowDownRight, Shield, Download,
  Activity, CheckCircle2, Clock, Wrench, Package, AlertTriangle
} from 'lucide-react';

export default function CompanyAdminDashboard() {
  const { projects, workers, equipment, finances, issues, subscriptions } = useData();
  const { user } = useAuth();

  const totalBudget = projects.reduce((s, p) => s + (parseFloat(p.budget) || 0), 0);
  const totalSpent = finances.filter(f => f.status === 'Paid').reduce((s, f) => s + (parseFloat(f.amount) || 0), 0);
  const activeProjects = projects.filter(p => p.status !== 'Completed').length;
  const companyName = user?.companyName || 'Solviontech Infrastructure Ltd';

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <Building2 size={14} /> Dashboard
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" className="date-chip">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </button>
        </div>
      </section>

      {/* 1. Company KPIs & Analytics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '20px' }}>
        {[
          { label: 'Active Projects', value: activeProjects, color: 'var(--blue)', sub: `Total ${projects.length} managed` },
          { label: 'Workforce Summary', value: workers.length, color: 'var(--purple)', sub: 'Assigned across active sites' },
          { label: 'Capital Budget', value: `$${totalBudget.toLocaleString()}`, color: 'var(--green)', sub: `Spent: $${totalSpent.toLocaleString()}` },
          { label: 'Equipment Fleet', value: equipment.length, color: 'var(--orange)', sub: 'Fleet utilization: 84%' },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className="panel" style={{ padding: '20px' }}>
            <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>{label}</span>
            <h2 style={{ fontSize: '24px', color, margin: '4px 0 2px 0', fontWeight: 800 }}>{value}</h2>
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{sub}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginTop: '24px' }}>
        {/* 2. Project Progress Overview */}
        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderKanban size={18} style={{ color: 'var(--blue)' }} /> Project Progress Overview
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {projects.map(p => (
              <div key={p.id} style={{ padding: '14px', background: 'var(--panel-soft)', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                  <strong style={{ color: 'var(--text)' }}>{p.name}</strong>
                  <span style={{ color: 'var(--blue)', fontWeight: 700 }}>{p.progress || 65}%</span>
                </div>
                <div style={{ height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${p.progress || 65}%`, height: '100%', background: 'var(--blue)', borderRadius: '4px' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: 'var(--muted)' }}>
                  <span>Location: {p.location || 'Metro Site'}</span>
                  <span>Budget: ${parseFloat(p.budget || 0).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Revenue & Expenses & AI Recommendations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Revenue & Expenses */}
          <div className="panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} style={{ color: 'var(--green)' }} /> Revenue & Expenses
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--panel-soft)', borderRadius: '8px' }}>
                <span style={{ color: 'var(--muted)' }}>Gross Invoiced Revenue</span>
                <strong style={{ color: 'var(--green)' }}>${(totalSpent * 1.35).toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--panel-soft)', borderRadius: '8px' }}>
                <span style={{ color: 'var(--muted)' }}>Operational Expenses</span>
                <strong style={{ color: 'var(--orange)' }}>${totalSpent.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--panel-soft)', borderRadius: '8px' }}>
                <span style={{ color: 'var(--muted)' }}>Net Margin</span>
                <strong style={{ color: 'var(--blue)' }}>+26.2%</strong>
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bot size={18} style={{ color: 'var(--purple)' }} /> AI Recommendations
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
              <div style={{ padding: '10px 12px', background: 'var(--panel-soft)', borderRadius: '8px', borderLeft: '3px solid var(--purple)' }}>
                Reallocate 3 excavators from Site B to Metro Tower to prevent a 4-day delay.
              </div>
              <div style={{ padding: '10px 12px', background: 'var(--panel-soft)', borderRadius: '8px', borderLeft: '3px solid var(--blue)' }}>
                Steel rebar prices projected to drop 5% next month — delay non-critical orders.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
