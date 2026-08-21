import { useEffect, useMemo, useState } from 'react';
import { ShieldCheck, Wrench, AlertTriangle, CheckCircle2, RefreshCw, Search, Truck, UserCheck, FolderKanban, CheckSquare, X } from 'lucide-react';
import equipmentService from '../../services/equipmentService';
import projectService from '../../services/projectService';
import taskService from '../../services/taskService';
import workforceService from '../../services/workforceService';
import { realtimeBus } from '../../services/api';

const STATUS_META = {
  OPERATIONAL: { color: 'var(--green)', bg: 'rgba(34,197,94,0.12)', label: 'Operational' },
  IN_MAINTENANCE: { color: 'var(--orange)', bg: 'rgba(245,158,11,0.12)', label: 'In Maintenance' },
  IDLE: { color: 'var(--muted)', bg: 'var(--panel-soft)', label: 'Idle' },
  DECOMMISSIONED: { color: 'var(--red)', bg: 'rgba(239,68,68,0.12)', label: 'Decommissioned' },
  RETIRED: { color: 'var(--red)', bg: 'rgba(239,68,68,0.12)', label: 'Retired' },
};

function getStatusMeta(status) {
  const key = String(status || '').toUpperCase().replace(/\s/g, '_');
  return STATUS_META[key] || { color: 'var(--muted)', bg: 'var(--panel-soft)', label: status || '—' };
}

const INPUT = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid var(--border)',
  background: 'var(--panel-soft)',
  color: 'var(--text)',
  fontSize: 13,
  boxSizing: 'border-box',
};

