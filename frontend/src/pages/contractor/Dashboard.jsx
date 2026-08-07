import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { FolderKanban, Users, Clock, CheckSquare, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function ContractorDashboard() {
  const { projects, workers, tasks } = useData();
  const { user } = useAuth();

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <Users size={14} /> Dashboard
          </p>
        </div>
      </section>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '20px' }}>
        {[
          { label: 'Assigned Projects', value: projects.length, color: 'var(--blue)' },
          { label: 'Subcontractor Crew', value: workers.length, color: 'var(--purple)' },
          { label: 'Team Attendance', value: '96%', color: 'var(--green)' },
          { label: 'Pending Tasks', value: tasks.filter(t => t.status !== 'Completed').length, color: 'var(--orange)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="panel" style={{ padding: '20px' }}>
            <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>{label}</span>
            <h2 style={{ fontSize: '24px', color, margin: '4px 0 0 0', fontWeight: 800 }}>{value}</h2>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '14px' }}>Assigned Projects Overview</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            {projects.map(p => (
              <div key={p.id} style={{ padding: '12px', background: 'var(--panel-soft)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <strong>{p.name}</strong>
                <span style={{ color: 'var(--blue)', fontWeight: 600 }}>{p.progress || 65}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '14px' }}>Work Completion Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div style={{ padding: '12px', background: 'var(--panel-soft)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span>On-Schedule Tasks</span>
              <strong style={{ color: 'var(--green)' }}>14 Completed</strong>
            </div>
            <div style={{ padding: '12px', background: 'var(--panel-soft)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Pending Crew Approvals</span>
              <strong style={{ color: 'var(--orange)' }}>3 Pending</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
