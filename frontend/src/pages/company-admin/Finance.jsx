import { useEffect, useMemo, useState } from 'react';
import { CreditCard, Search, Download, RefreshCw } from 'lucide-react';
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

const PLAN_BENEFITS = {
  STARTER: [
    'Up to 5 projects',
    'Up to 25 workers',
    'Basic reporting & dashboards',
    'Email support',
    'Document management',
  ],
  PROFESSIONAL: [
    'Up to 20 projects',
    'Up to 100 workers',
    'Advanced analytics & reports',
    'Priority support',
    'Equipment tracking',
    'Attendance management',
    'Daily log management',
  ],
  ENTERPRISE: [
    'Unlimited projects & workers',
    'AI-powered insights',
    'Dedicated account manager',
    'Custom integrations',
    'White-label branding',
    'Advanced security & audit logs',
    'SLA guarantee',
  ],
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
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFinance();
  }, []);

  const total = useMemo(
    () => invoices.reduce((sum, item) => sum + Number(item.totalAmount || item.amount || 0) + Number(item.gstAmount || 0), 0),
    [invoices]
  );

  const paid = useMemo(
    () => invoices
      .filter(item => item.status === 'PAID')
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
      await loadFinance();
    } catch (error) {
      setMessage(error.message || 'Payment could not be completed.');
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

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--blue)', fontWeight: 700 }}>
            <CreditCard size={14} /> Finance
          </p>
          <h1>Finance & Subscription</h1>
          <p style={{ color: 'var(--muted)' }}>
            Real company finance data and Razorpay subscription payments.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="secondary-button" onClick={loadFinance}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button type="button" className="secondary-button" onClick={exportCsv}>
            <Download size={15} /> Export CSV
          </button>
        </div>
      </section>

      {message && (
        <div className="panel" style={{ marginTop: 16, padding: 14 }}>
          {message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginTop: 20 }}>
        {[
          ['Total invoice value', total],
          ['Paid', paid],
          ['Pending', pending],
        ].map(([label, value]) => (
          <div key={label} className="panel" style={{ padding: 20 }}>
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>{label}</span>
            <h2 style={{ margin: '6px 0 0', fontSize: 24 }}>{money(value)}</h2>
          </div>
        ))}

        <div className="panel" style={{ padding: 20 }}>
          <span style={{ color: 'var(--muted)', fontSize: 12 }}>Subscription</span>
          <h2 style={{ margin: '6px 0 0', fontSize: 20 }}>
            {subscription?.plan || 'No plan'}
          </h2>
          <span style={{
            color: subscription?.status === 'ACTIVE' ? 'var(--green)' : 'var(--orange)',
            fontSize: 12, fontWeight: 700,
          }}>
            {subscription?.status || 'PENDING'}
          </span>
        </div>
      </div>

      <div style={{ marginTop: 28 }}>
        <h2>Subscription Plans</h2>
        <p style={{ color: 'var(--muted)', marginBottom: 18, fontSize: 13 }}>
          {subscription?.status === 'ACTIVE'
            ? `Your current plan: ${subscription?.plan || 'N/A'}. You can upgrade anytime.`
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
                <div style={{ fontSize: 30, fontWeight: 800 }}>
                  {money(plan.amount)}
                  <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 400 }}>/month</span>
                </div>
                <ul style={{ padding: '16px 0 0 18px', margin: 0, fontSize: 13, color: 'var(--muted)', lineHeight: '1.9' }}>
                  {benefits.map((b, i) => (
                    <li key={i} style={{ color: 'var(--foreground)' }}>{b}</li>
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

      <div className="panel" style={{ marginTop: 24, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Search size={16} />
          <input
            className="search-box"
            placeholder="Search invoice, vendor or project..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 360 }}
          />
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--panel-soft)' }}>
              <th style={{ padding: 14, textAlign: 'left' }}>Invoice</th>
              <th style={{ padding: 14, textAlign: 'left' }}>Vendor</th>
              <th style={{ padding: 14, textAlign: 'left' }}>Project</th>
              <th style={{ padding: 14, textAlign: 'left' }}>Amount</th>
              <th style={{ padding: 14, textAlign: 'left' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {!loading && filtered.map(item => (
              <tr key={item.id} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: 14 }}>{item.invoiceNumber}</td>
                <td style={{ padding: 14 }}>{item.vendorName}</td>
                <td style={{ padding: 14 }}>{item.project?.name || '-'}</td>
                <td style={{ padding: 14, fontWeight: 700 }}>{money(Number(item.amount || 0) + Number(item.gstAmount || 0))}</td>
                <td style={{ padding: 14 }}>{item.status}</td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan="5" style={{ padding: 30, textAlign: 'center', color: 'var(--muted)' }}>No invoices found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="panel" style={{ marginTop: 24, padding: 20 }}>
        <h3>Razorpay payment history</h3>
        {payments.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>No Razorpay payments yet.</p>
        ) : (
          payments.slice(0, 10).map(payment => (
            <div key={payment.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid var(--border)' }}>
              <span>{payment.planName || payment.category}</span>
              <strong>{money(payment.amount)} · {payment.status}</strong>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
