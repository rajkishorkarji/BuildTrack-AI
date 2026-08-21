import { useState, useMemo, useEffect } from 'react';
import { ShieldCheck, Search, RefreshCw, CheckCircle2, Clock, Wrench, UserCheck, CheckSquare, X, AlertTriangle } from 'lucide-react';
import equipmentService from '../../services/equipmentService';
import taskService from '../../services/taskService';
import workforceService from '../../services/workforceService';
import { realtimeBus } from '../../services/api';

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

export default function ContractorEquipment() {
  const [equipment, setEquipment] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [workforce, setWorkforce] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const [assignUserModal, setAssignUserModal] = useState(null);
  const [assignTaskModal, setAssignTaskModal] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [eq, tList, wf] = await Promise.all([
        equipmentService.list(),
        taskService.list(),
        workforceService.list(),
      ]);
      setEquipment(Array.isArray(eq) ? eq : []);
      setTasks(Array.isArray(tList) ? tList : []);
      setWorkforce(Array.isArray(wf) ? wf : []);
    } catch (e) {
      setError('Unable to load equipment assets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const unsub = realtimeBus.subscribe('SERVER_UPDATE', () => load());
    return () => unsub();
  }, []);

  const handleAssignWorker = async () => {
    if (!assignUserModal) return;
    try {
      await equipmentService.assign(assignUserModal.id, selectedUserId ? Number(selectedUserId) : null);
      setAssignUserModal(null);
      setSelectedUserId('');
      setNotice('Equipment assigned to contractor worker!');
      setTimeout(() => setNotice(''), 3000);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Unable to assign worker');
    }
  };

  const handleAssignTask = async () => {
    if (!assignTaskModal) return;
    try {
      await equipmentService.assignTask(assignTaskModal.id, selectedTaskId ? Number(selectedTaskId) : null);
      setAssignTaskModal(null);
      setSelectedTaskId('');
      setNotice('Equipment allocated to task!');
      setTimeout(() => setNotice(''), 3000);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Unable to assign task');
    }
  };

  const filtered = useMemo(() => {
    return equipment.filter(e => {
      const q = search.trim().toLowerCase();
      return !q || [e.name, e.code, e.serialNumber, e.projectName, e.taskTitle, e.assignedUserName, e.status]
        .some(v => String(v || '').toLowerCase().includes(q));
    });
  }, [equipment, search]);

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--blue)', fontWeight: 700 }}>
            <ShieldCheck size={14} /> Subcontractor Assets
          </p>
        
        </div>
        <button type="button" className="secondary-button" onClick={load} disabled={loading}>
          <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} /> Refresh Realtime
        </button>
      </section>

      {notice && (
        <div className="panel" style={{ marginTop: 16, color: 'var(--green)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={16} /> {notice}
        </div>
      )}
      {error && (
        <div className="panel" style={{ marginTop: 16, color: 'var(--red)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Filter Row */}
      <div className="panel" style={{ marginTop: 16, padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
        <div className="search-box" style={{ flex: 1, minWidth: 220 }}>
          <Search size={15} />
          <input placeholder="Search equipment, asset code, site, task or worker..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Equipment Table */}
      <div className="panel" style={{ marginTop: 14, padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--panel-soft)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                {['Equipment Name', 'Asset Code', 'Assigned Site', 'Assigned Task', 'Assigned Worker', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} style={{ padding: 30, textAlign: 'center' }}>Loading contractor equipment…</td></tr>}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>No equipment assets assigned.</td></tr>
              )}
              {!loading && filtered.map(e => {
                const s = String(e.status || 'OPERATIONAL').toUpperCase();
                const isOp = s === 'OPERATIONAL' || s === 'AVAILABLE' || s === 'IN_USE';
                return (
                  <tr key={e.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text)' }}>
                      <Wrench size={14} style={{ marginRight: 6, color: 'var(--blue)', verticalAlign: 'middle' }} />
                      {e.name}
                    </td>
                    <td style={{ padding: 14 }}>
                      <code style={{ background: 'var(--panel-soft)', padding: '3px 7px', borderRadius: 5, fontSize: 12 }}>{e.serialNumber || e.code || `EQ-${e.id}`}</code>
                    </td>
                    <td style={{ padding: 14, color: 'var(--blue)', fontWeight: 600 }}>{e.projectName || e.project?.name || '—'}</td>
                    <td style={{ padding: 14, color: e.taskTitle ? 'var(--text)' : 'var(--muted)' }}>{e.taskTitle || 'Unallocated'}</td>
                    <td style={{ padding: 14, color: e.assignedUserName ? 'var(--text)' : 'var(--muted)' }}>{e.assignedUserName || 'Unassigned'}</td>
                    <td style={{ padding: 14 }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 10,
                        background: isOp ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)',
                        color: isOp ? 'var(--green)' : 'var(--orange)', fontSize: 11, fontWeight: 700,
                      }}>
                        {isOp ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {isOp ? 'Operational' : 'Under Maintenance'}
                      </span>
                    </td>
                    <td style={{ padding: 14 }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button className="secondary-button" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => { setAssignUserModal(e); setSelectedUserId(e.assignedUserId || e.assignedUser?.id || ''); }}>
                          <UserCheck size={12} /> Assign Worker
                        </button>
                        <button className="secondary-button" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => { setAssignTaskModal(e); setSelectedTaskId(e.taskId || ''); }}>
                          <CheckSquare size={12} /> Task
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

      {/* Assign Worker Modal */}
      {assignUserModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="panel" style={{ width: '100%', maxWidth: 440, padding: 26, borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ margin: 0 }}>Assign Equipment to Worker</h3>
              <button className="secondary-button" onClick={() => setAssignUserModal(null)}><X size={16} /></button>
            </div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Select Worker</label>
            <select style={{ ...INPUT, marginBottom: 18 }} value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}>
              <option value="">Unassign</option>
              {workforce.map(w => (
                <option key={w.id || w.userId} value={w.userId || w.id}>
                  {w.fullName || w.name} ({w.role ? String(w.role).replace(/_/g, ' ') : 'Worker'})
                </option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="secondary-button" onClick={() => setAssignUserModal(null)}>Cancel</button>
              <button className="primary-button" onClick={handleAssignWorker}>Assign Worker</button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Task Modal */}
      {assignTaskModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="panel" style={{ width: '100%', maxWidth: 440, padding: 26, borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ margin: 0 }}>Allocate Equipment to Task</h3>
              <button className="secondary-button" onClick={() => setAssignTaskModal(null)}><X size={16} /></button>
            </div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Select Task</label>
            <select style={{ ...INPUT, marginBottom: 18 }} value={selectedTaskId} onChange={e => setSelectedTaskId(e.target.value)}>
              <option value="">Unallocated</option>
              {tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="secondary-button" onClick={() => setAssignTaskModal(null)}>Cancel</button>
              <button className="primary-button" onClick={handleAssignTask}>Allocate Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
