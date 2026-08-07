import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { CreditCard, DollarSign, TrendingUp, Download, Building2, BarChart3, Receipt, Search } from 'lucide-react';

export default function SuperAdminFinance() {
  const { finances = [], subscriptions = [], companies = [] } = useData();
  const [search, setSearch] = useState('');

  const totalPlatformBilled = finances.reduce((s, f) => s + (parseFloat(f.amount) || 0), 0);
  const totalPaid = finances.filter(f => f.status === 'Paid').reduce((s, f) => s + (parseFloat(f.amount) || 0), 0);
  const totalMRR = subscriptions.reduce((s, sub) => {
    const m = (sub.plan || '').match(/\$([0-9,]+)/);
    return s + (m ? parseInt(m[1].replace(',', '')) : 0);
  }, 0);

  const filtered = finances.filter(f =>
    (f.invoiceNo || '').toLowerCase().includes(search.toLowerCase()) ||
    (f.companyName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <Receipt size={14} /> Finance
          </p>
        </div>
        <button type="button" className="secondary-button" onClick={() => {
          const csv = 'Invoice,Amount,Company,Status,Date\n' + finances.map(f => `${f.invoiceNo},$${f.amount},${f.companyName},${f.status},${f.date||'Today'}`).join('\n');
          const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv); a.download = 'platform_revenue.csv'; a.click();
        }}>
          <Download size={15} /> Export Revenue CSV
        </button>
      </section>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginTop: '20px' }}>
        {[
          { label: 'Platform Billed Revenue', value: `$${totalPlatformBilled.toLocaleString()}`, color: 'var(--green)' },
          { label: 'Paid Collections', value: `$${totalPaid.toLocaleString()}`, color: 'var(--blue)' },
          { label: 'SaaS Monthly MRR', value: `$${totalMRR.toLocaleString()}`, color: 'var(--purple)' },
          { label: 'SaaS Annual ARR', value: `$${(totalMRR * 12).toLocaleString()}`, color: 'var(--orange)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="panel" style={{ padding: '16px' }}>
            <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>{label}</span>
            <h3 style={{ fontSize: '22px', color, margin: '4px 0 0 0', fontWeight: 800 }}>{value}</h3>
          </div>
        ))}
      </div>

      {/* Revenue Table */}
      <div className="panel" style={{ marginTop: '20px', padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', fontWeight: 700, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Multi-Tenant Invoices & Billing Log</span>
          <div className="search-box" style={{ width: '260px' }}>
            <Search size={14} style={{ color: 'var(--muted)' }} />
            <input placeholder="Search invoice or company..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--panel-soft)', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '12px 18px', fontWeight: 600 }}>Invoice Code</th>
              <th style={{ padding: '12px', fontWeight: 600 }}>Company Tenant</th>
              <th style={{ padding: '12px', fontWeight: 600 }}>Amount</th>
              <th style={{ padding: '12px', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '12px 18px', fontWeight: 600 }}>Issued Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(f => (
              <tr key={f.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 18px', fontWeight: 700 }}><code style={{ background: 'var(--panel-soft)', padding: '3px 6px', borderRadius: '4px' }}>{f.invoiceNo}</code></td>
                <td style={{ padding: '12px', color: 'var(--blue)', fontWeight: 600 }}>{f.companyName}</td>
                <td style={{ padding: '12px', fontWeight: 700, color: 'var(--green)' }}>${(parseFloat(f.amount) || 0).toLocaleString()}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ padding: '3px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: 700, background: f.status === 'Paid' ? 'rgba(34,197,94,0.12)' : 'rgba(245,154,22,0.12)', color: f.status === 'Paid' ? 'var(--green)' : 'var(--orange)' }}>
                    {f.status || 'Paid'}
                  </span>
                </td>
                <td style={{ padding: '12px 18px', color: 'var(--muted)' }}>{f.date || 'Today'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
