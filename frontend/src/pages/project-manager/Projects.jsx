import { useEffect, useState } from 'react';
import { FolderKanban, MapPin, Calendar, Users, Eye, X, Plus } from 'lucide-react';
import projectService from '../../services/projectService';
import { formatINR } from '../../utils/currency';

const ROLES = [
  ['SITE_ENGINEER', 'Site Engineer'],
  ['CONTRACTOR', 'Contractor'],
  ['WORKER', 'Worker'],
];

export default function ProjectManagerProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [eligible, setEligible] = useState([]);
  const [role, setRole] = useState('SITE_ENGINEER');
  const [selectedUser, setSelectedUser] = useState('');

  const loadProjects = async () => {
    setLoading(true);
    setError('');
    try {
      setProjects(await projectService.list());
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to load assigned projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProjects(); }, []);

  const openAssignments = async (project) => {
    setSelected(project);
    setError('');
    setRole('SITE_ENGINEER');
    setSelectedUser('');
    try {
      setAssignments(await projectService.assignments(project.id));
      await loadEligible('SITE_ENGINEER');
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to load assignments');
    }
  };

  const loadEligible = async (nextRole) => {
    setRole(nextRole);
    setSelectedUser('');
    try {
      setEligible(await projectService.eligibleUsers(nextRole));
    } catch (e) {
      setEligible([]);
      setError(e.response?.data?.message || 'Unable to load eligible users');
    }
  };

  const assign = async () => {
    if (!selected || !selectedUser) return;
    setBusy(true);
    setError('');
    try {
      await projectService.assign(selected.id, Number(selectedUser), role);
      setAssignments(await projectService.assignments(selected.id));
      setSelectedUser('');
      await loadProjects();
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to assign personnel');
    } finally {
      setBusy(false);
    }
  };

  const unassign = async (userId) => {
    if (!selected) return;
    try {
      await projectService.unassign(selected.id, userId);
      setAssignments(await projectService.assignments(selected.id));
      await loadProjects();
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to remove assignment');
    }
  };

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--blue)', fontWeight: 700 }}>
            <FolderKanban size={14} /> Projects
          </p>
          <h1>Managed Projects</h1>
          <p>Projects assigned to you by Company Admin. Assign Site Engineers, Contractors & Workers to manage project execution.</p>
        </div>
      </section>

      {error && <div className="panel" style={{ color: 'var(--orange)', marginBottom: 16 }}>{error}</div>}

      {loading && <div className="panel" style={{ padding: 30, textAlign: 'center' }}>Loading assigned projects…</div>}

      {!loading && projects.length === 0 && (
        <div className="panel" style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
          No projects assigned to you yet by Company Admin.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 16 }}>
        {projects.map(p => (
          <article className="panel" key={p.id} style={{ padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16 }}>{p.name}</h3>
                  <small style={{ color: 'var(--blue)', fontWeight: 600 }}>{p.code || `PRJ-${p.id}`}</small>
                </div>
                <span style={{ padding: '3px 10px', borderRadius: 8, background: 'rgba(34,197,94,0.12)', color: 'var(--green)', fontSize: 11, fontWeight: 700 }}>
                  {p.status}
                </span>
              </div>
              <p style={{ color: 'var(--muted)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
                <MapPin size={14} style={{ color: 'var(--blue)' }} /> {p.location || 'No site location'}
              </p>
              <p style={{ color: 'var(--muted)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <Calendar size={14} /> {p.startDate || '—'} → {p.estEndDate || '—'}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, fontSize: 13 }}>
                <strong>Budget: {formatINR(p.budget)}</strong>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--muted)' }}>
                  <Users size={14} /> {p.assignments?.length || 0} Members
                </span>
              </div>
              <div style={{ marginTop: 12, height: 6, background: 'var(--panel-soft)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${p.progressPercentage || 0}%`, height: '100%', background: 'var(--blue)', borderRadius: 3 }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
              <button className="primary-button" style={{ flex: 1, fontSize: 12 }} onClick={() => openAssignments(p)}>
                <Users size={14} /> Assign Personnel
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Assignment Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="panel" style={{ width: '100%', maxWidth: 720, maxHeight: '90vh', overflowY: 'auto', padding: 26, borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: 0 }}>{selected.name}</h2>
                <p style={{ margin: '4px 0 0 0', color: 'var(--muted)', fontSize: 13 }}>
                  {selected.code || `PRJ-${selected.id}`} · Assign Site Engineers, Contractors & Workers
                </p>
              </div>
              <button className="secondary-button" onClick={() => setSelected(null)}><X size={16} /></button>
            </div>

            <h3 style={{ fontSize: 14, marginBottom: 10 }}>Add Personnel to Project</h3>
            <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
              <select
                value={role}
                onChange={e => loadEligible(e.target.value)}
                style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 }}
              >
                {ROLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <select
                value={selectedUser}
                onChange={e => setSelectedUser(e.target.value)}
                style={{ flex: 2, padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 }}
              >
                <option value="">Select {ROLES.find(r => r[0] === role)?.[1]}</option>
                {eligible.map(u => (
                  <option key={u.id} value={u.id}>{u.fullName} — {u.email}</option>
                ))}
              </select>
              <button className="primary-button" disabled={!selectedUser || busy} onClick={assign}>
                Assign
              </button>
            </div>

            <h3 style={{ fontSize: 14, marginBottom: 12 }}>Assigned Project Members ({assignments.length})</h3>
            <div style={{ display: 'grid', gap: 8 }}>
              {assignments.length === 0 ? (
                <p style={{ color: 'var(--muted)', fontSize: 13 }}>No personnel assigned yet.</p>
              ) : (
                assignments.map(a => (
                  <div key={a.assignmentId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--panel-soft)' }}>
                    <div>
                      <strong>{a.fullName}</strong>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{a.email} · {a.role.replace(/_/g, ' ')}</div>
                    </div>
                    <button className="secondary-button" style={{ color: 'var(--red)', fontSize: 12 }} onClick={() => unassign(a.userId)}>
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
