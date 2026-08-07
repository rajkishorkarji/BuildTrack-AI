import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Users, Search, Plus, UserPlus, Shield, Building2 } from 'lucide-react';

export default function SuperAdminUsers() {
  const { usersList = [], addUser, companies = [] } = useData();
  const { registeredUsers = [] } = useAuth();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', role: 'COMPANY_ADMIN', companyName: 'Solviontech Infrastructure Ltd' });

  const allUsers = [...usersList, ...registeredUsers];
  const uniqueUsers = [];
  const seenEmails = new Set();
  allUsers.forEach(u => {
    const e = (u.email || '').toLowerCase().trim();
    if (e && !seenEmails.has(e)) {
      seenEmails.add(e);
      uniqueUsers.push(u);
    }
  });

  const filtered = uniqueUsers.filter(u => {
    const mSearch = (u.fullName || u.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase());
    const mRole = roleFilter === 'ALL' || u.role === roleFilter;
    return mSearch && mRole;
  });

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email) return;
    addUser({
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      role: form.role,
      companyName: form.companyName,
    });
    setShowAdd(false);
    setForm({ fullName: '', email: '', role: 'COMPANY_ADMIN', companyName: 'Solviontech Infrastructure Ltd' });
  };

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <Users size={14} /> Users
          </p>
        </div>
        <button type="button" className="primary-button" onClick={() => setShowAdd(true)}>
          <UserPlus size={16} /> Register Platform User
        </button>
      </section>

      {/* Filter Bar */}
      <div className="panel" style={{ marginTop: '20px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div className="search-box" style={{ width: '300px' }}>
          <Search size={14} style={{ color: 'var(--muted)' }} />
          <input placeholder="Search users by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)', fontSize: '12px', fontWeight: 600 }}>
          <option value="ALL">All Roles</option>
          <option value="SUPER_ADMIN">Super Admin</option>
          <option value="COMPANY_ADMIN">Company Admin</option>
          <option value="PROJECT_MANAGER">Project Manager</option>
          <option value="SITE_ENGINEER">Site Engineer</option>
          <option value="CONTRACTOR">Contractor</option>
          <option value="WORKER">Worker</option>
        </select>
      </div>

      {/* User Table */}
      <div className="panel" style={{ marginTop: '16px', padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
  <tr
    style={{
      background: 'var(--panel-soft)',
      color: 'var(--muted)',
      borderBottom: '1px solid var(--border)'
    }}
  >
    <th style={{ padding: '14px 20px', fontWeight: 600 }}>
      User Name & Email
    </th>

    <th style={{ padding: '14px', fontWeight: 600 }}>
      Assigned Role
    </th>

    <th style={{ padding: '14px', fontWeight: 600 }}>
      Company Tenant
    </th>

    <th style={{ padding: '14px', fontWeight: 600 }}>
      Status
    </th>

    <th
      style={{
        padding: '14px 20px',
        fontWeight: 600,
        textAlign: 'right'
      }}
    >
      Actions
    </th>
  </tr>
</thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id || u.email} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text)' }}>
                  <div>{u.fullName || u.name || u.email}</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 400 }}>{u.email}</div>
                </td>
                <td style={{ padding: '14px', color: 'var(--blue)', fontWeight: 600 }}>{u.role || 'USER'}</td>
                <td style={{ padding: '14px', color: 'var(--muted)' }}>{u.companyName || 'Solviontech Infrastructure Ltd'}</td>
                <td style={{ padding: '14px' }}>
  <span
    style={{
      padding: '4px 10px',
      borderRadius: '10px',
      background:
        (u.status || 'Active') === 'Active'
          ? 'rgba(34,197,94,0.12)'
          : 'rgba(245,154,22,0.12)',
      color:
        (u.status || 'Active') === 'Active'
          ? 'var(--green)'
          : 'var(--orange)',
      fontSize: '11px',
      fontWeight: 700,
    }}
  >
    {u.status || 'Active'}
  </span>
</td>

<td style={{ padding: '14px 20px', textAlign: 'right' }}>
  <div
    style={{
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '8px',
    }}
  >
    <button
      type="button"
      className="secondary-button"
      style={{
        padding: '4px 10px',
        fontSize: '11px',
        fontWeight: 600,
        color:
          (u.status || 'Active') === 'Active'
            ? 'var(--orange)'
            : 'var(--green)',
      }}
      onClick={() => {
        // TODO: Add suspend/activate logic
      }}
    >
      {(u.status || 'Active') === 'Active'
        ? 'Suspend'
        : 'Activate'}
    </button>

    <button
      type="button"
      className="secondary-button"
      style={{
        padding: '4px 10px',
        fontSize: '11px',
        color: 'var(--red)',
      }}
      onClick={() => {
        // TODO: Add delete logic
      }}
    >
      Delete
    </button>
  </div>
</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="panel" style={{ width: '100%', maxWidth: '480px', padding: '28px', borderRadius: '16px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Register Platform User</h2>
            <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div>
                <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Full Name *</label>
                <input type="text" required value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)' }} />
              </div>
              <div>
                <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Email Address *</label>
                <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)' }} />
              </div>
              <div>
                <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Assigned System Role</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)' }}>
                  <option value="COMPANY_ADMIN">Company Admin</option>
                  <option value="PROJECT_MANAGER">Project Manager</option>
                  <option value="SITE_ENGINEER">Site Engineer</option>
                  <option value="CONTRACTOR">Contractor</option>
                  <option value="WORKER">Worker</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button type="button" className="secondary-button" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="primary-button">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
