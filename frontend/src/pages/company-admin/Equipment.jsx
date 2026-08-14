import { useEffect, useState, useMemo } from 'react';
import { Plus, Search, Wrench, RefreshCw, AlertTriangle, CheckCircle2, Settings2, X } from 'lucide-react';
import equipmentService from '../../services/equipmentService';
import projectService from '../../services/projectService';
import workforceService from '../../services/workforceService';
import { realtimeBus } from '../../services/api';

const CATEGORIES = ['Heavy Machinery', 'Vehicle', 'Power Tool', 'Safety Gear', 'Lifting Equipment', 'Earthwork Equipment'];

const STATUS_META = {
  OPERATIONAL: { label: 'Operational', color: 'var(--green)', bg: 'rgba(34,197,94,0.12)' },
  IN_MAINTENANCE: { label: 'In Maintenance', color: 'var(--orange)', bg: 'rgba(245,158,11,0.12)' },
  IDLE: { label: 'Idle', color: 'var(--muted)', bg: 'var(--panel-soft)' },
  RETIRED: { label: 'Retired', color: 'var(--red)', bg: 'rgba(239,68,68,0.12)' },
};

function getStatusMeta(status) {
  const key = String(status || '').toUpperCase().replace(/\s/g, '_');
  return STATUS_META[key] || { label: status || 'Unknown', color: 'var(--muted)', bg: 'var(--panel-soft)' };
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

const emptyForm = {
  name: '',
  category: 'Heavy Machinery',
  serialNumber: '',
  dailyCost: '0',
  projectId: '',
};

export default function CompanyAdminEquipment() {
  const [equipment, setEquipment] = useState([]);
  const [projects, setProjects] = useState([]);
  const [workforce, setWorkforce] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [open, setOpen] = useState(false);
  const [assignModal, setAssignModal] = useState(null);
  const [assignUserId, setAssignUserId] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [eq, proj, wf] = await Promise.all([
        equipmentService.list(),
        projectService.list(),
        workforceService.list(),
      ]);
      setEquipment(eq || []);
      setProjects(proj || []);
      setWorkforce(wf || []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Unable to load equipment data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const unsub = realtimeBus.subscribe('SERVER_UPDATE', () => load());
    return () => unsub();
  }, []);

  const getProjectName = (eq) => {
    if (eq.project?.name) return eq.project.name;
    if (eq.projectName) return eq.projectName;
    const projId = eq.projectId || eq.project?.id;
    if (projId && projects.length > 0) {
      const proj = projects.find(p => p.id === Number(projId));
      if (proj?.name) return proj.name;
    }
    return '—';
  };

  const getAssignedUserName = (eq) => {
    if (eq.assignedUser) {
      const name = `${eq.assignedUser.firstName || ''} ${eq.assignedUser.lastName || ''}`.trim() || eq.assignedUser.fullName || eq.assignedUser.email;
      if (name) return name;
    }
    if (eq.assignedUserName) return eq.assignedUserName;
    const userId = eq.assignedUserId || eq.assignedUser?.id;
    if (userId && workforce.length > 0) {
      const member = workforce.find(w => w.id === Number(userId) || w.userId === Number(userId));
      if (member) {
        return `${member.firstName || member.fullName || member.name || ''} ${member.lastName || ''}`.trim();
      }
    }
    return 'Unassigned';
  };

  const create = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Equipment name is required.'); return; }
    if (!form.projectId) { setError('Please select a project.'); return; }
    setSubmitting(true);
    setError('');
    try {
      await equipmentService.create({
        name: form.name.trim(),
        category: form.category,
        serialNumber: form.serialNumber.trim() || null,
        dailyCost: Number(form.dailyCost || 0),
        project: { id: Number(form.projectId) },
        status: 'OPERATIONAL',
      });
      setOpen(false);
      setForm(emptyForm);
      setSuccess('Equipment registered successfully!');
      setTimeout(() => setSuccess(''), 3000);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to register equipment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (eq) => {
    const next = String(eq.status || '').toUpperCase() === 'OPERATIONAL' ? 'IN_MAINTENANCE' : 'OPERATIONAL';
    try {
      await equipmentService.updateStatus(eq.id, next);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Unable to update status.');
    }
  };

  const handleAssign = async () => {
    if (!assignModal || !assignUserId) return;
    try {
      await equipmentService.assign(assignModal.id, Number(assignUserId));
      setAssignModal(null);
      setAssignUserId('');
      setSuccess('Equipment assigned successfully! Syncing real-time updates.');
      setTimeout(() => setSuccess(''), 3000);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Unable to assign equipment.');
    }
  };

  const filtered = useMemo(() => {
    return equipment.filter(x => {
      const projName = getProjectName(x);
      const assignee = getAssignedUserName(x);
      const matchSearch = [x.name, x.serialNumber, x.category, projName, assignee].join(' ').toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'ALL' || String(x.status || '').toUpperCase() === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [equipment, search, filterStatus, projects, workforce]);

  const operationalCount = equipment.filter(x => String(x.status || '').toUpperCase() === 'OPERATIONAL').length;
  const maintenanceCount = equipment.filter(x => String(x.status || '').toUpperCase() === 'IN_MAINTENANCE').length;
  const assignedCount = equipment.filter(x => x.assignedUser || x.assignedUserId || x.assignedUserName).length;

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--blue)', fontWeight: 700 }}>
            <Wrench size={14} /> Equipment
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="secondary-button" onClick={load} disabled={loading}>
            <RefreshCw size={15} style={loading ? { animation: 'spin 1s linear infinite' } : {}} /> Refresh
          </button>
          <button type="button" className="primary-button" onClick={() => { setForm(emptyForm); setError(''); setOpen(true); }}>
            <Plus size={16} /> Register Equipment
          </button>
        </div>
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

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 16, marginTop: 20 }}>
        {[
          { label: 'Total Fleet', value: equipment.length, color: 'var(--blue)' },
          { label: 'Operational', value: operationalCount, color: 'var(--green)' },
          { label: 'In Maintenance', value: maintenanceCount, color: 'var(--orange)' },
          { label: 'Assigned', value: assignedCount, color: 'var(--purple)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="panel" style={{ padding: 20 }}>
            <span style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 600 }}>{label}</span>
            <h2 style={{ fontSize: 26, color, margin: '4px 0 0', fontWeight: 800 }}>{value}</h2>
          </div>
        ))}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="panel" style={{ marginTop: 20, padding: '14px 20px', display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="search-box" style={{ flex: 1, minWidth: 220 }}>
          <Search size={15} />
          <input placeholder="Search equipment name, serial, category, project..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13, fontWeight: 600 }}
        >
          <option value="ALL">All Statuses</option>
          <option value="OPERATIONAL">Operational</option>
          <option value="IN_MAINTENANCE">In Maintenance</option>
          <option value="IDLE">Idle</option>
          <option value="RETIRED">Retired</option>
        </select>
        <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
          {filtered.length} of {equipment.length} assets
        </span>
      </div>

      {/* Equipment Table */}
      <div className="panel" style={{ marginTop: 16, padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 700, borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--panel-soft)', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                {['Equipment', 'Category', 'Project', 'Assigned To', 'Daily Cost', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Loading equipment...</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: 'center' }}>
                    <Wrench size={32} style={{ color: 'var(--muted)', marginBottom: 10, display: 'block', margin: '0 auto 10px' }} />
                    <div style={{ color: 'var(--text)', fontWeight: 700 }}>No equipment found</div>
                    <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4 }}>Register your first equipment asset to get started.</div>
                  </td>
                </tr>
              )}
              {!loading && filtered.map(x => {
                const meta = getStatusMeta(x.status);
                const projName = getProjectName(x);
                const assignedName = getAssignedUserName(x);
                return (
                  <tr key={x.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text)' }}>{x.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--blue)', marginTop: 2 }}>{x.serialNumber || `EQ-${String(x.id).padStart(4,'0')}`}</div>
                    </td>
                    <td style={{ padding: 14, color: 'var(--muted)' }}>{x.category || '—'}</td>
                    <td style={{ padding: 14, color: 'var(--blue)', fontWeight: 600 }}>{projName}</td>
                    <td style={{ padding: 14 }}>
                      {assignedName !== 'Unassigned'
                        ? <span style={{ fontWeight: 600, color: 'var(--text)' }}>{assignedName}</span>
                        : <span style={{ color: 'var(--muted)' }}>Unassigned</span>}
                    </td>
                    <td style={{ padding: 14, fontWeight: 700 }}>
                      {x.dailyCost ? `₹${Number(x.dailyCost).toLocaleString('en-IN')}/day` : '—'}
                    </td>
                    <td style={{ padding: 14 }}>
                      <span style={{ padding: '4px 10px', borderRadius: 10, background: meta.bg, color: meta.color, fontSize: 11, fontWeight: 700 }}>
                        {meta.label}
                      </span>
                    </td>
                    <td style={{ padding: 14 }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button
                          className="secondary-button"
                          style={{ fontSize: 11, padding: '4px 10px' }}
                          onClick={() => toggleStatus(x)}
                        >
                          <Settings2 size={12} /> {String(x.status || '').toUpperCase() === 'OPERATIONAL' ? 'To Maintenance' : 'Set Operational'}
                        </button>
                        <button
                          className="secondary-button"
                          style={{ fontSize: 11, padding: '4px 10px' }}
                          onClick={() => { setAssignModal(x); setAssignUserId(''); }}
                        >
                          Assign
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

      {/* Register Equipment Modal */}
      {open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <form className="panel" onSubmit={create} style={{ width: '100%', maxWidth: 540, padding: 30, borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Register Equipment</h2>
                <p style={{ color: 'var(--muted)', fontSize: 13, margin: '4px 0 0' }}>Add a new asset to the company fleet.</p>
              </div>
              <button type="button" className="secondary-button" onClick={() => setOpen(false)} style={{ padding: 6 }}>
                <X size={16} />
              </button>
            </div>

            {error && (
              <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.1)', borderRadius: 8, color: 'var(--red)', fontSize: 13 }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Equipment Name *</label>
                <input required style={INPUT} placeholder="e.g. JCB 3CX Backhoe Loader" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Serial Number</label>
                <input style={INPUT} placeholder="e.g. JCB-2024-001 (optional)" value={form.serialNumber} onChange={e => setForm({ ...form, serialNumber: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Category</label>
                <select style={{ ...INPUT, cursor: 'pointer' }} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Daily Cost (₹)</label>
                <input type="number" min="0" step="0.01" style={INPUT} placeholder="0.00" value={form.dailyCost} onChange={e => setForm({ ...form, dailyCost: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Assign to Project *</label>
                <select required style={{ ...INPUT, cursor: 'pointer' }} value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })}>
                  <option value="">Select a project</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
              <button type="button" className="secondary-button" onClick={() => { setOpen(false); setError(''); }}>Cancel</button>
              <button type="submit" className="primary-button" disabled={submitting}>
                {submitting ? 'Registering...' : 'Register Equipment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assign User Modal */}
      {assignModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="panel" style={{ width: '100%', maxWidth: 440, padding: 28, borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Assign Equipment</h2>
                <p style={{ color: 'var(--muted)', fontSize: 13, margin: '4px 0 0' }}>Assign <strong>{assignModal.name}</strong> to a team member.</p>
              </div>
              <button type="button" className="secondary-button" onClick={() => setAssignModal(null)} style={{ padding: 6 }}>
                <X size={16} />
              </button>
            </div>

            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Select Personnel</label>
            <select style={{ ...INPUT, cursor: 'pointer', marginBottom: 20 }} value={assignUserId} onChange={e => setAssignUserId(e.target.value)}>
              <option value="">Select a team member</option>
              {workforce.map(w => (
                <option key={w.id || w.userId} value={w.userId || w.id}>
                  {w.firstName || w.fullName || w.name} {w.lastName || ''} — ({w.role ? String(w.role).replace(/_/g, ' ') : 'Personnel'})
                </option>
              ))}
            </select>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="secondary-button" onClick={() => setAssignModal(null)}>Cancel</button>
              <button type="button" className="primary-button" disabled={!assignUserId} onClick={handleAssign}>Assign Asset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
