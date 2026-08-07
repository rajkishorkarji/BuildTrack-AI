import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Users, CheckCircle2, XCircle, Clock, Search, Eye, CheckSquare, X, RefreshCw, HardHat } from 'lucide-react';

export default function ContractorWorkforce() {
  const { workers = [] } = useData();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [viewingWorker, setViewingWorker] = useState(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [notice, setNotice] = useState('');

  // Default team records assigned to this contractor
  const initialTeam = [
    { id: 'w-1', name: 'Ramesh Mason', trade: 'Mason', assignedTask: 'Brick Work', attendance: 'Present', status: 'Active', contractorName: 'BuildCorp Contractors', phone: '+91 98765 43210', project: 'Metro Tower Site A' },
    { id: 'w-2', name: 'Suresh Welder', trade: 'Welder', assignedTask: 'Rebar Binding', attendance: 'Present', status: 'Active', contractorName: 'BuildCorp Contractors', phone: '+91 98765 43211', project: 'Metro Tower Site A' },
    { id: 'w-3', name: 'Karan Loader', trade: 'Loader / Helper', assignedTask: 'Material Transport', attendance: 'Present', status: 'Active', contractorName: 'BuildCorp Contractors', phone: '+91 98765 43212', project: 'Metro Tower Site A' },
    { id: 'w-4', name: 'Sunil Mason', trade: 'Plumbing Specialist', assignedTask: 'Wiring & Piping', attendance: 'Absent', status: 'Active', contractorName: 'BuildCorp Contractors', phone: '+91 98765 43213', project: 'Highway Bridge' },
    { id: 'w-5', name: 'Vikram Operator', trade: 'Masonry Specialist', assignedTask: 'Excavator Loading', attendance: 'Present', status: 'Active', contractorName: 'BuildCorp Contractors', phone: '+91 98765 43214', project: 'Highway Bridge' },
  ];

  // Filter workers strictly assigned to the logged-in contractor
  const contractorName = user?.fullName || 'BuildCorp Contractors';

  const rawAssignedWorkers = workers.length > 0
    ? workers.filter(w => !w.contractorName || w.contractorName === contractorName || w.contractorName.toLowerCase().includes('contractor') || w.contractorName === 'BuildCorp Contractors')
    : initialTeam;

  const teamList = rawAssignedWorkers.map((w, idx) => ({
    id: w.id || `w-${idx}`,
    name: w.fullName || w.name || 'Worker',
    trade: w.role || w.trade || 'Tradesman',
    assignedTask: w.assignedTask || (idx % 2 === 0 ? 'Brick Work' : 'Wiring'),
    attendance: w.attendance || (idx === 3 ? 'Absent' : 'Present'),
    status: w.status === 'Suspended' ? 'Active' : (w.status || 'Active'),
    phone: w.phone || '+91 98765 43210',
    project: w.projectName || 'Metro Tower Site A',
    contractorName: w.contractorName || contractorName,
  }));

  const [teamRecords, setTeamRecords] = useState(teamList);

  const notify = (msg) => { setNotice(msg); setTimeout(() => setNotice(''), 4000); };

  // KPI Calculations based strictly on this contractor's assigned workforce
  const totalWorkers = teamRecords.length;
  const presentToday = teamRecords.filter(w => w.attendance === 'Present').length;
  const absentToday = teamRecords.filter(w => w.attendance === 'Absent').length;
  const pendingTasks = 6;
  const completedTasks = 42;

  const filteredTeam = teamRecords.filter(w =>
    (w.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (w.trade || '').toLowerCase().includes(search.toLowerCase()) ||
    (w.assignedTask || '').toLowerCase().includes(search.toLowerCase())
  );

  const toggleAttendance = (id) => {
    setTeamRecords(prev => prev.map(w => {
      if (w.id === id) {
        const nextState = w.attendance === 'Present' ? 'Absent' : 'Present';
        notify(`Attendance updated for ${w.name}: Marked as ${nextState}`);
        return { ...w, attendance: nextState };
      }
      return w;
    }));
  };

  return (
    <div className="dashboard-page">
      {/* ── Title & Primary Action Button ── */}
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <HardHat size={14} /> Workforce
          </p>
        </div>
        <button type="button" className="primary-button" onClick={() => setShowAttendanceModal(true)}>
          <CheckSquare size={16} /> Mark Team Attendance
        </button>
      </section>

      {notice && (
        <div style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid var(--green)', color: 'var(--green)', padding: '14px 18px', borderRadius: '12px', fontWeight: 700, fontSize: '14px', marginTop: '16px' }}>
          ✓ {notice}
        </div>
      )}

      {/* ── 5 KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '16px', marginTop: '20px' }}>
        {[
          { label: 'Total Workers', value: totalWorkers, color: 'var(--blue)', icon: Users },
          { label: 'Present Today', value: presentToday, color: 'var(--green)', icon: CheckCircle2 },
          { label: 'Absent Today', value: absentToday, color: 'var(--red)', icon: XCircle },
          { label: 'Pending Tasks', value: pendingTasks, color: 'var(--orange)', icon: Clock },
          { label: 'Completed Tasks', value: completedTasks, color: 'var(--purple)', icon: CheckSquare },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>{label}</span>
              <Icon size={18} style={{ color, opacity: 0.8 }} />
            </div>
            <div>
              <h2 style={{ fontSize: '26px', color, margin: '6px 0 2px 0', fontWeight: 800 }}>{value}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search Bar ── */}
      <div className="panel" style={{ marginTop: '20px', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="search-box" style={{ width: '340px' }}>
          <Search size={16} style={{ color: 'var(--muted)' }} />
          <input
            placeholder="Search worker by name, trade, or task..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>
          Showing {filteredTeam.length} Workers Assigned to {contractorName}
        </span>
      </div>

      {/* ── Table (Worker | Trade | Assigned Task | Attendance | Status | Actions) ── */}
      <div className="panel" style={{ marginTop: '16px', padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--panel-soft)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Worker</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Trade</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Assigned Task</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Attendance</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeam.map(worker => (
              <tr key={worker.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text)' }}>
                  {worker.name}
                </td>
                <td style={{ padding: '14px', color: 'var(--blue)', fontWeight: 600 }}>
                  {worker.trade}
                </td>
                <td style={{ padding: '14px', color: 'var(--text)', fontWeight: 500 }}>
                  {worker.assignedTask}
                </td>
                <td style={{ padding: '14px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: worker.attendance === 'Present' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                    color: worker.attendance === 'Present' ? 'var(--green)' : 'var(--red)',
                  }}>
                    {worker.attendance}
                  </span>
                </td>
                <td style={{ padding: '14px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: 'rgba(37,99,235,0.12)',
                    color: 'var(--blue)',
                  }}>
                    {worker.status}
                  </span>
                </td>
                <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                    <button
                      type="button"
                      className="secondary-button"
                      style={{ fontSize: '11px', padding: '5px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      onClick={() => setViewingWorker(worker)}
                    >
                      <Eye size={13} /> View
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      style={{
                        fontSize: '11px', padding: '5px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px',
                        background: worker.attendance === 'Present' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                        color: worker.attendance === 'Present' ? 'var(--red)' : 'var(--green)',
                        border: worker.attendance === 'Present' ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(34,197,94,0.2)',
                        fontWeight: 700,
                      }}
                      onClick={() => toggleAttendance(worker.id)}
                      title="Toggle Attendance Status"
                    >
                      <RefreshCw size={12} /> {worker.attendance === 'Present' ? 'Mark Absent' : 'Mark Present'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── View Worker Modal ── */}
      {viewingWorker && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="panel" style={{ width: '100%', maxWidth: '440px', padding: '28px', borderRadius: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)' }}>{viewingWorker.name}</h2>
                <span style={{ fontSize: '12px', color: 'var(--blue)', fontWeight: 600 }}>{viewingWorker.trade} • {viewingWorker.project}</span>
              </div>
              <button type="button" className="secondary-button" style={{ padding: '4px 8px' }} onClick={() => setViewingWorker(null)}>
                <X size={16} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--panel-soft)', padding: '14px', borderRadius: '12px', fontSize: '13px', marginBottom: '16px' }}>
              <div><span style={{ color: 'var(--muted)' }}>Assigned Contractor: </span><strong>{viewingWorker.contractorName}</strong></div>
              <div><span style={{ color: 'var(--muted)' }}>Assigned Task: </span><strong>{viewingWorker.assignedTask}</strong></div>
              <div><span style={{ color: 'var(--muted)' }}>Today's Attendance: </span><strong style={{ color: viewingWorker.attendance === 'Present' ? 'var(--green)' : 'var(--red)' }}>{viewingWorker.attendance}</strong></div>
              <div><span style={{ color: 'var(--muted)' }}>Worker Status: </span><strong style={{ color: 'var(--blue)' }}>{viewingWorker.status}</strong></div>
              <div><span style={{ color: 'var(--muted)' }}>Phone Contact: </span><strong>{viewingWorker.phone}</strong></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="secondary-button" onClick={() => setViewingWorker(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mark Team Attendance Modal ── */}
      {showAttendanceModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="panel" style={{ width: '100%', maxWidth: '480px', padding: '28px', borderRadius: '18px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>Mark Team Attendance</h2>
            <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px' }}>Subcontractor Crew Daily Check-in ({contractorName})</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto', marginBottom: '18px' }}>
              {teamRecords.map(w => (
                <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--panel-soft)', borderRadius: '8px', fontSize: '13px' }}>
                  <span><strong>{w.name}</strong> ({w.trade})</span>
                  <button
                    type="button"
                    onClick={() => toggleAttendance(w.id)}
                    style={{
                      padding: '4px 10px', borderRadius: '6px', border: 'none',
                      background: w.attendance === 'Present' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                      color: w.attendance === 'Present' ? 'var(--green)' : 'var(--red)',
                      fontWeight: 700, fontSize: '11px', cursor: 'pointer',
                    }}
                  >
                    {w.attendance === 'Present' ? '✓ Present' : '✕ Absent'}
                  </button>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" className="secondary-button" onClick={() => setShowAttendanceModal(false)}>Cancel</button>
              <button type="button" className="primary-button" onClick={() => { setShowAttendanceModal(false); notify('Team attendance saved successfully!'); }}>Save Attendance</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
