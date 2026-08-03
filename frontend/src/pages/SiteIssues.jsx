import { useState } from 'react';
import {
  ShieldAlert,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MessageSquare,
  Shield,
} from 'lucide-react';

const initialIssues = [
  {
    id: 1,
    title: 'Floor 14 West Wing Scaffold Handrail Missing',
    category: 'SAFETY_HAZARD',
    severity: 'HIGH',
    reportedBy: 'Divya Krishnan (Site Engineer)',
    assignedTo: 'Robert Fox (Contractor)',
    location: 'Metro Tower Complex • Zone B',
    status: 'IN_PROGRESS',
    date: '2026-08-03 08:30 AM',
    description: 'Scaffolding perimeter guardrail was removed during formwork dismantling. Risk of fall from height.',
  },
  {
    id: 2,
    title: 'Delayed Concrete Ready-Mix Transit Truck',
    category: 'MATERIAL_DELAY',
    severity: 'MEDIUM',
    reportedBy: 'Divya Krishnan (Site Engineer)',
    assignedTo: 'Vikram Nair (PM)',
    location: 'Metro Tower Complex • Zone A',
    status: 'OPEN',
    date: '2026-08-03 09:10 AM',
    description: 'Ready-mix concrete truck stuck in traffic delay. 45-minute delay on Floor 14 slab pour.',
  },
  {
    id: 3,
    title: 'Hydraulic Hose Leakage on Tower Crane #2',
    category: 'EQUIPMENT_FAULT',
    severity: 'HIGH',
    reportedBy: 'Divya Krishnan (Site Engineer)',
    assignedTo: 'Equipment Maintenance Yard',
    location: 'Metro Tower Complex • Central Crane Pad',
    status: 'RESOLVED',
    date: '2026-08-02 04:15 PM',
    description: 'Minor fluid leakage detected during morning pre-op check. Hose replaced by technician.',
  },
];

