import { useEffect, useState } from 'react';
import { Users, Mail, Phone, FolderKanban } from 'lucide-react';
import workforceService from '../../services/workforceService';

const roleLabel = (role = '') => role.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

export default function PMTeam() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    workforceService.list().then(setMembers).catch(e => setError(e.response?.data?.message || 'Unable to load project team')).finally(() => setLoading(false));
  }, []);

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div><p className="eyebrow">Project Team</p></div>
      </section>
      {error && <div className="panel" style={{ marginTop: 16, color: 'var(--red)' }}>{error}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16, marginTop: 20 }}>
        {loading ? <div className="panel">Loading project team…</div> : members.map(m => (
          <div key={m.userId} className="panel" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div><strong>{m.fullName || 'Unnamed user'}</strong><div style={{ color: 'var(--blue)', fontSize: 12, marginTop: 4 }}>{roleLabel(m.role)}</div></div>
              <span style={{ color: m.enabled ? 'var(--green)' : 'var(--orange)', fontSize: 11, fontWeight: 700 }}>{m.enabled ? 'Active' : 'Disabled'}</span>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', marginTop: 14, paddingTop: 12, color: 'var(--muted)', fontSize: 12, display: 'grid', gap: 7 }}>
              <div><Mail size={13} style={{ verticalAlign: 'middle', marginRight: 6 }} />{m.email}</div>
              {m.phone && <div><Phone size={13} style={{ verticalAlign: 'middle', marginRight: 6 }} />{m.phone}</div>}
              <div><FolderKanban size={13} style={{ verticalAlign: 'middle', marginRight: 6 }} />{m.projects?.length || 0} assigned project(s)</div>
            </div>
          </div>
        ))}
        {!loading && members.length === 0 && <div className="panel">No personnel are assigned to your projects yet.</div>}
      </div>
    </div>
  );
}