export default function PMEquipment() {
  const [equipment, setEquipment] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [workforce, setWorkforce] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [assignProjModal, setAssignProjModal] = useState(null);
  const [assignTaskModal, setAssignTaskModal] = useState(null);
  const [assignUserModal, setAssignUserModal] = useState(null);

  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [eq, proj, tList, wf] = await Promise.all([
        equipmentService.list(),
        projectService.list(),
        taskService.list(),
        workforceService.list(),
      ]);
      setEquipment(Array.isArray(eq) ? eq : []);
      setProjects(Array.isArray(proj) ? proj : []);
      setTasks(Array.isArray(tList) ? tList : []);
      setWorkforce(Array.isArray(wf) ? wf : []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Unable to load equipment data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const unsub = realtimeBus.subscribe('SERVER_UPDATE', () => load());
    return () => unsub();
  }, []);

  const handleAssignProject = async () => {
    if (!assignProjModal) return;
    try {
      await equipmentService.assignProject(assignProjModal.id, selectedProjectId ? Number(selectedProjectId) : null);
      setAssignProjModal(null);
      setSelectedProjectId('');
      setSuccess('Equipment allocated to project site successfully!');
      setTimeout(() => setSuccess(''), 3000);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Unable to assign project.');
    }
  };

  const handleAssignTask = async () => {
    if (!assignTaskModal) return;
    try {
      await equipmentService.assignTask(assignTaskModal.id, selectedTaskId ? Number(selectedTaskId) : null);
      setAssignTaskModal(null);
      setSelectedTaskId('');
      setSuccess('Equipment allocated to project task!');
      setTimeout(() => setSuccess(''), 3000);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Unable to assign task.');
    }
  };

  const handleAssignUser = async () => {
    if (!assignUserModal) return;
    try {
      await equipmentService.assign(assignUserModal.id, selectedUserId ? Number(selectedUserId) : null);
      setAssignUserModal(null);
      setSelectedUserId('');
      setSuccess('Equipment assigned to site personnel!');
      setTimeout(() => setSuccess(''), 3000);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Unable to assign user.');
    }
  };

  const filtered = useMemo(() => equipment.filter(e => {
    const matchesSearch = [e.name, e.category, e.projectName, e.status, e.serialNumber, e.assignedUserName, e.taskTitle]
      .some(v => String(v || '').toLowerCase().includes(search.trim().toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || String(e.status || '').toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  }), [equipment, search, statusFilter]);

  const operational = equipment.filter(e => String(e.status || '').toUpperCase() === 'OPERATIONAL').length;
  const inMaintenance = equipment.filter(e => String(e.status || '').toUpperCase() === 'IN_MAINTENANCE').length;
  const assigned = equipment.filter(e => Boolean(e.assignedUserId || e.assignedUserName || e.taskId)).length;

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--blue)', fontWeight: 700 }}>
            <ShieldCheck size={14} /> Equipment
          </p>
          
        </div>
        <button className="secondary-button" onClick={load} disabled={loading}>
          <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} /> Refresh
        </button>
      </section>

      {error && (
        <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, color: 'var(--red)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={15} /> {error}
        </div>
      )}
      {success && (
        <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, color: 'var(--green)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={15} /> {success}
        </div>
      )}

      {/* Real-time KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginTop: 20 }}>
        {[
          { label: 'Total Fleet', value: equipment.length, color: 'var(--blue)', bg: 'rgba(37,99,235,0.1)', icon: Truck, sub: `${filtered.length} assets shown` },
          { label: 'Operational', value: operational, color: 'var(--green)', bg: 'rgba(34,197,94,0.1)', icon: CheckCircle2, sub: equipment.length ? `${Math.round((operational / equipment.length) * 100)}% availability` : 'No assets' },
          { label: 'In Maintenance', value: inMaintenance, color: 'var(--orange)', bg: 'rgba(245,158,11,0.1)', icon: Wrench, sub: equipment.length ? `${Math.round((inMaintenance / equipment.length) * 100)}% in service` : 'No assets' },
          { label: 'Allocated', value: assigned, color: 'var(--purple)', bg: 'rgba(168,85,247,0.1)', icon: UserCheck, sub: equipment.length ? `${Math.round((assigned / equipment.length) * 100)}% active allocation` : 'No assets' },
        ].map(({ label, value, color, bg, icon: Icon, sub }) => (
          <div key={label} className="panel" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>{label}</span>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={16} /></div>
            </div>
            <div style={{ marginTop: 8 }}>
              <h2 style={{ fontSize: 26, fontWeight: 800, color, margin: 0, lineHeight: 1.1 }}>{value}</h2>
              <span style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, display: 'block' }}>{sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Search and filter toolbar */}
      <div className="panel" style={{ marginTop: 20, padding: '14px 20px', display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="search-box" style={{ flex: 1, minWidth: 220 }}>
          <Search size={15} />
          <input placeholder="Search equipment, serial, project, task or assignee..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13, fontWeight: 600 }}>
          <option value="ALL">All Statuses</option>
          <option value="OPERATIONAL">Operational</option>
          <option value="IN_MAINTENANCE">In Maintenance</option>
          <option value="IDLE">Idle</option>
        </select>
        <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>{filtered.length} of {equipment.length} assets</span>
      </div>

      {/* Table */}
      <div className="panel" style={{ marginTop: 14, padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 800, borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--panel-soft)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                {['Equipment Asset', 'Project Site', 'Assigned Task', 'Assigned User', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Loading equipment…</td></tr>}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
                  <ShieldCheck size={32} style={{ display: 'block', margin: '0 auto 10px', opacity: 0.4 }} />
                  No equipment found.
                </td></tr>
              )}
              {!loading && filtered.map(e => {
                const meta = getStatusMeta(e.status);
                return (
                  <tr key={e.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Wrench size={15} style={{ color: 'var(--blue)', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: 700 }}>{e.name}</div>
                          {e.serialNumber && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>S/N: {e.serialNumber}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: 14, color: 'var(--blue)', fontWeight: 600 }}>{e.projectName || e.project?.name || 'Inventory'}</td>
                    <td style={{ padding: 14, color: e.taskTitle ? 'var(--text)' : 'var(--muted)' }}>
                      {e.taskTitle || 'Unallocated'}
                    </td>
                    <td style={{ padding: 14, color: e.assignedUserName ? 'var(--text)' : 'var(--muted)' }}>
                      {e.assignedUserName || 'Unassigned'}
                    </td>
                    <td style={{ padding: 14 }}>
                      <span style={{ padding: '4px 10px', borderRadius: 8, background: meta.bg, color: meta.color, fontSize: 11, fontWeight: 700 }}>
                        {meta.label}
                      </span>
                    </td>
                    <td style={{ padding: 14 }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button className="secondary-button" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => { setAssignProjModal(e); setSelectedProjectId(e.projectId || e.project?.id || ''); }}>
                          <FolderKanban size={12} /> Project
                        </button>
                        <button className="secondary-button" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => { setAssignTaskModal(e); setSelectedTaskId(e.taskId || ''); }}>
                          <CheckSquare size={12} /> Task
                        </button>
                        <button className="secondary-button" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => { setAssignUserModal(e); setSelectedUserId(e.assignedUserId || e.assignedUser?.id || ''); }}>
                          <UserCheck size={12} /> Worker
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Assign Project */}
      {assignProjModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="panel" style={{ width: '100%', maxWidth: 440, padding: 26, borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ margin: 0 }}>Assign Equipment to Project</h3>
              <button className="secondary-button" onClick={() => setAssignProjModal(null)}><X size={16} /></button>
            </div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Select Project Site</label>
            <select style={{ ...INPUT, marginBottom: 18 }} value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)}>
              <option value="">Company Fleet Inventory (Unassigned)</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="secondary-button" onClick={() => setAssignProjModal(null)}>Cancel</button>
              <button className="primary-button" onClick={handleAssignProject}>Assign Project</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Assign Task */}
      {assignTaskModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="panel" style={{ width: '100%', maxWidth: 440, padding: 26, borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ margin: 0 }}>Allocate Equipment to Task</h3>
              <button className="secondary-button" onClick={() => setAssignTaskModal(null)}><X size={16} /></button>
            </div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Select Project Task</label>
            <select style={{ ...INPUT, marginBottom: 18 }} value={selectedTaskId} onChange={e => setSelectedTaskId(e.target.value)}>
              <option value="">Unassigned to Task</option>
              {tasks.map(t => <option key={t.id} value={t.id}>{t.title} ({t.projectName || 'Site'})</option>)}
            </select>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="secondary-button" onClick={() => setAssignTaskModal(null)}>Cancel</button>
              <button className="primary-button" onClick={handleAssignTask}>Allocate Task</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Assign User / Worker */}
      {assignUserModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="panel" style={{ width: '100%', maxWidth: 440, padding: 26, borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ margin: 0 }}>Assign Equipment to Worker / Personnel</h3>
              <button className="secondary-button" onClick={() => setAssignUserModal(null)}><X size={16} /></button>
            </div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Select Personnel / Worker</label>
            <select style={{ ...INPUT, marginBottom: 18 }} value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}>
              <option value="">Unassign</option>
              {workforce.map(w => (
                <option key={w.id || w.userId} value={w.userId || w.id}>
                  {w.fullName || w.name} ({w.role ? String(w.role).replace(/_/g, ' ') : 'Personnel'})
                </option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="secondary-button" onClick={() => setAssignUserModal(null)}>Cancel</button>
              <button className="primary-button" onClick={handleAssignUser}>Assign Worker</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
