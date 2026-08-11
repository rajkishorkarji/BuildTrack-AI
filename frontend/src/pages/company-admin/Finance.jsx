import { useEffect, useMemo, useState } from 'react';
import { CreditCard, Search, Download, RefreshCw, CheckCircle2, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import {
  getCompanyPayments,
  getSubscriptionPlans,
  getSubscriptionStatus,
  startSubscriptionPayment,
} from '../../services/razorpayService';
import api from '../../services/api';

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

function money(value) {
  return INR.format(Number(value || 0));
}

const STATUS_META = {
  PAID: { label: 'Paid', color: 'var(--green)', bg: 'rgba(34,197,94,0.12)', icon: CheckCircle2 },
  PENDING: { label: 'Pending', color: 'var(--orange)', bg: 'rgba(245,158,11,0.12)', icon: Clock },
  OVERDUE: { label: 'Overdue', color: 'var(--red)', bg: 'rgba(239,68,68,0.12)', icon: AlertTriangle },
};

function getStatusMeta(status) {
  const key = String(status || '').toUpperCase();
  return STATUS_META[key] || { label: status || 'Pending', color: 'var(--muted)', bg: 'var(--panel-soft)', icon: Clock };
}

const PLAN_BENEFITS = {
  STARTER: ['Up to 5 projects', 'Up to 25 workers', 'Basic reporting & dashboards', 'Email support', 'Document management'],
  PROFESSIONAL: ['Up to 20 projects', 'Up to 100 workers', 'Advanced analytics & reports', 'Priority support', 'Equipment tracking', 'Attendance management', 'Daily log management'],
  ENTERPRISE: ['Unlimited projects & workers', 'AI-powered insights', 'Dedicated account manager', 'Custom integrations', 'White-label branding', 'Advanced security & audit logs', 'SLA guarantee'],
};

export default function CompanyAdminFinance() {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [plans, setPlans] = useState({});
  const [subscription, setSubscription] = useState(null);
  const [search, setSearch] = useState('');
  const [busyPlan, setBusyPlan] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');

  async function loadFinance() {
    setLoading(true);
    try {
      const [invoiceResponse, planData, subscriptionData, paymentData] = await Promise.all([
        api.get('/finance/invoices'),
        getSubscriptionPlans(),
        getSubscriptionStatus(),
        getCompanyPayments(),
      ]);
      setInvoices(invoiceResponse.data?.data || []);
      setPlans(planData || {});
      setSubscription(subscriptionData || null);
      setPayments(paymentData || []);
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Unable to load finance data.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadFinance(); }, []);

  const total = useMemo(
    () => invoices.reduce((sum, item) => sum + Number(item.totalAmount || item.amount || 0) + Number(item.gstAmount || 0), 0),
    [invoices]
  );

  const paid = useMemo(
    () => invoices
      .filter(item => String(item.status || '').toUpperCase() === 'PAID')
      .reduce((sum, item) => sum + Number(item.totalAmount || item.amount || 0) + Number(item.gstAmount || 0), 0),
    [invoices]
  );

  const pending = Math.max(total - paid, 0);

  const filtered = invoices.filter(item => {
    const value = `${item.invoiceNumber || ''} ${item.vendorName || ''} ${item.project?.name || ''}`.toLowerCase();
    return value.includes(search.toLowerCase());
  });

  async function upgrade(planCode, planName) {
    setBusyPlan(planCode);
    setMessage('');
    try {
      await startSubscriptionPayment(planCode, planName);
      setMessage('Payment verified successfully. Your subscription is now active.');
      setMessageType('success');
      await loadFinance();
    } catch (error) {
      setMessage(error.message || 'Payment could not be completed.');
      setMessageType('error');
    } finally {
      setBusyPlan('');
    }
  }

  function exportCsv() {
    const header = 'Invoice,Vendor,Project,Amount,GST,Status\n';
    const rows = invoices.map(item => [
      item.invoiceNumber || '',
      item.vendorName || '',
      item.project?.name || '',
      item.amount || 0,
      item.gstAmount || 0,
      item.status || '',
    ].join(',')).join('\n');
    const a = document.createElement('a');
    a.href = `data:text/csv;charset=utf-8,${encodeURIComponent(header + rows)}`;
    a.download = 'buildtrack-finance.csv';
    a.click();
  }

  const kpiCards = [
    { label: 'Total Invoice Value', value: money(total), color: 'var(--blue)', sub: `${invoices.length} invoices` },
    { label: 'Collected (Paid)', value: money(paid), color: 'var(--green)', sub: `${invoices.filter(i => String(i.status || '').toUpperCase() === 'PAID').length} paid invoices` },
    { label: 'Outstanding (Pending)', value: money(pending), color: 'var(--orange)', sub: `${invoices.filter(i => String(i.status || '').toUpperCase() !== 'PAID').length} unpaid invoices` },
  ];

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--blue)', fontWeight: 700 }}>
            <CreditCard size={14} /> Finance
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="secondary-button" onClick={loadFinance} disabled={loading}>
            <RefreshCw size={15} style={loading ? { animation: 'spin 1s linear infinite' } : {}} /> Refresh
          </button>
          <button type="button" className="secondary-button" onClick={exportCsv}>
            <Download size={15} /> Export CSV
          </button>
        </div>
      </section>

      {message && (
        <div style={{
          marginTop: 16, padding: '12px 16px', borderRadius: 10, fontSize: 13,
          display: 'flex', alignItems: 'center', gap: 8,
          background: messageType === 'success' ? 'rgba(34,197,94,0.1)' : messageType === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(37,99,235,0.1)',
          border: `1px solid ${messageType === 'success' ? 'rgba(34,197,94,0.3)' : messageType === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(37,99,235,0.3)'}`,
          color: messageType === 'success' ? 'var(--green)' : messageType === 'error' ? 'var(--red)' : 'var(--blue)',
        }}>
          {messageType === 'success' ? <CheckCircle2 size={15} /> : messageType === 'error' ? <AlertTriangle size={15} /> : <TrendingUp size={15} />}
          {message}
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginTop: 20 }}>
        {kpiCards.map(({ label, value, color, sub }) => (
          <div key={label} className="panel" style={{ padding: 20 }}>
            <span style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 600 }}>{label}</span>
            <h2 style={{ margin: '6px 0 2px', fontSize: 22, fontWeight: 800, color }}>{value}</h2>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>{sub}</span>
          </div>
        ))}
        <div className="panel" style={{ padding: 20 }}>
          <span style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 600 }}>Subscription Plan</span>
          <h2 style={{ margin: '6px 0 2px', fontSize: 18, fontWeight: 800 }}>
            {subscription?.plan || 'No Plan'}
          </h2>
          <span style={{
            display: 'inline-block',
            padding: '2px 10px',
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 700,
            background: subscription?.status === 'ACTIVE' ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)',
            color: subscription?.status === 'ACTIVE' ? 'var(--green)' : 'var(--orange)',
          }}>
            {subscription?.status || 'PENDING'}
          </span>
        </div>
      </div>

      {/* Subscription Plans */}
      <div style={{ marginTop: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <TrendingUp size={18} style={{ color: 'var(--blue)' }} />
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Subscription Plans</h2>
        </div>
        <p style={{ color: 'var(--muted)', marginBottom: 18, fontSize: 13 }}>
          {subscription?.status === 'ACTIVE'
            ? `Current plan: ${subscription?.plan || 'N/A'}. You can upgrade anytime.`
            : 'Choose a plan and pay via Razorpay to activate your subscription.'}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 18 }}>
          {Object.values(plans).map(plan => {
            const isCurrent = subscription?.plan === plan.name && subscription?.status === 'ACTIVE';
            const benefits = PLAN_BENEFITS[plan.code] || [];
            return (
              <div className="panel" key={plan.code} style={{
                padding: 24,
                border: isCurrent ? '2px solid var(--green)' : '1px solid var(--border)',
                position: 'relative',
                transition: 'border-color 0.2s',
              }}>
                {isCurrent && (
                  <span style={{
                    position: 'absolute', top: -10, right: 16,
                    background: 'var(--green)', color: '#fff',
                    padding: '3px 12px', borderRadius: 999,
                    fontSize: 11, fontWeight: 700,
                  }}>Current Plan</span>
                )}
                <h3 style={{ marginTop: 0, fontSize: 18 }}>{plan.name}</h3>
                <div style={{ fontSize: 30, fontWeight: 800, marginBottom: 4 }}>
                  {money(plan.amount)}
                  <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 400 }}>/month</span>
                </div>
                <ul style={{ padding: '16px 0 0 18px', margin: 0, fontSize: 13, lineHeight: '1.9' }}>
                  {benefits.map((b, i) => (
                    <li key={i} style={{ color: 'var(--text)' }}>{b}</li>
                  ))}
                </ul>
                <button
                  className="primary-button"
                  style={{ width: '100%', marginTop: 18 }}
                  disabled={busyPlan === plan.code || isCurrent}
                  onClick={() => upgrade(plan.code, plan.name)}
                >
                  {busyPlan === plan.code ? 'Opening Razorpay…' :
                    isCurrent ? '✓ Active' :
                    subscription?.status === 'ACTIVE' ? `Upgrade to ${plan.name}` : 'Pay with Razorpay'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoice Table */}
      <div className="panel" style={{ marginTop: 24, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Invoice Ledger</span>
          <div className="search-box" style={{ width: 320 }}>
            <Search size={15} />
            <input
              placeholder="Search invoice, vendor or project..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--panel-soft)', borderBottom: '1px solid var(--border)' }}>
              {['Invoice #', 'Vendor', 'Project', 'Amount (incl. GST)', 'Status'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} style={{ padding: 30, textAlign: 'center', color: 'var(--muted)' }}>Loading invoices...</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={5} style={{ padding: 30, textAlign: 'center', color: 'var(--muted)' }}>No invoices found.</td></tr>
            )}
            {!loading && filtered.map(item => {
              const meta = getStatusMeta(item.status);
              const StatusIcon = meta.icon;
              return (
                <tr key={item.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700 }}>
                    <code style={{ background: 'var(--panel-soft)', padding: '3px 7px', borderRadius: 5, fontSize: 12 }}>
                      {item.invoiceNumber || '—'}
                    </code>
                  </td>
                  <td style={{ padding: '12px 16px' }}>{item.vendorName || '—'}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--blue)', fontWeight: 600 }}>{item.project?.name || '—'}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700 }}>
                    {money(Number(item.amount || 0) + Number(item.gstAmount || 0))}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 10, background: meta.bg, color: meta.color, fontSize: 11, fontWeight: 700 }}>
                      <StatusIcon size={11} /> {meta.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Razorpay Payment History */}
      <div className="panel" style={{ marginTop: 24, padding: 20 }}>
        <h3 style={{ margin: '0 0 14px', fontWeight: 700, fontSize: 15 }}>Razorpay Payment History</h3>
        {payments.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>No Razorpay payments recorded yet.</p>
        ) : (
          payments.slice(0, 10).map(payment => (
            <div key={payment.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderTop: '1px solid var(--border)' }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{payment.planName || payment.category || 'Payment'}</span>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                  {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString('en-IN') : ''}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <strong style={{ fontWeight: 800 }}>{money(payment.amount)}</strong>
                <span style={{
                  padding: '3px 8px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                  background: String(payment.status || '').toUpperCase() === 'CAPTURED' ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)',
                  color: String(payment.status || '').toUpperCase() === 'CAPTURED' ? 'var(--green)' : 'var(--orange)',
                }}>
                  {payment.status || 'Unknown'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
