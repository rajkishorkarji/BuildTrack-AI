import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Gauge, Download, FileText, BarChart3, Users, FolderKanban, ShieldCheck, DollarSign } from 'lucide-react';

export default function CompanyAdminReports() {
  const { projects, workers, finances, equipment } = useData();
  const [activeTab, setActiveTab] = useState('project');

  const exportReportCSV = (type) => {
    let headers = [];
    let rows = [];
    let filename = `company_${type}_report_${new Date().toISOString().slice(0, 10)}.csv`;

    if (type === 'project') {
      headers = ['Project Name', 'Location', 'Budget ($)', 'Progress (%)', 'Status', 'Assigned PM'];
      rows = projects.map(p => [
        `"${p.name || ''}"`,
        `"${p.location || 'Site Location'}"`,
        `"${parseFloat(p.budget || 0)}"`,
        `"${p.progress || 0}"`,
        `"${p.status || 'Active'}"`,
        `"${p.pmName || 'Unassigned'}"`
      ]);
    } else if (type === 'workforce') {
      headers = ['Personnel Name', 'Role', 'Email', 'Assigned Project', 'Reporting Manager', 'Employment Type', 'Status'];
      rows = workers.map(w => [
        `"${w.name || w.fullName || ''}"`,
        `"${w.role || 'Worker'}"`,
        `"${w.email || ''}"`,
        `"${w.assignedProject || w.projectName || 'Metro Tower Site A'}"`,
        `"${w.reportingManager || 'Company Admin'}"`,
        `"${w.employmentType || 'Full-time'}"`,
        `"${w.status || 'Active'}"`
      ]);
    } else if (type === 'finance') {
      headers = ['Invoice No', 'Contractor / Payee', 'Project', 'Amount ($)', 'Status'];
      rows = finances.map(f => [
        `"${f.invoiceNo || `INV-${f.id}`}"`,
        `"${f.contractor || 'Subcontractor Crew'}"`,
        `"${f.projectName || 'Metro Site'}"`,
        `"${parseFloat(f.amount || 0)}"`,
        `"${f.status || 'Paid'}"`
      ]);
    } else if (type === 'equipment') {
      headers = ['Equipment Name', 'Equipment ID', 'Category', 'Assigned Operator / Site', 'Current Status'];
      rows = equipment.map(e => [
        `"${e.name || ''}"`,
        `"${e.equipmentId || e.code || `EQ-${e.id}`}"`,
        `"${e.category || 'Heavy Machinery'}"`,
        `"${e.operator || 'Unassigned'}"`,
        `"${e.status || 'Operational'}"`
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <Gauge size={14} /> Reports
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="primary-button"
            onClick={() => exportReportCSV(activeTab)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Download size={16} /> Export {activeTab.toUpperCase()} (CSV)
          </button>
        </div>
      </section>

      {/* Report Selection Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
        {[
          ['project', 'Project Reports'],
          ['workforce', 'Workforce Reports'],
          ['finance', 'Financial Reports'],
          ['equipment', 'Equipment Reports'],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: 'none',
              background: activeTab === id ? 'var(--blue)' : 'var(--panel)',
              color: activeTab === id ? '#fff' : 'var(--muted)', fontWeight: 600, fontSize: '13px', cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Summary KPI Cards for Active Report */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginTop: '20px' }}>
        {activeTab === 'project' && [
          { label: 'Total Projects', value: projects.length, color: 'var(--blue)' },
          { label: 'In Progress', value: projects.filter(p => p.status === 'In Progress' || p.status === 'Active').length, color: 'var(--orange)' },
          { label: 'Completed', value: projects.filter(p => p.status === 'Completed').length, color: 'var(--green)' },
          { label: 'Total Portfolio Budget', value: `$${(projects.reduce((s, p) => s + (parseFloat(p.budget) || 0), 0) / 1e6).toFixed(1)}M`, color: 'var(--purple)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="panel" style={{ padding: '16px' }}>
            <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>{label}</span>
            <h3 style={{ fontSize: '22px', color, margin: '4px 0 0 0', fontWeight: 800 }}>{value}</h3>
          </div>
        ))}

        {activeTab === 'workforce' && [
          { label: 'Total Personnel', value: workers.length, color: 'var(--blue)' },
          { label: 'Active Roster', value: workers.filter(w => (w.status || 'Active') === 'Active').length, color: 'var(--green)' },
          { label: 'Assigned Teams', value: `${projects.length} Sites`, color: 'var(--purple)' },
          { label: 'Compliance Rate', value: '98.5%', color: 'var(--orange)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="panel" style={{ padding: '16px' }}>
            <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>{label}</span>
            <h3 style={{ fontSize: '22px', color, margin: '4px 0 0 0', fontWeight: 800 }}>{value}</h3>
          </div>
        ))}

        {activeTab === 'finance' && [
          { label: 'Total Ledgers', value: finances.length, color: 'var(--blue)' },
          { label: 'Cleared Expenditures', value: `$${finances.filter(f => f.status === 'Paid').reduce((s, f) => s + (parseFloat(f.amount) || 0), 0).toLocaleString()}`, color: 'var(--green)' },
          { label: 'Pending Receivables', value: `$${finances.filter(f => f.status === 'Pending').reduce((s, f) => s + (parseFloat(f.amount) || 0), 0).toLocaleString()}`, color: 'var(--orange)' },
          { label: 'Contractor Payroll', value: '$48,500', color: 'var(--purple)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="panel" style={{ padding: '16px' }}>
            <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>{label}</span>
            <h3 style={{ fontSize: '22px', color, margin: '4px 0 0 0', fontWeight: 800 }}>{value}</h3>
          </div>
        ))}

        {activeTab === 'equipment' && [
          { label: 'Total Fleet Assets', value: equipment.length, color: 'var(--blue)' },
          { label: 'Operational Fleet', value: equipment.filter(e => (e.status || 'Operational') === 'Operational').length, color: 'var(--green)' },
          { label: 'In Maintenance', value: equipment.filter(e => e.status === 'In Maintenance').length, color: 'var(--orange)' },
          { label: 'Deployed Assets', value: equipment.filter(e => e.status === 'Deployed').length, color: 'var(--purple)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="panel" style={{ padding: '16px' }}>
            <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>{label}</span>
            <h3 style={{ fontSize: '22px', color, margin: '4px 0 0 0', fontWeight: 800 }}>{value}</h3>
          </div>
        ))}
      </div>

      {/* ── 1. Project Reports List ── */}
      {activeTab === 'project' && (
        <div className="panel" style={{ marginTop: '20px', padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', background: 'var(--panel-soft)', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>Project Portfolio List Report ({projects.length})</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--panel)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Project Name</th>
                <th style={{ padding: '14px', fontWeight: 600 }}>Site Location</th>
                <th style={{ padding: '14px', fontWeight: 600 }}>Assigned PM</th>
                <th style={{ padding: '14px', fontWeight: 600 }}>Budget</th>
                <th style={{ padding: '14px', fontWeight: 600 }}>Progress</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text)' }}>{p.name}</td>
                  <td style={{ padding: '14px', color: 'var(--muted)' }}>{p.location || 'Site Location'}</td>
                  <td style={{ padding: '14px', fontWeight: 600, color: p.pmName ? 'var(--blue)' : 'var(--orange)' }}>{p.pmName || 'Unassigned'}</td>
                  <td style={{ padding: '14px', fontWeight: 700 }}>${(parseFloat(p.budget) || 0).toLocaleString()}</td>
                  <td style={{ padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '80px', height: '6px', background: 'var(--panel-soft)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${p.progress || 0}%`, height: '100%', background: 'var(--blue)' }} />
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--blue)', fontSize: '12px' }}>{p.progress || 0}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '10px', background: 'rgba(34,197,94,0.12)', color: 'var(--green)', fontSize: '11px', fontWeight: 700 }}>
                      {p.status || 'Active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── 2. Workforce Reports List ── */}
      {activeTab === 'workforce' && (
        <div className="panel" style={{ marginTop: '20px', padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', background: 'var(--panel-soft)', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>Workforce Personnel List Report ({workers.length})</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--panel)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Personnel Name</th>
                <th style={{ padding: '14px', fontWeight: 600 }}>System Role</th>
                <th style={{ padding: '14px', fontWeight: 600 }}>Assigned Project & Site</th>
                <th style={{ padding: '14px', fontWeight: 600 }}>Reporting Manager</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {workers.map(w => (
                <tr key={w.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text)' }}>{w.name || w.fullName}</td>
                  <td style={{ padding: '14px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, background: 'rgba(37,99,235,0.12)', color: 'var(--blue)' }}>
                      {w.role}
                    </span>
                  </td>
                  <td style={{ padding: '14px', color: 'var(--text)' }}>
                    <div style={{ fontWeight: 600 }}>{w.assignedProject || w.projectName || 'Metro Site'}</div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{w.site || 'Sector 5'}</div>
                  </td>
                  <td style={{ padding: '14px', color: 'var(--muted)' }}>{w.reportingManager || 'Company Admin'}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '10px', background: (w.status || 'Active') === 'Active' ? 'rgba(34,197,94,0.12)' : 'rgba(245,154,22,0.12)', color: (w.status || 'Active') === 'Active' ? 'var(--green)' : 'var(--orange)', fontSize: '11px', fontWeight: 700 }}>
                      {w.status || 'Active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── 3. Financial Reports List ── */}
      {activeTab === 'finance' && (
        <div className="panel" style={{ marginTop: '20px', padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', background: 'var(--panel-soft)', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>Financial Expenditures List Report ({finances.length})</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--panel)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Invoice No</th>
                <th style={{ padding: '14px', fontWeight: 600 }}>Contractor / Payee</th>
                <th style={{ padding: '14px', fontWeight: 600 }}>Project</th>
                <th style={{ padding: '14px', fontWeight: 600 }}>Amount ($)</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {finances.map(f => (
                <tr key={f.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--blue)' }}>{f.invoiceNo || `INV-${f.id}`}</td>
                  <td style={{ padding: '14px', fontWeight: 600 }}>{f.contractor || 'Subcontractor Crew'}</td>
                  <td style={{ padding: '14px', color: 'var(--muted)' }}>{f.projectName || 'Metro Site'}</td>
                  <td style={{ padding: '14px', fontWeight: 700 }}>${(parseFloat(f.amount) || 0).toLocaleString()}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: '10px', background: f.status === 'Paid' ? 'rgba(34,197,94,0.12)' : 'rgba(245,154,22,0.12)', color: f.status === 'Paid' ? 'var(--green)' : 'var(--orange)', fontSize: '11px', fontWeight: 600 }}>
                      {f.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── 4. Equipment Reports List ── */}
      {activeTab === 'equipment' && (
        <div className="panel" style={{ marginTop: '20px', padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', background: 'var(--panel-soft)', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>Equipment & Fleet Machinery List Report ({equipment.length})</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--panel)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Equipment Name & ID</th>
                <th style={{ padding: '14px', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '14px', fontWeight: 600 }}>Assigned Operator / Site</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Current Status</th>
              </tr>
            </thead>
            <tbody>
              {equipment.map(eq => (
                <tr key={eq.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text)' }}>
                    <div>{eq.name}</div>
                    <code style={{ fontSize: '11px', color: 'var(--blue)', background: 'rgba(37,99,235,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                      {eq.equipmentId || eq.code || `EQ-${eq.id}`}
                    </code>
                  </td>
                  <td style={{ padding: '14px', color: 'var(--muted)', fontWeight: 500 }}>{eq.category || 'Heavy Machinery'}</td>
                  <td style={{ padding: '14px', fontWeight: 600, color: eq.operator && eq.operator !== 'Unassigned' ? 'var(--text)' : 'var(--orange)' }}>
                    {eq.operator || 'Unassigned'}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '10px',
                      background: (eq.status || 'Operational') === 'Operational' ? 'rgba(34,197,94,0.12)' : (eq.status === 'In Maintenance' ? 'rgba(245,154,22,0.12)' : 'rgba(37,99,235,0.12)'),
                      color: (eq.status || 'Operational') === 'Operational' ? 'var(--green)' : (eq.status === 'In Maintenance' ? 'var(--orange)' : 'var(--blue)'),
                      fontSize: '11px',
                      fontWeight: 700,
                    }}>
                      {eq.status || 'Operational'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
