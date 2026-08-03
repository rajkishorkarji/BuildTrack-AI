import { useState } from 'react';
import {
  Users,
  HardHat,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Edit,
  FolderKanban,
  Star,
} from 'lucide-react';

const initialWorkforce = [
  { id: 1, name: 'Rose Smith', trade: 'Senior Mason', project: 'Metro Tower Complex', contractor: 'Fox Steel Constructors', dailyWage: '$85.00', performanceScore: 9.6, status: 'ACTIVE' },
  { id: 2, name: 'Robert Fox', trade: 'Structural Welder', project: 'Metro Tower Complex', contractor: 'Fox Steel Constructors', dailyWage: '$95.00', performanceScore: 9.2, status: 'ACTIVE' },
  { id: 3, name: 'Ronald Richards', trade: 'Heavy Crane Operator', project: 'Skyview Residency', contractor: 'Apex Machinery Crew', dailyWage: '$120.00', performanceScore: 9.8, status: 'ACTIVE' },
  { id: 4, name: 'Theresa Webb', trade: 'Master Electrician', project: 'Bhubaneswar Smart Bypass', contractor: 'Odisha Power Tech', dailyWage: '$90.00', performanceScore: 8.9, status: 'ACTIVE' },
  { id: 5, name: 'Arjun Das', trade: 'Carpentry Foreman', project: 'Metro Tower Complex', contractor: 'Fox Steel Constructors', dailyWage: '$80.00', performanceScore: 9.1, status: 'ACTIVE' },
];

export default function SiteWorkforce() {
  const [workers, setWorkers] = useState(initialWorkforce);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newWorker, setNewWorker] = useState({ name: '', trade: 'Mason', project: 'Metro Tower Complex', contractor: 'Fox Steel Constructors', dailyWage: '85' });

  const notify = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3500);
  };

  const handleRemoveWorker = (id, name) => {
    setWorkers((prev) => prev.filter((w) => w.id !== id));
    notify(`Removed worker ${name} from active workforce directory.`);
  };

  const handleAddWorker = (e) => {
    e.preventDefault();
    if (!newWorker.name) return;
    setWorkers([
      ...workers,
      {
        id: Date.now(),
        name: newWorker.name,
        trade: newWorker.trade,
        project: newWorker.project,
        contractor: newWorker.contractor,
        dailyWage: `$${newWorker.dailyWage}.00`,
        performanceScore: 9.0,
        status: 'ACTIVE',
      },
    ]);
    setShowModal(false);
    setNewWorker({ name: '', trade: 'Mason', project: 'Metro Tower Complex', contractor: 'Fox Steel Constructors', dailyWage: '85' });
    notify(`Enrolled worker ${newWorker.name} into site workforce!`);
  };

  const filtered = workers.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.trade.toLowerCase().includes(search.toLowerCase()) ||
      w.project.toLowerCase().includes(search.toLowerCase()) ||
      w.contractor.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <p className="eyebrow" style={{ color: 'var(--blue)', fontWeight: 600 }}>FIELD WORKFORCE MANAGEMENT</p>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Site Workforce & Subcontractor Crews</h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '4px' }}>
            Company Admin labor desk: register site workers, assign trades, allocate workers to construction projects, and evaluate performance scores.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={() => setShowModal(true)}
        >
          <Plus size={16} /> Enroll Site Worker
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
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Total Managed Workers</span>
          <h2 style={{ fontSize: '26px', color: 'var(--blue)', marginTop: '4px' }}>{workers.length} Field Laborers</h2>
          <small style={{ color: 'var(--green)' }}>100% Verified Crew</small>
        </div>
        <div className="panel" style={{ padding: '18px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Subcontractor Firms</span>
          <h2 style={{ fontSize: '26px', color: 'var(--purple)', marginTop: '4px' }}>4 Contractors</h2>
          <small style={{ color: 'var(--muted)' }}>Active Labor Contracts</small>
        </div>
        <div className="panel" style={{ padding: '18px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Avg Performance Rating</span>
          <h2 style={{ fontSize: '26px', color: 'var(--green)', marginTop: '4px' }}>9.3 / 10</h2>
          <small style={{ color: 'var(--green)' }}>Top Site Efficiency</small>
        </div>
      </div>

      {/* Workforce Table Panel */}
      <div className="panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HardHat size={20} style={{ color: 'var(--blue)' }} /> Active Site Workers & Crew Directory
          </h3>

          <div className="search-box" style={{ width: '280px' }}>
            <Search size={16} />
            <input
              placeholder="Search worker, trade, or site..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px' }}>Worker & Trade</th>
                <th style={{ padding: '12px' }}>Assigned Project</th>
                <th style={{ padding: '12px' }}>Subcontractor Firm</th>
                <th style={{ padding: '12px' }}>Daily Rate</th>
                <th style={{ padding: '12px' }}>Performance Score</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((w) => (
                <tr key={w.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '14px 12px' }}>
                    <strong style={{ fontSize: '14px', display: 'block' }}>{w.name}</strong>
                    <span style={{ fontSize: '12px', color: 'var(--blue)', fontWeight: 600 }}>{w.trade}</span>
                  </td>
                  <td style={{ padding: '14px 12px', fontWeight: 600 }}>{w.project}</td>
                  <td style={{ padding: '14px 12px', color: 'var(--muted)' }}>{w.contractor}</td>
                  <td style={{ padding: '14px 12px', color: 'var(--green)', fontWeight: 700 }}>{w.dailyWage}</td>
                  <td style={{ padding: '14px 12px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '12px', background: 'rgba(155, 81, 224, 0.15)', color: 'var(--purple)', fontWeight: 700, fontSize: '12px' }}>
                      <Star size={12} fill="var(--purple)" /> {w.performanceScore}
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        type="button"
                        className="secondary-button"
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                        onClick={() => notify(`Reassigned site location for ${w.name}`)}
                      >
                        <FolderKanban size={14} /> Reassign Site
                      </button>
                      <button
                        type="button"
                        className="secondary-button"
                        style={{ padding: '4px 8px', fontSize: '12px', color: 'var(--red)' }}
                        onClick={() => handleRemoveWorker(w.id, w.name)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Enroll Worker */}
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
          <div className="panel" style={{ width: '420px', padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Enroll New Site Worker</h3>
            <form onSubmit={handleAddWorker} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>Worker Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={newWorker.name}
                  onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                  style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>Specialized Trade</label>
                <input
                  type="text"
                  placeholder="e.g. Mason / Welder / Electrician"
                  value={newWorker.trade}
                  onChange={(e) => setNewWorker({ ...newWorker, trade: e.target.value })}
                  style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>Assigned Project</label>
                <select
                  value={newWorker.project}
                  onChange={(e) => setNewWorker({ ...newWorker, project: e.target.value })}
                  style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)' }}
                >
                  <option value="Metro Tower Complex">Metro Tower Complex</option>
                  <option value="Skyview Residency">Skyview Residency</option>
                  <option value="Bhubaneswar Smart Bypass">Bhubaneswar Smart Bypass</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>Daily Wage ($/day)</label>
                <input
                  type="number"
                  value={newWorker.dailyWage}
                  onChange={(e) => setNewWorker({ ...newWorker, dailyWage: e.target.value })}
                  style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" className="secondary-button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Enroll Worker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
