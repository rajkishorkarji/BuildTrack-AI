import { useEffect, useState } from 'react';
import { HardHat, UserPlus, Search, Mail, Phone, FolderKanban, UserX, UserCheck, Trash2 } from 'lucide-react';
import workforceService from '../../services/workforceService';
import companyAdminService from '../../services/companyAdminService';
import projectService from '../../services/projectService';

const INPUT = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)', fontSize: 13 };
const roles = [['PROJECT_MANAGER', 'Project Manager'], ['SITE_ENGINEER', 'Site Engineer'], ['CONTRACTOR', 'Contractor'], ['WORKER', 'Worker']];
const label = r => (r || '').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

export default function CompanyAdminWorkforce() {
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionBusy, setActionBusy] = useState(null);
  const [form, setForm] = useState({ fullName: '', email: '', role: 'PROJECT_MANAGER' });

  const load = () => Promise.all([workforceService.list(), projectService.list()])
    .then(([m, p]) => { setMembers(m); setProjects(p); })
    .catch(e => setError(e.response?.data?.message || 'Unable to load workforce'))
    .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const invite = async e => {
    e.preventDefault();
    setError('');
    try {
      await companyAdminService.invitePersonnel(form);
      setShow(false);
      setForm({ fullName: '', email: '', role: 'PROJECT_MANAGER' });
      setError('Invitation sent successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to send invitation');
    }
  };

  const handleToggleStatus = async (userId, currentEnabled) => {
    const targetStatus = !currentEnabled;
    const actionText = targetStatus ? 'reactivate' : 'suspend';
    if (!window.confirm(`Are you sure you want to ${actionText} this personnel member?`)) return;

    setActionBusy(userId);
    setError('');
    try {
      await workforceService.updateStatus(userId, targetStatus);
      setError(`Personnel ${targetStatus ? 'reactivated' : 'suspended'} successfully.`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || `Unable to ${actionText} personnel`);
    } finally {
      setActionBusy(null);
    }
  };

  const handleRemove = async (userId, fullName) => {
    if (!window.confirm(`Are you sure you want to remove ${fullName || 'this member'} from your company? They will no longer be able to log in or work with your company.`)) return;

    setActionBusy(userId);
    setError('');
    try {
      await workforceService.remove(userId);
      setError('Personnel removed successfully.');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to remove personnel');
    } finally {
      setActionBusy(null);
    }
  };

  const filtered = members.filter(m => {
    const q = search.toLowerCase();
    return (!q || (m.fullName || '').toLowerCase().includes(q) || (m.email || '').toLowerCase().includes(q) || (m.role || '').toLowerCase().includes(q)) &&
      (roleFilter === 'ALL' || m.role === roleFilter);
  });

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow"><HardHat size={14} /> Workforce</p>
          
        </div>
        <button className="primary-button" onClick={() => setShow(true)}><UserPlus size={16} /> Invite Personnel</button>
      </section>

      {error && <div className="panel" style={{ marginTop: 16, padding: 14 }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginTop: 20 }}>
        {[
          ['Total Personnel', members.length, 'var(--blue)'],
          ['Active', members.filter(m => m.enabled).length, 'var(--green)'],
          ['Suspended', members.filter(m => !m.enabled).length, 'var(--orange)'],
          ['Projects', projects.length, 'var(--purple)'],
        ].map(([l, v, c]) => (
          <div className="panel" key={l} style={{ padding: 18 }}>
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>{l}</span>
            <h3 style={{ color: c, margin: '4px 0 0' }}>{v}</h3>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
        <div className="search-box" style={{ width: 320 }}>
          <Search size={14} />
          <input placeholder="Search name, email or role..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select style={{ ...INPUT, width: 190 }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="ALL">All Roles</option>
          {roles.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      <div className="panel" style={{ marginTop: 20, padding: 0, overflow: 'auto' }}>
        {loading ? 'Loading…' : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Personnel</th>
                <th>Role</th>
                <th>Contact</th>
                <th>Assigned Projects</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.userId}>
                  <td style={{ fontWeight: 600 }}>{m.fullName}</td>
                  <td>{label(m.role)}</td>
                  <td>
                    <div><Mail size={12} /> {m.email}</div>
                    {m.phone && <div><Phone size={12} /> {m.phone}</div>}
                  </td>
                  <td>
                    {m.projects?.length ? m.projects.map(p => (
                      <div key={p.projectId}>
                        <FolderKanban size={12} /> {p.projectName} <small>({label(p.assignmentRole)})</small>
                      </div>
                    )) : 'Not assigned'}
                  </td>
                  <td>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: 999,
                      background: m.enabled ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                      color: m.enabled ? 'var(--green)' : '#ef4444',
                      fontWeight: 700,
                      fontSize: 11,
                    }}>
                      {m.enabled ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 8, justifyContent: 'flex-end' }}>
                      {m.enabled ? (
                        <button
                          type="button"
                          className="secondary-button"
                          disabled={actionBusy === m.userId}
                          onClick={() => handleToggleStatus(m.userId, m.enabled)}
                          style={{ color: '#f59e0b', padding: '5px 10px', fontSize: 12 }}
                          title="Suspend user"
                        >
                          <UserX size={13} /> Suspend
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="secondary-button"
                          disabled={actionBusy === m.userId}
                          onClick={() => handleToggleStatus(m.userId, m.enabled)}
                          style={{ color: 'var(--green)', padding: '5px 10px', fontSize: 12 }}
                          title="Reactivate user"
                        >
                          <UserCheck size={13} /> Reactivate
                        </button>
                      )}
                      <button
                        type="button"
                        className="secondary-button"
                        disabled={actionBusy === m.userId}
                        onClick={() => handleRemove(m.userId, m.fullName)}
                        style={{ color: '#ef4444', padding: '5px 10px', fontSize: 12 }}
                        title="Remove user"
                      >
                        <Trash2 size={13} /> Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: 24, textAlign: 'center', color: 'var(--muted)' }}>
                    No workforce members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {show && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <form className="panel" onSubmit={invite} style={{ width: '100%', maxWidth: 460, padding: 24, display: 'grid', gap: 12 }}>
            <h2>Invite Company Personnel</h2>
            <input required style={INPUT} placeholder="Full name" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />
            <input required type="email" style={INPUT} placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <select style={INPUT} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              {roles.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="secondary-button" onClick={() => setShow(false)}>Cancel</button>
              <button className="primary-button">Send Invitation</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
