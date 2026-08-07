import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { CreditCard, Search, DollarSign, Download, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function CompanyAdminFinance() {
  const { finances } = useData();
  const [search, setSearch] = useState('');

  const totalSpent = finances.filter(f => f.status === 'Paid').reduce((s, f) => s + (parseFloat(f.amount) || 0), 0);
  const pendingAmount = finances.filter(f => f.status === 'Pending').reduce((s, f) => s + (parseFloat(f.amount) || 0), 0);

  const filtered = finances.filter(f =>
    (f.invoiceNo || '').toLowerCase().includes(search.toLowerCase()) ||
    (f.contractor || '').toLowerCase().includes(search.toLowerCase()) ||
    (f.projectName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <CreditCard size={14} /> Finance
          </p>
        </div>
        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            const csv = 'InvoiceNo,Contractor,Project,Amount,Status\n' + finances.map(f => `${f.invoiceNo||f.id},${f.contractor},$${parseFloat(f.amount)||0},${f.status}`).join('\n');
            const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv); a.download = 'finance_ledger.csv'; a.click();
          }}
        >
          <Download size={15} /> Export Ledger CSV
        </button>
      </section>

      {/* Financial KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '20px' }}>
        {[
          { label: 'Cleared Expenditures', value: `$${totalSpent.toLocaleString()}`, color: 'var(--green)' },
          { label: 'Pending Invoices', value: `$${pendingAmount.toLocaleString()}`, color: 'var(--orange)' },
          { label: 'Contractor Payroll', value: '$48,500', color: 'var(--purple)' },
          { label: 'Client Receivables', value: '$142,000', color: 'var(--blue)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="panel" style={{ padding: '20px' }}>
            <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>{label}</span>
            <h2 style={{ fontSize: '24px', color, margin: '4px 0 0 0', fontWeight: 800 }}>{value}</h2>
          </div>
        ))}
      </div>

      {/* Search Toolbar */}
      <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
        <div className="search-box" style={{ width: '360px' }}>
          <Search size={16} style={{ color: 'var(--muted)' }} />
          <input
            placeholder="Search invoice number, contractor, or project..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Invoices List */}
      <div className="panel" style={{ marginTop: '20px', padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--panel-soft)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Invoice No</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Contractor / Payee</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Project</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Amount</th>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(f => (
              <tr key={f.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--blue)' }}>{f.invoiceNo || `INV-${f.id}`}</td>
                <td style={{ padding: '14px', fontWeight: 600 }}>{f.contractor || 'Subcontractor Crew'}</td>
                <td style={{ padding: '14px', color: 'var(--muted)' }}>{f.projectName || 'Metro Site'}</td>
                <td style={{ padding: '14px', fontWeight: 700 }}>${(parseFloat(f.amount) || 0).toLocaleString()}</td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{ padding: '3px 10px', borderRadius: '10px', background: f.status === 'Paid' ? 'rgba(34,197,94,0.12)' : 'rgba(245,154,22,0.12)', color: f.status === 'Paid' ? 'var(--green)' : 'var(--orange)', fontSize: '11px', fontWeight: 600 }}>
                    {f.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Subscription Plans */}
<div style={{ marginTop: "30px" }}>
  <h3
    style={{
      marginBottom: "18px",
      fontSize: "18px",
      fontWeight: 700,
      color: "var(--text)",
    }}
  >
    Upgrade Subscription Plan
  </h3>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
      gap: "20px",
    }}
  >
    {/* Starter */}
    <div
      className="panel"
      style={{
        padding: "22px",
        border: "1px solid var(--border)",
        borderRadius: "14px",
      }}
    >
      <h3 style={{ margin: 0, color: "var(--blue)" }}>
        Starter
      </h3>

      <h1
        style={{
          margin: "10px 0",
          fontSize: "30px",
          fontWeight: 800,
        }}
      >
        ₹9,999
        <span
          style={{
            fontSize: "14px",
            color: "var(--muted)",
            fontWeight: 500,
          }}
        >
          /month
        </span>
      </h1>

      <ul
        style={{
          paddingLeft: "20px",
          lineHeight: "2",
          color: "var(--muted)",
        }}
      >
        <li>Up to 25 Users</li>
        <li>2 Active Projects</li>
        <li>Attendance Management</li>
        <li>Basic Reports</li>
        <li>Email Support</li>
      </ul>

      <button
        className="secondary-button"
        style={{
          width: "100%",
          marginTop: "18px",
        }}
      >
        Current Plan
      </button>
    </div>

    {/* Professional */}
    <div
      className="panel"
      style={{
        padding: "22px",
        border: "2px solid var(--blue)",
        borderRadius: "14px",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-12px",
          right: "20px",
          background: "var(--blue)",
          color: "#fff",
          padding: "4px 10px",
          borderRadius: "20px",
          fontSize: "11px",
          fontWeight: 700,
        }}
      >
        Recommended
      </div>

      <h3 style={{ margin: 0, color: "var(--blue)" }}>
        Professional
      </h3>

      <h1
        style={{
          margin: "10px 0",
          fontSize: "30px",
          fontWeight: 800,
        }}
      >
        ₹29,999
        <span
          style={{
            fontSize: "14px",
            color: "var(--muted)",
            fontWeight: 500,
          }}
        >
          /month
        </span>
      </h1>

      <ul
        style={{
          paddingLeft: "20px",
          lineHeight: "2",
          color: "var(--muted)",
        }}
      >
        <li>Up to 150 Users</li>
        <li>Unlimited Projects</li>
        <li>Equipment Management</li>
        <li>Safety Monitoring</li>
        <li>Analytics Dashboard</li>
        <li>Priority Support</li>
      </ul>

      <button
        className="primary-button"
        style={{
          width: "100%",
          marginTop: "18px",
        }}
      >
        Upgrade Plan
      </button>
    </div>

    {/* Enterprise */}
    <div
      className="panel"
      style={{
        padding: "22px",
        border: "1px solid var(--border)",
        borderRadius: "14px",
      }}
    >
      <h3 style={{ margin: 0, color: "var(--purple)" }}>
        Enterprise
      </h3>

      <h1
        style={{
          margin: "10px 0",
          fontSize: "30px",
          fontWeight: 800,
        }}
      >
        ₹50,000
        <span
          style={{
            fontSize: "14px",
            color: "var(--muted)",
            fontWeight: 500,
          }}
        >
          /month
        </span>
      </h1>

      <ul
        style={{
          paddingLeft: "20px",
          lineHeight: "2",
          color: "var(--muted)",
        }}
      >
        <li>Unlimited Users</li>
        <li>Unlimited Projects</li>
        <li>AI Workforce Analytics</li>
        <li>Predictive Insights</li>
        <li>Dedicated Account Manager</li>
        <li>24×7 Premium Support</li>
      </ul>

      <button
        className="secondary-button"
        style={{
          width: "100%",
          marginTop: "18px",
        }}
      >
        Upgrade Plan
      </button>
    </div>
  </div>
</div>

      </div>
    </div>
  );
}
