import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { CreditCard, TrendingUp, Download, Building2, BarChart3, Receipt, Search, CheckCircle2, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { formatINR } from '../../utils/currency';

const STATUS_META = {
  PAID: { label: 'Paid', color: 'var(--green)', bg: 'rgba(34,197,94,0.12)' },
  PENDING: { label: 'Pending', color: 'var(--orange)', bg: 'rgba(245,158,11,0.12)' },
  OVERDUE: { label: 'Overdue', color: 'var(--red)', bg: 'rgba(239,68,68,0.12)' },
};

function getStatusMeta(status) {
  const key = String(status || '').toUpperCase();
  return STATUS_META[key] || { label: status || 'Pending', color: 'var(--orange)', bg: 'rgba(245,158,11,0.12)' };
}

export default function SuperAdminFinance() {
  const { finances = [], subscriptions = [], companies = [], payments = [] } = useData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const PLAN_PRICES = { STARTER: 9999, PROFESSIONAL: 29999, ENTERPRISE: 99999 };
  const completedPayments = (payments || []).filter(p => String(p.status || '').toUpperCase() === 'COMPLETED');
  const paidSubscriptionRevenue = completedPayments.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);

  const activeCompanies = (companies || []).filter(c => String(c.status || '').toUpperCase() === 'ACTIVE');
  const estimatedActiveRevenue = activeCompanies.reduce((s, c) => s + (PLAN_PRICES[String(c.plan || '').toUpperCase()] || 0), 0);

  const totalPaid = paidSubscriptionRevenue > 0 ? paidSubscriptionRevenue : estimatedActiveRevenue;
  const totalPlatformBilled = totalPaid + finances.reduce((s, f) => s + (parseFloat(f.amount || f.totalAmount) || 0), 0);
  const totalPending = finances
    .filter(f => String(f.status || '').toUpperCase() !== 'PAID')
    .reduce((s, f) => s + (parseFloat(f.amount || f.totalAmount) || 0), 0);

  const activeSubscriptions = activeCompanies.length;

  const filtered = finances.filter(f => {
    const matchSearch =
      (f.invoiceNo || f.invoiceNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (f.companyName || f.company?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (f.vendorName || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || String(f.status || '').toUpperCase() === statusFilter;
    return matchSearch && matchStatus;
  });

  const exportCsv = () => {
    const csv = 'Invoice,Amount,Company,Status,Date\n' +
      finances.map(f => [
        f.invoiceNo || f.invoiceNumber || '',
        f.amount || f.totalAmount || 0,
        f.companyName || f.company?.name || '',
        f.status || '',
        f.date || f.createdAt || 'Today',
      ].join(',')).join('\n');
    const a = document.createElement('a');
    a.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
    a.download = 'platform_revenue.csv';
    a.click();
  };

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700 }}>
            <Receipt size={14} /> Finance
          </p>
          <h1>Platform Revenue & Billing</h1>
        </div>
        <button type="button" className="secondary-button" onClick={exportCsv}>
          <Download size={15} /> Export Revenue CSV
        </button>
      </section>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginTop: '20px' }}>
        {[
          { label: 'Total Platform Billed', value: formatINR(totalPlatformBilled), color: 'var(--blue)', sub: `${finances.length} invoices` },
          { label: 'Collected (Paid)', value: formatINR(totalPaid), color: 'var(--green)', sub: `${finances.filter(f => String(f.status || '').toUpperCase() === 'PAID').length} paid` },
          { label: 'Outstanding (Pending)', value: formatINR(totalPending), color: 'var(--orange)', sub: `${finances.filter(f => String(f.status || '').toUpperCase() !== 'PAID').length} unpaid` },
          { label: 'Active Subscriptions', value: activeSubscriptions, color: 'var(--purple)', sub: `of ${companies.length} tenants` },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className="panel" style={{ padding: '18px' }}>
            <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>{label}</span>
            <h3 style={{ fontSize: '22px', color, margin: '4px 0 2px', fontWeight: 800 }}>{value}</h3>
            <small style={{ color: 'var(--muted)', fontSize: 11 }}>{sub}</small>
          </div>
        ))}
      </div>

      {/* Revenue by Company Summary */}
      {companies.length > 0 && (
        <div className="panel" style={{ marginTop: 20, padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building2 size={16} style={{ color: 'var(--blue)' }} /> Revenue by Tenant Company
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {companies.slice(0, 8).map(c => {
              const companyTotal = finances
                .filter(f => (f.companyName || f.company?.name || '') === c.name)
                .reduce((s, f) => s + (parseFloat(f.amount || f.totalAmount) || 0), 0);
              const maxRevenue = Math.max(...companies.map(co =>
                finances.filter(f => (f.companyName || f.company?.name || '') === co.name)
                  .reduce((s, f) => s + (parseFloat(f.amount || f.totalAmount) || 0), 0)
              ), 1);
              const pct = Math.round((companyTotal / maxRevenue) * 100);
              return (
                <div key={c.id || c.name} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13 }}>
                  <div style={{ minWidth: 160, color: 'var(--text)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                  <div style={{ flex: 1, height: 7, background: 'var(--panel-soft)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'var(--blue)', borderRadius: 4, transition: 'width 0.5s' }} />
                  </div>
                  <div style={{ minWidth: 100, textAlign: 'right', fontWeight: 700, color: 'var(--blue)' }}>{formatINR(companyTotal)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Invoice Table */}
      <div className="panel" style={{ marginTop: '20px', padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', fontWeight: 700, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 15 }}>Multi-Tenant Invoice & Billing Log</span>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13, fontWeight: 600 }}
            >
              <option value="ALL">All Statuses</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="OVERDUE">Overdue</option>
            </select>
            <div className="search-box" style={{ width: '240px' }}>
              <Search size={14} style={{ color: 'var(--muted)' }} />
              <input placeholder="Search invoice or company..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
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
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 30, textAlign: 'center', color: 'var(--muted)' }}>
                  No invoices found.
                </td>
              </tr>
            ) : (
              filtered.map((f, i) => {
                const meta = getStatusMeta(f.status);
                const date = f.date || f.createdAt
                  ? new Date(f.date || f.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                  : '—';
                return (
                  <tr key={f.id || i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 18px', fontWeight: 700 }}>
                      <code style={{ background: 'var(--panel-soft)', padding: '3px 6px', borderRadius: '4px', fontSize: 12 }}>
                        {f.invoiceNo || f.invoiceNumber || '—'}
                      </code>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--blue)', fontWeight: 600 }}>{f.companyName || f.company?.name || '—'}</td>
                    <td style={{ padding: '12px', fontWeight: 700, color: 'var(--green)' }}>{formatINR(f.amount || f.totalAmount)}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: 700, background: meta.bg, color: meta.color }}>
                        {meta.label}
                      </span>
                    </td>
                    <td style={{ padding: '12px 18px', color: 'var(--muted)' }}>{date}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
