import { useEffect, useMemo, useState } from 'react';
import { CreditCard, Search, Download, RefreshCw, CheckCircle2, Clock, AlertTriangle, TrendingUp, Plus, X } from 'lucide-react';
import {
  getCompanyPayments,
  getSubscriptionPlans,
  getSubscriptionStatus,
  startSubscriptionPayment,
} from '../../services/razorpayService';
import api, { realtimeBus } from '../../services/api';

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

const DEFAULT_PLANS = {
  STARTER: { code: 'STARTER', name: 'Starter', amount: 9999, currency: 'INR' },
  PROFESSIONAL: { code: 'PROFESSIONAL', name: 'Professional', amount: 29999, currency: 'INR' },
  ENTERPRISE: { code: 'ENTERPRISE', name: 'Enterprise', amount: 99999, currency: 'INR' },
};

export default function CompanyAdminFinance() {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [plans, setPlans] = useState(DEFAULT_PLANS);
  const [subscription, setSubscription] = useState(null);
  const [search, setSearch] = useState('');
  const [busyPlan, setBusyPlan] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [projects, setProjects] = useState([]);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    projectId: '',
    invoiceNumber: '',
    vendorName: '',
    category: 'Material & Labor',
    amount: '',
    gstAmount: '',
    dueDate: '',
  });

  async function loadFinance() {
    setLoading(true);
    try {
      const [invoiceResult, planResult, subResult, payResult, projectResult] = await Promise.allSettled([
        api.get('/finance/invoices'),
        getSubscriptionPlans(),
        getSubscriptionStatus(),
        getCompanyPayments(),
        api.get('/projects'),
      ]);

      if (invoiceResult.status === 'fulfilled') {
        setInvoices(invoiceResult.value?.data?.data || []);
      }
      if (projectResult.status === 'fulfilled') {
        setProjects(projectResult.value?.data?.data || []);
      }
      if (planResult.status === 'fulfilled' && Object.keys(planResult.value || {}).length > 0) {
        setPlans(planResult.value);
      } else {
        setPlans(DEFAULT_PLANS);
      }
      if (subResult.status === 'fulfilled') {
        setSubscription(subResult.value || null);
      }
      if (payResult.status === 'fulfilled') {
        setPayments(payResult.value || []);
      }
    } catch (error) {
      console.error('Finance load error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function markInvoicePaid(invoiceId) {
    try {
      await api.patch(`/finance/invoices/${invoiceId}/status`, { status: 'PAID' });
      setMessage('Invoice marked as PAID! Project spent updated and real-time cost metrics synced.');
      setMessageType('success');
      await loadFinance();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update invoice status.');
      setMessageType('error');
    }
  }

  async function handleCreateInvoice(e) {
    e.preventDefault();
    if (!invoiceForm.projectId || !invoiceForm.amount) return;
    try {
      const amt = parseFloat(invoiceForm.amount) || 0;
      const gst = invoiceForm.gstAmount ? parseFloat(invoiceForm.gstAmount) : amt * 0.18;
      await api.post('/finance/invoices', {
        projectId: Number(invoiceForm.projectId),
        invoiceNumber: invoiceForm.invoiceNumber || `INV-${Date.now() % 1000000}`,
        vendorName: invoiceForm.vendorName || 'Vendor',
        category: invoiceForm.category || 'Material & Labor',
        amount: amt,
        gstAmount: gst,
        status: 'PENDING',
        dueDate: invoiceForm.dueDate || null,
      });
      setShowInvoiceModal(false);
      setMessage('Invoice created successfully! Real-time financial ledger updated.');
      setMessageType('success');
      await loadFinance();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to create invoice.');
      setMessageType('error');
    }
  }

  useEffect(() => {
    loadFinance();
    const unsub = realtimeBus.subscribe('SERVER_UPDATE', () => loadFinance());
    return () => unsub();
  }, []);

  const getProjectName = (item) => {
    if (item.projectName) return item.projectName;
    if (item.project?.name) return item.project.name;
    if (item.projectId) {
      const match = projects.find(p => String(p.id) === String(item.projectId));
      if (match) return match.name;
    }
    return '—';
  };

  const getInvoiceTotal = (item) => {
    if (item.totalAmount != null) return Number(item.totalAmount);
    return Number(item.amount || 0) + Number(item.gstAmount || 0);
  };

  const total = useMemo(
    () => invoices.reduce((sum, item) => sum + getInvoiceTotal(item), 0),
    [invoices]
  );

  const paid = useMemo(
    () => invoices
      .filter(item => String(item.status || '').toUpperCase() === 'PAID')
      .reduce((sum, item) => sum + getInvoiceTotal(item), 0),
    [invoices]
  );

  const pending = Math.max(total - paid, 0);

  const filtered = invoices.filter(item => {
    const value = `${item.invoiceNumber || ''} ${item.vendorName || ''} ${getProjectName(item)}`.toLowerCase();
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
      getProjectName(item),
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
          <button type="button" className="primary-button" onClick={() => setShowInvoiceModal(true)}>
            <Plus size={15} /> Create Invoice
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
              {['Invoice #', 'Vendor', 'Project', 'Amount (incl. GST)', 'Status', 'Action'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} style={{ padding: 30, textAlign: 'center', color: 'var(--muted)' }}>Loading invoices...</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 30, textAlign: 'center', color: 'var(--muted)' }}>No invoices found.</td></tr>
            )}
            {!loading && filtered.map(item => {
              const meta = getStatusMeta(item.status);
              const StatusIcon = meta.icon;
              const isPaid = String(item.status || '').toUpperCase() === 'PAID';
              return (
                <tr key={item.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700 }}>
                    <code style={{ background: 'var(--panel-soft)', padding: '3px 7px', borderRadius: 5, fontSize: 12 }}>
                      {item.invoiceNumber || '—'}
                    </code>
                  </td>
                  <td style={{ padding: '12px 16px' }}>{item.vendorName || '—'}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--blue)', fontWeight: 600 }}>{getProjectName(item)}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700 }}>
                    {money(getInvoiceTotal(item))}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 10, background: meta.bg, color: meta.color, fontSize: 11, fontWeight: 700 }}>
                      <StatusIcon size={11} /> {meta.label}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {isPaid ? (
                      <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700 }}>✓ Settled</span>
                    ) : (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => markInvoicePaid(item.id)}
                        style={{ fontSize: 11, padding: '4px 10px', color: 'var(--green)', borderColor: 'rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.08)' }}
                      >
                        Mark Paid
                      </button>
                    )}
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

      {/* Create Invoice Modal */}
      {showInvoiceModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="panel" style={{ width: '100%', maxWidth: 500, padding: 24, borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Create / Issue Project Invoice</h2>
              <button type="button" className="secondary-button" onClick={() => setShowInvoiceModal(false)} style={{ padding: 6 }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Project Site *</label>
                <select
                  value={invoiceForm.projectId}
                  onChange={e => setInvoiceForm({ ...invoiceForm, projectId: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 }}
                >
                  <option value="">Select Project Site</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.code || 'SITE'})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Vendor / Contractor Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Karji Builders / Contractor"
                    value={invoiceForm.vendorName}
                    onChange={e => setInvoiceForm({ ...invoiceForm, vendorName: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Category</label>
                  <select
                    value={invoiceForm.category}
                    onChange={e => setInvoiceForm({ ...invoiceForm, category: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 }}
                  >
                    <option value="Material & Labor">Material & Labor</option>
                    <option value="Labor Supply">Labor Supply</option>
                    <option value="Equipment Rental">Equipment Rental</option>
                    <option value="Contract Work">Contract Work</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Invoice Amount (₹) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 100000"
                    value={invoiceForm.amount}
                    onChange={e => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                    required
                    min="1"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>GST Amount (₹ 18%)</label>
                  <input
                    type="number"
                    placeholder="Auto (18%)"
                    value={invoiceForm.gstAmount}
                    onChange={e => setInvoiceForm({ ...invoiceForm, gstAmount: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--muted)' }}>Due Date</label>
                <input
                  type="date"
                  value={invoiceForm.dueDate}
                  onChange={e => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" className="secondary-button" onClick={() => setShowInvoiceModal(false)}>Cancel</button>
                <button type="submit" className="primary-button">Issue Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
