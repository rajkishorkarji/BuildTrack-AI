import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  CreditCard,
  Plus,
  Search,
  DollarSign,
  TrendingUp,
  FileText,
  Building2,
  Calendar,
} from 'lucide-react';

export default function Finance() {
  const { finances, addFinance } = useData();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    amount: '',
    contractor: '',
    projectName: 'Metro Tower Site',
    companyName: user?.companyName || 'Solviontech Infrastructure Ltd',
  });

  const totalRevenue = finances.reduce((sum, f) => sum + (parseFloat(f.amount) || 0), 0);

  const handleCreateInvoice = (e) => {
    e.preventDefault();
    if (!newInvoice.amount) return;

    addFinance({
      amount: parseFloat(newInvoice.amount),
      contractor: newInvoice.contractor || 'Subcontractor Crew',
      projectName: newInvoice.projectName,
      companyName: newInvoice.companyName,
      status: 'Paid',
    });

    setShowAddModal(false);
    setNewInvoice({
      amount: '',
      contractor: '',
      projectName: 'Metro Tower Site',
      companyName: user?.companyName || 'Solviontech Infrastructure Ltd',
    });
  };

  const filtered = finances.filter(
    (f) =>
      (f.invoiceNo || '').toLowerCase().includes(search.toLowerCase()) ||
      (f.contractor || '').toLowerCase().includes(search.toLowerCase()) ||
      (f.companyName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow">Financial Governance & Billing</p>
          <h1>Finance & Invoices (${totalRevenue.toLocaleString()})</h1>
        </div>

        <button type="button" className="primary-button" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Create Invoice Entry
        </button>
      </section>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '20px' }}>
        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px', fontWeight: 600 }}>Total Billed Revenue</span>
          <h2 style={{ fontSize: '28px', color: 'var(--green)', marginTop: '4px' }}>${totalRevenue.toLocaleString()}</h2>
        </div>
        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px', fontWeight: 600 }}>Total Invoices Logged</span>
          <h2 style={{ fontSize: '28px', color: 'var(--blue)', marginTop: '4px' }}>{finances.length}</h2>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
        <div className="search-box" style={{ width: '320px' }}>
          <Search size={16} style={{ color: 'var(--muted)' }} />
          <input placeholder="Search invoice # or contractor..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="panel" style={{ marginTop: '20px', padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
            <CreditCard size={36} style={{ marginBottom: '12px', color: 'var(--muted)' }} />
            <h3 style={{ fontSize: '16px', color: 'var(--text)', margin: '0 0 6px 0' }}>No Invoices Logged Yet</h3>
            <p style={{ fontSize: '13px', margin: 0 }}>Click &quot;Create Invoice Entry&quot; above to add financial records.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--panel-soft)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                <th style={{ padding: '14px 20px' }}>Invoice Number</th>
                <th style={{ padding: '14px' }}>Amount ($)</th>
                <th style={{ padding: '14px' }}>Company / Subcontractor</th>
                <th style={{ padding: '14px' }}>Date Logged</th>
                <th style={{ padding: '14px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text)' }}>
                    <code>{item.invoiceNo}</code>
                  </td>
                  <td style={{ padding: '16px', fontWeight: 700, color: 'var(--green)' }}>
                    ${(parseFloat(item.amount) || 0).toLocaleString()}
                  </td>
                  <td style={{ padding: '16px' }}>{item.contractor || item.companyName}</td>
                  <td style={{ padding: '16px' }}>{item.date || 'Today'}</td>
                  <td style={{ padding: '16px' }}>
                    <span className="schedule-pill" style={{ background: 'rgba(36, 196, 107, 0.15)', color: 'var(--green)' }}>
                      {item.status || 'Paid'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="panel" style={{ width: '100%', maxWidth: '480px', padding: '28px', borderRadius: '16px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--text)' }}>Create Invoice Entry</h2>
            <form onSubmit={handleCreateInvoice} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div>
                <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Invoice Amount ($) *</label>
                <input
                  type="number"
                  placeholder="e.g. 45000"
                  value={newInvoice.amount}
                  onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
                />
              </div>

              <div>
                <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Contractor / Entity Name</label>
                <input
                  type="text"
                  placeholder="e.g. Fox Steel Constructors"
                  value={newInvoice.contractor}
                  onChange={(e) => setNewInvoice({ ...newInvoice, contractor: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="secondary-button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Save Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
