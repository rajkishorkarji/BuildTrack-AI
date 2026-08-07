import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Building2, Plus, Search, CheckCircle2, XCircle, CreditCard, Download, ShieldCheck } from 'lucide-react';

export default function SuperAdminCompanies() {
  const { companies = [], addCompany, deleteCompany, updateCompanyStatus, subscriptions = [] } = useData();
  const { registeredUsers = [] } = useAuth();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
 const [newCo, setNewCo] = useState({
  name: '',
  code: '',
  adminName: '',
  adminEmail: '',
  plan: 'Professional',
});
  const filtered = companies.filter(c =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.code || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e) => {
  e.preventDefault();

  if (!newCo.name || !newCo.adminName || !newCo.adminEmail) return;

  const generatedCode = newCo.code
    ? newCo.code.trim().toUpperCase()
    : `${newCo.name.substring(0, 4).toUpperCase()}-${Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase()}`;

  addCompany({
    name: newCo.name,
    code: generatedCode,
    adminName: newCo.adminName,
    adminEmail: newCo.adminEmail,
    plan: newCo.plan,
    status: "Active",
  });

  setShowCreate(false);

  setNewCo({
    name: "",
    code: "",
    adminName: "",
    adminEmail: "",
    plan: "Professional",
  });
};
  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <Building2 size={14} /> Companies
          </p>
        </div>
        <button type="button" className="primary-button" onClick={() => setShowCreate(true)}>
          <Plus size={16} /> Register New Tenant
        </button>
      </section>

      <div className="panel" style={{ marginTop: '20px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between' }}>
        <div className="search-box" style={{ width: '300px' }}>
          <Search size={14} style={{ color: 'var(--muted)' }} />
          <input placeholder="Search company by name or code..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="panel" style={{ marginTop: '16px', padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--panel-soft)', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Company Tenant</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Company Code</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Company Admin</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Plan
</th>
              <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id || c.name} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Building2 size={16} style={{ color: 'var(--blue)' }} />
                    {c.name}
                  </div>
                </td>
                <td style={{ padding: '14px' }}><code style={{ background: 'var(--panel-soft)', padding: '3px 8px', borderRadius: '4px', color: 'var(--blue)', fontWeight: 700 }}>{c.code || 'SOLV-CO'}</code></td>
                <td style={{ padding: "14px" }}>
  <div style={{ fontWeight: 600 }}>
    {c.adminName}
  </div>

  <div
    style={{
      fontSize: "12px",
      color: "var(--muted)",
      marginTop: "2px",
    }}
  >
    {c.adminEmail}
  </div>

  
</td>
                <td style={{ padding: "14px" }}>
  <span
    style={{
      padding: "5px 12px",
      borderRadius: "8px",
      background: "rgba(37,99,235,0.12)",
      color: "var(--blue)",
      fontWeight: 600,
      fontSize: "12px",
    }}
  >
    {c.plan}
  </span>
</td>
                <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="secondary-button"
                      style={{
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: (c.status || 'Active') === 'Active' ? 'var(--orange)' : 'var(--green)',
                        borderColor: (c.status || 'Active') === 'Active' ? 'rgba(245,154,22,0.3)' : 'rgba(34,197,94,0.3)'
                      }}
                      onClick={() => {
                        const nextStatus = (c.status || 'Active') === 'Active' ? 'Suspended' : 'Active';
                        updateCompanyStatus(c.id || c.name, nextStatus);
                      }}
                    >
                      {(c.status || 'Active') === 'Active' ? 'Suspend' : 'Activate'}
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      style={{ padding: '4px 10px', fontSize: '11px', color: 'var(--red)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                      onClick={() => deleteCompany(c.id || c.name)}
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

      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="panel" style={{ width: '100%', maxWidth: '480px', padding: '28px', borderRadius: '16px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Register New Company Tenant</h2>
            <form
  onSubmit={handleCreate}
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    fontSize: "13px",
  }}
>
  <div>
    <label
      style={{
        color: "var(--muted)",
        display: "block",
        marginBottom: "4px",
      }}
    >
      Company Name *
    </label>

    <input
      type="text"
      required
      value={newCo.name}
      onChange={(e) =>
        setNewCo({ ...newCo, name: e.target.value })
      }
      style={{
        width: "100%",
        padding: "10px",
        borderRadius: "8px",
        border: "1px solid var(--border)",
        background: "var(--panel)",
      }}
    />
  </div>

  <div>
    <label
      style={{
        color: "var(--muted)",
        display: "block",
        marginBottom: "4px",
      }}
    >
      Company Code
    </label>

    <input
      type="text"
      placeholder="e.g. SOLV-CO"
      value={newCo.code}
      onChange={(e) =>
        setNewCo({ ...newCo, code: e.target.value })
      }
      style={{
        width: "100%",
        padding: "10px",
        borderRadius: "8px",
        border: "1px solid var(--border)",
        background: "var(--panel)",
      }}
    />
  </div>

  <div>
    <label
      style={{
        color: "var(--muted)",
        display: "block",
        marginBottom: "4px",
      }}
    >
      Company Admin Name *
    </label>

    <input
      type="text"
      required
      placeholder="Enter company admin name"
      value={newCo.adminName}
      onChange={(e) =>
        setNewCo({ ...newCo, adminName: e.target.value })
      }
      style={{
        width: "100%",
        padding: "10px",
        borderRadius: "8px",
        border: "1px solid var(--border)",
        background: "var(--panel)",
      }}
    />
  </div>

  <div>
    <label
      style={{
        color: "var(--muted)",
        display: "block",
        marginBottom: "4px",
      }}
    >
      Company Admin Email *
    </label>

    <input
      type="email"
      required
      placeholder="admin@company.com"
      value={newCo.adminEmail}
      onChange={(e) =>
        setNewCo({ ...newCo, adminEmail: e.target.value })
      }
      style={{
        width: "100%",
        padding: "10px",
        borderRadius: "8px",
        border: "1px solid var(--border)",
        background: "var(--panel)",
      }}
    />
  </div>

  <div>
  <label
    style={{
      color: "var(--muted)",
      display: "block",
      marginBottom: "4px",
    }}
  >
    Subscription Plan *
  </label>

  <select
    value={newCo.plan}
    onChange={(e) =>
      setNewCo({
        ...newCo,
        plan: e.target.value,
      })
    }
    style={{
      width: "100%",
      padding: "10px",
      borderRadius: "8px",
      border: "1px solid var(--border)",
      background: "var(--panel)",
      color: "var(--text)",
    }}
  >
    <option value="Starter">
      Starter (₹9,999 / month)
    </option>

    <option value="Professional">
      Professional (₹29,999 / month)
    </option>

    <option value="Enterprise">
      Enterprise (₹50,000 / month)
    </option>
  </select>
</div>


  <div
    style={{
      display: "flex",
      justifyContent: "flex-end",
      gap: "10px",
      marginTop: "8px",
    }}
  >
    <button
      type="button"
      className="secondary-button"
      onClick={() => setShowCreate(false)}
    >
      Cancel
    </button>

    <button
      type="submit"
      className="primary-button"
    >
      Register Company
    </button>
  </div>
</form>
          </div>
        </div>
      )}
    </div>
  );
}
