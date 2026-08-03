import { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  HardHat,
  Star,
  CheckCircle2,
  ShieldCheck,
  Building2,
  FolderKanban,
  UserCheck,
} from 'lucide-react';

const initialTeamMembers = [
  { id: 1, name: 'Divya Krishnan', role: 'SITE_ENGINEER', roleLabel: 'Senior Site Engineer', assignedZone: 'Floor 14 Riser Shaft', email: 'divya@buildtrack.ai', performanceScore: 9.8, status: 'ON_SITE' },
  { id: 2, name: 'Robert Fox', role: 'CONTRACTOR', roleLabel: 'Prime Contractor (Steel Framing)', assignedZone: 'Structural Steel Wing B', email: 'robert@buildtrack.ai', performanceScore: 9.2, status: 'ON_SITE' },
  { id: 3, name: 'Rose Smith', role: 'WORKER', roleLabel: 'Senior Mason', assignedZone: 'Tower A Core Masonry', email: 'rose@buildtrack.ai', performanceScore: 9.6, status: 'ON_SITE' },
  { id: 4, name: 'Arjun Das', role: 'WORKER', roleLabel: 'Formwork Carpenter', assignedZone: 'Floor 15 Slab Shuttering', email: 'arjun@buildtrack.ai', performanceScore: 9.1, status: 'ON_SITE' },
  { id: 5, name: 'Priya Senapati', role: 'SITE_ENGINEER', roleLabel: 'Quality Control Engineer', assignedZone: 'Testing Lab & Concrete Sampling', email: 'priya@buildtrack.ai', performanceScore: 9.4, status: 'ON_SITE' },
];

export default function TeamManagement() {
  const [team, setTeam] = useState(initialTeamMembers);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', role: 'SITE_ENGINEER', zone: 'Floor 15 Concrete Pouring', email: '' });

  const notify = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3500);
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMember.name) return;
    setTeam([
      ...team,
      {
        id: Date.now(),
        name: newMember.name,
        role: newMember.role,
        roleLabel: newMember.role.replace('_', ' '),
        assignedZone: newMember.zone,
        email: newMember.email || `${newMember.name.toLowerCase().replace(' ', '')}@buildtrack.ai`,
        performanceScore: 9.0,
        status: 'ON_SITE',
      },
    ]);
    setShowModal(false);
    setNewMember({ name: '', role: 'SITE_ENGINEER', zone: 'Floor 15 Concrete Pouring', email: '' });
    notify(`Assigned ${newMember.name} to project site team!`);
  };

  const filtered = team.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.roleLabel.toLowerCase().includes(search.toLowerCase()) ||
      t.assignedZone.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <p className="eyebrow" style={{ color: 'var(--blue)', fontWeight: 600 }}>PROJECT SITE GOVERNANCE</p>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Project Team Management (Metro Tower Site)</h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '4px' }}>
            Project Manager team desk: assign Site Engineers, Contractors, and Field Workers to site zones and evaluate performance.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={() => setShowModal(true)}
        >
          <UserPlus size={16} /> Assign Member to Site
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
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Site Engineers Assigned</span>
          <h2 style={{ fontSize: '26px', color: 'var(--blue)', marginTop: '4px' }}>
            {team.filter((t) => t.role === 'SITE_ENGINEER').length} Engineers
          </h2>
          <small style={{ color: 'var(--green)' }}>Quality & Safety Oversight</small>
        </div>
        <div className="panel" style={{ padding: '18px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Contractors Active</span>
          <h2 style={{ fontSize: '26px', color: 'var(--purple)', marginTop: '4px' }}>
            {team.filter((t) => t.role === 'CONTRACTOR').length} Prime Subcontractors
          </h2>
          <small style={{ color: 'var(--muted)' }}>Steel & Concrete Crews</small>
        </div>
        <div className="panel" style={{ padding: '18px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Site Field Workers</span>
          <h2 style={{ fontSize: '26px', color: 'var(--orange)', marginTop: '4px' }}>
            {team.filter((t) => t.role === 'WORKER').length} Enrolled
          </h2>
          <small style={{ color: 'var(--green)' }}>96% Attendance Rate</small>
        </div>
      </div>

      {/* Team Directory Table */}
      <div className="panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} style={{ color: 'var(--blue)' }} /> Project Site Personnel Roster
          </h3>

          <div className="search-box" style={{ width: '280px' }}>
            <Search size={16} />
            <input
              placeholder="Search member, role, or zone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px' }}>Member & Email</th>
                <th style={{ padding: '12px' }}>Assigned Project Role</th>
                <th style={{ padding: '12px' }}>Assigned Work Zone</th>
                <th style={{ padding: '12px' }}>Performance</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '14px 12px' }}>
                    <strong style={{ fontSize: '14px', display: 'block' }}>{t.name}</strong>
                    <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{t.email}</span>
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(78, 132, 247, 0.12)', color: 'var(--blue)', fontWeight: 700, fontSize: '12px' }}>
                      {t.roleLabel}
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px', fontWeight: 600 }}>{t.assignedZone}</td>
                  <td style={{ padding: '14px 12px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '12px', background: 'rgba(155, 81, 224, 0.15)', color: 'var(--purple)', fontWeight: 700, fontSize: '12px' }}>
                      <Star size={12} fill="var(--purple)" /> {t.performanceScore}
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '12px', background: 'rgba(36, 196, 107, 0.15)', color: 'var(--green)', fontWeight: 700, fontSize: '12px' }}>
                      ✓ {t.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                    <button
                      type="button"
                      className="secondary-button"
                      style={{ padding: '4px 10px', fontSize: '12px' }}
                      onClick={() => notify(`Updated work zone assignment for ${t.name}`)}
                    >
                      Reassign Zone
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Assign Member */}
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
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Assign Member to Site Team</h3>
            <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>Member Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Divya Krishnan"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>Project Role</label>
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)' }}
                >
                  <option value="SITE_ENGINEER">Site Engineer</option>
                  <option value="CONTRACTOR">Contractor</option>
                  <option value="WORKER">Field Worker</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>Assigned Site Work Zone</label>
                <input
                  type="text"
                  placeholder="e.g. Floor 15 Slab Shuttering"
                  value={newMember.zone}
                  onChange={(e) => setNewMember({ ...newMember, zone: e.target.value })}
                  style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" className="secondary-button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Assign Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
