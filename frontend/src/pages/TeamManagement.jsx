import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Users, UserPlus, Search, ShieldCheck, Mail, Phone } from 'lucide-react';

export default function TeamManagement() {
  const { teamMembers, addTeamMember } = useData();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({
    fullName: '',
    email: '',
    role: 'Site Supervisor',
    phone: '',
  });

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMember.fullName.trim()) return;

    addTeamMember({
      fullName: newMember.fullName.trim(),
      email: newMember.email.trim(),
      role: newMember.role,
      companyName: user?.companyName || 'Solviontech Infrastructure Ltd',
      phone: newMember.phone || '+91 9876543210',
    });

    setShowAddModal(false);
    setNewMember({ fullName: '', email: '', role: 'Site Supervisor', phone: '' });
  };

  const filtered = teamMembers.filter((m) => (m.fullName || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow">Company Team Roster</p>
          <h1>Team Management ({teamMembers.length})</h1>
        </div>

        <button type="button" className="primary-button" onClick={() => setShowAddModal(true)}>
          <UserPlus size={16} /> Add Team Member
        </button>
      </section>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
        <div className="search-box" style={{ width: '320px' }}>
          <Search size={16} style={{ color: 'var(--muted)' }} />
          <input placeholder="Search team member name..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="panel" style={{ marginTop: '20px', padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
            <Users size={36} style={{ marginBottom: '12px', color: 'var(--muted)' }} />
            <h3 style={{ fontSize: '16px', color: 'var(--text)', margin: '0 0 6px 0' }}>No Team Members Added</h3>
            <p style={{ fontSize: '13px', margin: 0 }}>Click &quot;Add Team Member&quot; above to build your team roster.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--panel-soft)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                <th style={{ padding: '14px 20px' }}>Full Name</th>
                <th style={{ padding: '14px' }}>Role / Designation</th>
                <th style={{ padding: '14px' }}>Email</th>
                <th style={{ padding: '14px' }}>Phone</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text)' }}>{m.fullName}</td>
                  <td style={{ padding: '16px' }}><span className="schedule-pill">{m.role}</span></td>
                  <td style={{ padding: '16px' }}>{m.email}</td>
                  <td style={{ padding: '16px' }}>{m.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="panel" style={{ width: '100%', maxWidth: '480px', padding: '28px', borderRadius: '16px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--text)' }}>Add Team Member</h2>
            <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div>
                <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Anish Malhotra"
                  value={newMember.fullName}
                  onChange={(e) => setNewMember({ ...newMember, fullName: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
                />
              </div>

              <div>
                <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Role / Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Site Supervisor / Safety Auditor"
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
                />
              </div>

              <div>
                <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Email Address</label>
                <input
                  type="email"
                  placeholder="anish@company.com"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="secondary-button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Save Team Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
