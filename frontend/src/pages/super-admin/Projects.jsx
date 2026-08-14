import { useState, useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { realtimeBus } from '../../services/api';
import { FolderKanban, Search, Building2, UserCheck } from 'lucide-react';
import { formatINR } from '../../utils/currency';

const STATUS_META = {
  ACTIVE: { label: 'Active', color: 'var(--green)', bg: 'rgba(34,197,94,0.12)' },
  IN_PROGRESS: { label: 'In Progress', color: 'var(--green)', bg: 'rgba(34,197,94,0.12)' },
  PLANNED: { label: 'Planned', color: 'var(--orange)', bg: 'rgba(245,158,11,0.12)' },
  COMPLETED: { label: 'Completed', color: 'var(--blue)', bg: 'rgba(37,99,235,0.12)' },
  ON_HOLD: { label: 'On Hold', color: 'var(--muted)', bg: 'var(--panel-soft)' },
  SUSPENDED: { label: 'Suspended', color: 'var(--red)', bg: 'rgba(239,68,68,0.12)' },
  CANCELLED: { label: 'Cancelled', color: 'var(--red)', bg: 'rgba(239,68,68,0.12)' },
};

function getStatusMeta(status) {
  const key = String(status || '').toUpperCase().replace(/\s+/g, '_');
  return STATUS_META[key] || { label: status || 'Unknown', color: 'var(--muted)', bg: 'var(--panel-soft)' };
}

export default function SuperAdminProjects() {
  const { projects = [], usersList = [], companies = [], refresh } = useData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const unsub = realtimeBus.subscribe('SERVER_UPDATE', () => refresh && refresh());
    return () => unsub();
  }, [refresh]);

  const pmMap = useMemo(() => {
    const map = new Map();
    (usersList || []).forEach(u => {
      const role = String(u.role || '').toUpperCase();
      if (role === 'PROJECT_MANAGER') {
        const compId = u.companyId ? String(u.companyId) : null;
        const compName = u.companyName ? String(u.companyName).trim().toLowerCase() : null;
        const pmName = u.fullName || u.name || u.email;
        if (compId) map.set(compId, pmName);
        if (compName) map.set(compName, pmName);
      }
    });
    return map;
  }, [usersList]);

  const getPMName = (p) => {
    if (p.pmName && p.pmName !== '—') return p.pmName;
    const compId = p.companyId || p.company?.id ? String(p.companyId || p.company?.id) : null;
    const compName = p.companyName || p.company?.name ? String(p.companyName || p.company?.name).trim().toLowerCase() : null;
    return (compId ? pmMap.get(compId) : null) || (compName ? pmMap.get(compName) : null) || '—';
  };

  const filtered = projects.filter(p => {
    const pmName = getPMName(p);
    const matchSearch =
      (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.companyName || '').toLowerCase().includes(search.toLowerCase()) ||
      (pmName || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.code || '').toLowerCase().includes(search.toLowerCase());
    const normalStatus = String(p.status || '').toUpperCase().replace(/\s+/g, '_');
    const matchStatus = statusFilter === 'ALL' || normalStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const activeCount = projects.filter(p => {
    const s = String(p.status || '').toUpperCase();
    return s === 'ACTIVE' || s === 'IN_PROGRESS';
  }).length;
  const plannedCount = projects.filter(p => String(p.status || '').toUpperCase() === 'PLANNED').length;
  const completedCount = projects.filter(p => String(p.status || '').toUpperCase() === 'COMPLETED').length;

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <FolderKanban size={14} /> Projects
          </p>
          
        </div>
      </section>

      {/* KPI Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16, marginTop: 20 }}>
        {[
          { label: 'Total Projects', value: projects.length, color: 'var(--blue)' },
          { label: 'Active / In Progress', value: activeCount, color: 'var(--green)' },
          { label: 'Planned', value: plannedCount, color: 'var(--orange)' },
          { label: 'Completed', value: completedCount, color: 'var(--purple)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="panel" style={{ padding: '18px' }}>
            <span style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 600 }}>{label}</span>
            <h2 style={{ fontSize: 24, color, margin: '4px 0 0', fontWeight: 800 }}>{value}</h2>
          </div>
        ))}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="panel" style={{ marginTop: '20px', padding: '14px 20px', display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="search-box" style={{ flex: 1, minWidth: 240 }}>
          <Search size={14} style={{ color: 'var(--muted)' }} />
          <input placeholder="Search by project name, tenant or code..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13, fontWeight: 600 }}
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="PLANNED">Planned</option>
          <option value="COMPLETED">Completed</option>
          <option value="ON_HOLD">On Hold</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
        <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
          {filtered.length} of {projects.length} projects
        </span>
      </div>

      {/* Projects Table */}
      <div className="panel" style={{ marginTop: '16px', padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 800, borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--panel-soft)', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                {['Project Site', 'Tenant Company', 'Assigned PM', 'Budget', 'Progress', 'Status'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 40, textAlign: 'center' }}>
                    <FolderKanban size={32} style={{ color: 'var(--muted)', display: 'block', margin: '0 auto 10px' }} />
                    <div style={{ color: 'var(--text)', fontWeight: 700 }}>No projects found</div>
                    <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4 }}>Try adjusting your search or filter.</div>
                  </td>
                </tr>
              ) : (
                filtered.map(p => {
                  const meta = getStatusMeta(p.status);
                  const progress = Number(p.progress || p.progressPercentage || 0);
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FolderKanban size={16} style={{ color: 'var(--blue)', flexShrink: 0 }} />
                          <div>
                            <div>{p.name}</div>
                            {p.code && <div style={{ fontSize: 11, color: 'var(--blue)', marginTop: 2 }}>{p.code}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Building2 size={14} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                          {p.companyName || '—'}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--muted)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <UserCheck size={14} style={{ color: 'var(--blue)', flexShrink: 0 }} />
                          {getPMName(p)}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700 }}>{formatINR(p.budget)}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 100 }}>
                          <div style={{ flex: 1, height: '6px', background: 'var(--panel-soft)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(progress, 100)}%`, height: '100%', background: meta.color, borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{progress}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '10px', background: meta.bg, color: meta.color, fontSize: '11px', fontWeight: 700 }}>
                          {meta.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