export default function SiteIssues() {
  const [issues, setIssues] = useState(initialIssues);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newIssue, setNewIssue] = useState({ title: '', category: 'SAFETY_HAZARD', severity: 'HIGH', location: 'Metro Tower Zone A', description: '' });

  const notify = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3500);
  };

  const handleResolveIssue = (id, title) => {
    setIssues((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: 'RESOLVED' } : i))
    );
    notify(`Marked issue "${title}" as RESOLVED!`);
  };

  const handleReportIssue = (e) => {
    e.preventDefault();
    if (!newIssue.title) return;
    setIssues([
      ...issues,
      {
        id: Date.now(),
        title: newIssue.title,
        category: newIssue.category,
        severity: newIssue.severity,
        reportedBy: 'Divya Krishnan (Site Engineer)',
        assignedTo: 'Robert Fox (Contractor)',
        location: newIssue.location,
        status: 'OPEN',
        date: new Date().toLocaleString(),
        description: newIssue.description || 'Reported from site engineer mobile terminal.',
      },
    ]);
    setShowModal(false);
    setNewIssue({ title: '', category: 'SAFETY_HAZARD', severity: 'HIGH', location: 'Metro Tower Zone A', description: '' });
    notify(`Reported site issue/hazard "${newIssue.title}"`);
  };

  const filtered = issues.filter(
    (i) =>
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.location.toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <p className="eyebrow" style={{ color: 'var(--red)', fontWeight: 600 }}>SITE SAFETY & HAZARD RISK CONTROL</p>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Site Issues & Safety Hazard Reporting</h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '4px' }}>
            Site Engineer safety desk: report site hazards, equipment faults, material delays, and track resolution progress.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          style={{ background: 'var(--red)', display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={() => setShowModal(true)}
        >
          <ShieldAlert size={16} /> Report Safety Hazard / Issue
        </button>
      </div>

      {notice && (
        <div style={{ background: 'rgba(36, 196, 107, 0.15)', border: '1px solid var(--green)', color: 'var(--green)', padding: '12px 18px', borderRadius: '10px', fontWeight: 600, fontSize: '14px' }}>
          {notice}
        </div>
      )}

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="panel" style={{ padding: '18px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Open Safety Hazards</span>
          <h2 style={{ fontSize: '26px', color: 'var(--red)', marginTop: '4px' }}>
            {issues.filter((i) => i.status !== 'RESOLVED' && i.category === 'SAFETY_HAZARD').length} Active
          </h2>
          <small style={{ color: 'var(--red)' }}>High Priority</small>
        </div>
        <div className="panel" style={{ padding: '18px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>In Progress Fixes</span>
          <h2 style={{ fontSize: '26px', color: 'var(--orange)', marginTop: '4px' }}>
            {issues.filter((i) => i.status === 'IN_PROGRESS').length} Pending
          </h2>
          <small style={{ color: 'var(--orange)' }}>Assigned to Contractors</small>
        </div>
        <div className="panel" style={{ padding: '18px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Resolved Site Issues</span>
          <h2 style={{ fontSize: '26px', color: 'var(--green)', marginTop: '4px' }}>
            {issues.filter((i) => i.status === 'RESOLVED').length} Closed
          </h2>
          <small style={{ color: 'var(--green)' }}>Verified Safe</small>
        </div>
      </div>

      {/* Issues Directory */}
      <div className="panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={20} style={{ color: 'var(--red)' }} /> Reported Site Hazards & Delays Ledger
          </h3>

          <div className="search-box" style={{ width: '280px' }}>
            <Search size={16} />
            <input
              placeholder="Search issue or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.map((item) => (
            <div
              key={item.id}
              style={{
                padding: '18px',
                borderRadius: '12px',
                background: 'var(--panel-soft)',
                border: '1px solid var(--border)',
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: item.severity === 'HIGH' ? 'rgba(235, 87, 87, 0.15)' : 'rgba(242, 153, 74, 0.15)',
                      color: item.severity === 'HIGH' ? 'var(--red)' : 'var(--orange)',
                    }}
                  >
                    {item.severity} SEVERITY
                  </span>
                  <strong style={{ fontSize: '15px' }}>{item.title}</strong>
                </div>
                <p style={{ color: 'var(--muted)', fontSize: '13px', margin: '4px 0 6px 0' }}>{item.description}</p>
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                  Location: <strong>{item.location}</strong> • Assigned: <span style={{ color: 'var(--blue)' }}>{item.assignedTo}</span> • Reported {item.date}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 700,
                    background: item.status === 'RESOLVED' ? 'rgba(36, 196, 107, 0.15)' : 'rgba(242, 153, 74, 0.15)',
                    color: item.status === 'RESOLVED' ? 'var(--green)' : 'var(--orange)',
                  }}
                >
                  {item.status}
                </span>

                {item.status !== 'RESOLVED' && (
                  <button
                    type="button"
                    className="primary-button"
                    style={{ background: 'var(--green)', padding: '6px 12px', fontSize: '12px' }}
                    onClick={() => handleResolveIssue(item.id, item.title)}
                  >
                    <CheckCircle2 size={14} /> Mark Resolved
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Report Issue */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
          }}
        >
          <div className="panel" style={{ width: '450px', padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Report Site Hazard or Equipment Fault</h3>
            <form onSubmit={handleReportIssue} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>Issue Summary Title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Loose Scaffolding Clamp on Shaft 3"
                  value={newIssue.title}
                  onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
                  style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>Category</label>
                  <select
                    value={newIssue.category}
                    onChange={(e) => setNewIssue({ ...newIssue, category: e.target.value })}
                    style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)' }}
                  >
                    <option value="SAFETY_HAZARD">Safety Hazard</option>
                    <option value="EQUIPMENT_FAULT">Equipment Fault</option>
                    <option value="MATERIAL_DELAY">Material Delay</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>Severity Level</label>
                  <select
                    value={newIssue.severity}
                    onChange={(e) => setNewIssue({ ...newIssue, severity: e.target.value })}
                    style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)' }}
                  >
                    <option value="HIGH">CRITICAL / HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>Exact Site Zone Location</label>
                <input
                  type="text"
                  placeholder="e.g. Metro Tower Complex Zone A Floor 14"
                  value={newIssue.location}
                  onChange={(e) => setNewIssue({ ...newIssue, location: e.target.value })}
                  style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>Detailed Description & Observations</label>
                <textarea
                  rows={3}
                  placeholder="Explain findings, risks, and suggested corrective action..."
                  value={newIssue.description}
                  onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                  style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" className="secondary-button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button" style={{ background: 'var(--red)' }}>
                  Submit Hazard Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
