import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  FolderKanban, Search, Eye, CheckCircle2, Clock, Users,
  Wrench, Package, FileText, Upload, Plus, Camera, Send, X, ShieldCheck
} from 'lucide-react';

const INPUT = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: '13px' };

export default function ContractorProjects() {
  const { projects = [], tasks = [], workers = [], equipment = [], materials = [], addProgressReport } = useData();
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  // Active Contractor Modals
  const [viewingProject, setViewingProject] = useState(null);
  const [activeDetailSection, setActiveDetailSection] = useState('info'); // info, team, tasks, equipment, materials, progress
  const [progressModalProj, setProgressModalProj] = useState(null);
  const [tasksModalProj, setTasksModalProj] = useState(null);
  const [workersModalProj, setWorkersModalProj] = useState(null);

  // Daily Progress Submit Form state
  const [workNotes, setWorkNotes] = useState('');
  const [newProgress, setNewProgress] = useState('65');
  const [sitePhoto, setSitePhoto] = useState(null);
  const [notice, setNotice] = useState('');

  // Material & Equipment Request states inside details modal
  const [materialReq, setMaterialReq] = useState({ name: '', qty: '' });
  const [equipReq, setEquipReq] = useState({ type: '', purpose: '' });

  const defaultContractorProjects = [
    {
      id: 'c-101',
      name: 'Metro Tower',
      location: 'Mumbai',
      seName: 'Rahul Sharma',
      pmName: 'Rajesh Verma',
      progress: 65,
      status: 'Active',
      startDate: '2026-01-15',
      deadline: '2026-12-31',
      budget: 1500000,
    },
    {
      id: 'c-102',
      name: 'Highway Bridge',
      location: 'Pune',
      seName: 'Amit Kumar',
      pmName: 'Priya Patel',
      progress: 40,
      status: 'Active',
      startDate: '2026-03-01',
      deadline: '2027-04-30',
      budget: 2800000,
    },
    {
      id: 'c-103',
      name: 'Shopping Mall',
      location: 'Delhi',
      seName: 'Vivek Singh',
      pmName: 'Amit Sharma',
      progress: 100,
      status: 'Completed',
      startDate: '2025-06-01',
      deadline: '2026-07-15',
      budget: 4200000,
    },
  ];

  const contractorProjectList = projects.length > 0 ? projects.map(p => ({
    id: p.id,
    name: p.name,
    location: p.location || 'Site Location',
    seName: p.seName || 'Rahul Sharma',
    pmName: p.pmName || 'Rajesh Verma',
    progress: p.progress || 0,
    status: p.status || 'Active',
    startDate: p.startDate || '2026-01-01',
    deadline: p.deadline || '2026-12-31',
    budget: p.budget || 1500000,
  })) : defaultContractorProjects;

  const [projectRecords, setProjectRecords] = useState(contractorProjectList);

  const filteredProjects = projectRecords.filter(p =>
    (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.location || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.seName || '').toLowerCase().includes(search.toLowerCase())
  );

  // KPI Calculations
  const totalAssignedProjects = projectRecords.length;
  const activeProjectsCount = projectRecords.filter(p => p.status === 'Active' || p.status === 'In Progress').length;
  const pendingTasksCount = tasks.filter(t => (t.status || '').toLowerCase() !== 'completed' && (t.status || '').toLowerCase() !== 'done').length || 8;
  const completedTasksCount = tasks.filter(t => (t.status || '').toLowerCase() === 'completed' || (t.status || '').toLowerCase() === 'done').length || 14;

  const notify = (msg) => { setNotice(msg); setTimeout(() => setNotice(''), 4000); };

  const handleSubmitProgress = (e) => {
    e.preventDefault();
    if (!workNotes.trim()) return;
    const targetProj = progressModalProj || viewingProject;
    if (targetProj) {
      setProjectRecords(prev => prev.map(p => String(p.id) === String(targetProj.id) ? { ...p, progress: parseInt(newProgress, 10) || p.progress } : p));
      if (addProgressReport) {
        addProgressReport({
          projectId: targetProj.id,
          projectName: targetProj.name,
          workCompleted: workNotes.trim(),
          newTotalProgress: parseInt(newProgress, 10) || targetProj.progress,
          submittedBy: user?.fullName || 'Contractor Lead',
          date: new Date().toISOString().slice(0, 10),
        });
      }
    }
    notify(`Progress submitted for ${targetProj?.name || 'Project'}! Progress updated to ${newProgress}%.`);
    setWorkNotes('');
    setProgressModalProj(null);
  };

  return (
    <div className="dashboard-page">
      {/* ── Header (No Create Project Button) ── */}
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <FolderKanban size={14} /> Projects
          </p>
        </div>
      </section>

      {notice && (
        <div style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid var(--green)', color: 'var(--green)', padding: '14px 18px', borderRadius: '12px', fontWeight: 700, fontSize: '14px', marginTop: '16px' }}>
          ✓ {notice}
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginTop: '20px' }}>
        {[
          { label: 'Assigned Projects', value: totalAssignedProjects, color: 'var(--blue)', icon: FolderKanban },
          { label: 'Active Projects', value: activeProjectsCount, color: 'var(--green)', icon: CheckCircle2 },
          { label: 'Pending Tasks', value: pendingTasksCount, color: 'var(--orange)', icon: Clock },
          { label: 'Completed Tasks', value: completedTasksCount, color: 'var(--purple)', icon: CheckCircle2 },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>{label}</span>
              <Icon size={18} style={{ color, opacity: 0.8 }} />
            </div>
            <div>
              <h2 style={{ fontSize: '24px', color, margin: '6px 0 2px 0', fontWeight: 800 }}>{value}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search Toolbar ── */}
      <div className="panel" style={{ marginTop: '20px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="search-box" style={{ width: '340px' }}>
          <Search size={16} style={{ color: 'var(--muted)' }} />
          <input
            placeholder="Search by project name or site..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>
          Contractor View • {filteredProjects.length} Sites Assigned
        </span>
      </div>

      {/* ── Projects Table ── */}
      <div className="panel" style={{ marginTop: '16px', padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--panel-soft)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Project Name</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Site Location</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Site Engineer</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Progress</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map(proj => (
              <tr key={proj.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text)' }}>
                  {proj.name}
                </td>
                <td style={{ padding: '14px', color: 'var(--muted)', fontWeight: 500 }}>
                  {proj.location}
                </td>
                <td style={{ padding: '14px', color: 'var(--blue)', fontWeight: 600 }}>
                  {proj.seName}
                </td>
                <td style={{ padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '130px' }}>
                    <div style={{ flex: 1, height: '6px', background: 'var(--panel-soft)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${proj.progress || 0}%`, height: '100%', background: 'var(--blue)' }} />
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--blue)', fontSize: '12px' }}>{proj.progress || 0}%</span>
                  </div>
                </td>
                <td style={{ padding: '14px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: proj.status === 'Completed' ? 'rgba(34,197,94,0.12)' : 'rgba(37,99,235,0.12)',
                    color: proj.status === 'Completed' ? 'var(--green)' : 'var(--blue)',
                  }}>
                    {proj.status}
                  </span>
                </td>
                <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                  {/* Contractor Permitted Row Actions Only */}
                  <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                    <button
                      type="button"
                      className="secondary-button"
                      style={{ fontSize: '12px', padding: '5px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      onClick={() => { setViewingProject(proj); setActiveDetailSection('info'); }}
                      title="View Project Details"
                    >
                      <Eye size={13} /> View
                    </button>

                    <button
                      type="button"
                      className="secondary-button"
                      style={{ fontSize: '12px', padding: '5px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      onClick={() => setTasksModalProj(proj)}
                      title="View Tasks"
                    >
                      <FileText size={13} /> Tasks
                    </button>

                    <button
                      type="button"
                      className="secondary-button"
                      style={{ fontSize: '12px', padding: '5px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      onClick={() => setWorkersModalProj(proj)}
                      title="View Assigned Workers"
                    >
                      <Users size={13} /> Workers
                    </button>

                    <button
                      type="button"
                      className="secondary-button"
                      style={{ fontSize: '12px', padding: '5px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--blue)' }}
                      onClick={() => { setProgressModalProj(proj); setNewProgress(String(proj.progress)); }}
                      title="Submit Progress"
                    >
                      <Upload size={13} /> Progress
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── 1. INSIDE PROJECT DETAILS MODAL (When contractor clicks View) ── */}
      {viewingProject && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="panel" style={{ width: '100%', maxWidth: '780px', padding: '28px', borderRadius: '20px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text)' }}>{viewingProject.name}</h2>
                <span style={{ fontSize: '13px', color: 'var(--blue)', fontWeight: 600 }}>{viewingProject.location} • Contractor Portal</span>
              </div>
              <button type="button" className="secondary-button" style={{ padding: '6px 10px' }} onClick={() => setViewingProject(null)}>
                <X size={16} />
              </button>
            </div>

            {/* Inner Tabs for Project Details */}
            <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '20px', overflowX: 'auto' }}>
              {[
                ['info', 'Project Information'],
                ['team', 'My Team'],
                ['tasks', 'My Tasks'],
                ['equipment', 'Equipment'],
                ['materials', 'Materials'],
                ['progress', 'Daily Progress'],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveDetailSection(id)}
                  style={{
                    padding: '7px 14px', borderRadius: '8px', border: 'none',
                    background: activeDetailSection === id ? 'var(--blue)' : 'var(--panel-soft)',
                    color: activeDetailSection === id ? '#fff' : 'var(--muted)',
                    fontSize: '12px', fontWeight: 600, cursor: 'pointer', flexShrink: 0,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* ── Section A: Project Information ── */}
            {activeDetailSection === 'info' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', background: 'var(--panel-soft)', padding: '18px', borderRadius: '12px', fontSize: '13px' }}>
                  <div><span style={{ color: 'var(--muted)', display: 'block', fontSize: '12px' }}>Project Name</span><strong style={{ fontSize: '15px' }}>{viewingProject.name}</strong></div>
                  <div><span style={{ color: 'var(--muted)', display: 'block', fontSize: '12px' }}>Site Location</span><strong>{viewingProject.location}</strong></div>
                  <div><span style={{ color: 'var(--muted)', display: 'block', fontSize: '12px' }}>Site Engineer</span><strong style={{ color: 'var(--blue)' }}>{viewingProject.seName}</strong></div>
                  <div><span style={{ color: 'var(--muted)', display: 'block', fontSize: '12px' }}>Project Manager</span><strong>{viewingProject.pmName}</strong></div>
                  <div><span style={{ color: 'var(--muted)', display: 'block', fontSize: '12px' }}>Start & End Date</span><strong>{viewingProject.startDate} / {viewingProject.deadline}</strong></div>
                  <div><span style={{ color: 'var(--muted)', display: 'block', fontSize: '12px' }}>Overall Progress</span><strong style={{ color: 'var(--green)' }}>{viewingProject.progress}% Completed</strong></div>
                </div>
              </div>
            )}

            {/* ── Section B: My Team (Assigned Workers & Attendance Summary) ── */}
            {activeDetailSection === 'team' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>Assigned Workers & Attendance Summary</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                  <div style={{ padding: '14px', background: 'var(--panel-soft)', borderRadius: '10px' }}>
                    <span style={{ color: 'var(--muted)', fontSize: '12px' }}>Total Subcontract Workers</span>
                    <h3 style={{ color: 'var(--blue)', fontSize: '20px', margin: '4px 0 0 0', fontWeight: 800 }}>14 Active Workers</h3>
                  </div>
                  <div style={{ padding: '14px', background: 'var(--panel-soft)', borderRadius: '10px' }}>
                    <span style={{ color: 'var(--muted)', fontSize: '12px' }}>Today's Attendance Rate</span>
                    <h3 style={{ color: 'var(--green)', fontSize: '20px', margin: '4px 0 0 0', fontWeight: 800 }}>93% Present</h3>
                  </div>
                </div>

                <div style={{ background: 'var(--panel-soft)', padding: '14px', borderRadius: '12px' }}>
                  <strong style={{ display: 'block', marginBottom: '8px', fontSize: '13px' }}>Roster Breakdown</strong>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: 'var(--muted)', lineHeight: '1.8' }}>
                    <li>Rahul Mason (Senior Mason) — Present (Check-in 08:05 AM)</li>
                    <li>Suresh Welder (Structural Welder) — Present (Check-in 08:12 AM)</li>
                    <li>Karan Loader (Field Helper) — Present (Check-in 08:20 AM)</li>
                  </ul>
                </div>
              </div>
            )}

            {/* ── Section C: My Tasks (Pending & Completed Tasks) ── */}
            {activeDetailSection === 'tasks' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div style={{ background: 'var(--panel-soft)', padding: '16px', borderRadius: '12px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--orange)', marginBottom: '8px' }}>Pending Tasks (2)</h4>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'var(--text)', lineHeight: '1.6' }}>
                      <li>Concrete Pouring Beam 4B (Due 2026-08-10)</li>
                      <li>Scaffolding Dismantling Zone A (Due 2026-08-12)</li>
                    </ul>
                  </div>

                  <div style={{ background: 'var(--panel-soft)', padding: '16px', borderRadius: '12px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--green)', marginBottom: '8px' }}>Completed Tasks (4)</h4>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'var(--muted)', lineHeight: '1.6' }}>
                      <li>Foundation Shuttering Verified</li>
                      <li>Rebar Steel Inspection Passed</li>
                      <li>Sub-base Level Excavation Finished</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* ── Section D: Equipment (Assigned & Requests) ── */}
            {activeDetailSection === 'equipment' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: 'var(--panel-soft)', padding: '16px', borderRadius: '12px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Assigned Fleet Equipment</h4>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
                    • Caterpillar Excavator 320D (Status: Operational)<br />
                    • Tower Crane TC-500 (Status: Operational)
                  </p>
                </div>

                <div style={{ border: '1px solid var(--border)', padding: '16px', borderRadius: '12px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>Equipment Request Form</h4>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="text" placeholder="Requested Equipment Type" style={INPUT} value={equipReq.type} onChange={e => setEquipReq({ ...equipReq, type: e.target.value })} />
                    <button type="button" className="primary-button" onClick={() => { notify('Equipment request submitted to Site Engineer.'); setEquipReq({ type: '', purpose: '' }); }}>Submit Request</button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Section E: Materials (Requests & Status) ── */}
            {activeDetailSection === 'materials' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: 'var(--panel-soft)', padding: '16px', borderRadius: '12px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Site Material Status</h4>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
                    • Grade 53 Cement: <strong>480 Bags Available</strong><br />
                    • 16mm TMT Steel Rods: <strong>12 Tons Available</strong>
                  </p>
                </div>

                <div style={{ border: '1px solid var(--border)', padding: '16px', borderRadius: '12px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>Material Indent Request</h4>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="text" placeholder="Material Name & Quantity" style={INPUT} value={materialReq.name} onChange={e => setMaterialReq({ ...materialReq, name: e.target.value })} />
                    <button type="button" className="primary-button" onClick={() => { notify('Material indent request submitted.'); setMaterialReq({ name: '', qty: '' }); }}>Submit Request</button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Section F: Daily Progress (Upload Progress, Work Notes, Site Photos) ── */}
            {activeDetailSection === 'progress' && (
              <form onSubmit={handleSubmitProgress} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--muted)', marginBottom: '4px', fontWeight: 600 }}>Upload Progress (%)</label>
                  <input type="number" min="0" max="100" value={newProgress} onChange={e => setNewProgress(e.target.value)} style={INPUT} />
                </div>

                <div>
                  <label style={{ display: 'block', color: 'var(--muted)', marginBottom: '4px', fontWeight: 600 }}>Add Work Notes *</label>
                  <textarea placeholder="Write site progress notes and milestones completed today..." rows={3} value={workNotes} onChange={e => setWorkNotes(e.target.value)} required style={{ ...INPUT, resize: 'vertical' }} />
                </div>

                <div>
                  <label style={{ display: 'block', color: 'var(--muted)', marginBottom: '4px', fontWeight: 600 }}>Upload Site Photos</label>
                  <input type="file" onChange={e => setSitePhoto(e.target.files?.[0])} style={INPUT} />
                </div>

                <button type="submit" className="primary-button" style={{ marginTop: '8px' }}>
                  Submit Daily Progress Log
                </button>
              </form>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button type="button" className="secondary-button" onClick={() => setViewingProject(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. TASKS MODAL ── */}
      {tasksModalProj && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="panel" style={{ width: '100%', maxWidth: '520px', padding: '28px', borderRadius: '18px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>{tasksModalProj.name} Tasks</h2>
            <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px' }}>Assigned Contractor Field Tasks</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ padding: '12px', background: 'var(--panel-soft)', borderRadius: '8px' }}>
                <strong style={{ color: 'var(--text)' }}>1. Concrete Pouring Slab Level 2</strong>
                <div style={{ fontSize: '12px', color: 'var(--orange)' }}>Status: In Progress • Target: 2026-08-10</div>
              </div>
              <div style={{ padding: '12px', background: 'var(--panel-soft)', borderRadius: '8px' }}>
                <strong style={{ color: 'var(--text)' }}>2. Rebar Binding Retaining Wall</strong>
                <div style={{ fontSize: '12px', color: 'var(--green)' }}>Status: Completed • Verified by Site Engineer</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '18px' }}>
              <button type="button" className="secondary-button" onClick={() => setTasksModalProj(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. WORKERS MODAL ── */}
      {workersModalProj && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="panel" style={{ width: '100%', maxWidth: '520px', padding: '28px', borderRadius: '18px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>{workersModalProj.name} Workers</h2>
            <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px' }}>Contractor Subcontract Crew Roster</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ padding: '10px 14px', background: 'var(--panel-soft)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Rahul Mason (Mason)</span>
                <strong style={{ color: 'var(--green)' }}>Present Today</strong>
              </div>
              <div style={{ padding: '10px 14px', background: 'var(--panel-soft)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Suresh Welder (Welder)</span>
                <strong style={{ color: 'var(--green)' }}>Present Today</strong>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '18px' }}>
              <button type="button" className="secondary-button" onClick={() => setWorkersModalProj(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. SUBMIT PROGRESS MODAL ── */}
      {progressModalProj && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="panel" style={{ width: '100%', maxWidth: '480px', padding: '28px', borderRadius: '18px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>Submit Daily Progress</h2>
            <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px' }}>{progressModalProj.name}</p>

            <form onSubmit={handleSubmitProgress} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--muted)', marginBottom: '4px', fontWeight: 600 }}>New Progress (%)</label>
                <input type="number" min="0" max="100" value={newProgress} onChange={e => setNewProgress(e.target.value)} style={INPUT} />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--muted)', marginBottom: '4px', fontWeight: 600 }}>Add Work Notes *</label>
                <textarea placeholder="Describe work completed today..." rows={3} value={workNotes} onChange={e => setWorkNotes(e.target.value)} required style={{ ...INPUT, resize: 'vertical' }} />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--muted)', marginBottom: '4px', fontWeight: 600 }}>Upload Site Photos</label>
                <input type="file" style={INPUT} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="secondary-button" onClick={() => setProgressModalProj(null)}>Cancel</button>
                <button type="submit" className="primary-button">Submit Progress</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
