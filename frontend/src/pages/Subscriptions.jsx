import { useState } from 'react';
import {
  CreditCard,
  Plus,
  Check,
  Zap,
  TrendingUp,
  Receipt,
  Download,
  Building2,
  RefreshCw,
} from 'lucide-react';

const plansData = [
  {
    id: 'starter',
    name: 'Starter Plan',
    price: '$499 / month',
    projectsLimit: 'Up to 3 Active Projects',
    usersLimit: 'Up to 25 Users',
    storageLimit: '100 GB Cloud Storage',
    aiInsights: 'Standard AI Reports',
    activeCount: 6,
  },
  {
    id: 'pro',
    name: 'Pro Enterprise Plan',
    price: '$1,999 / month',
    projectsLimit: 'Up to 15 Active Projects',
    usersLimit: 'Up to 150 Users',
    storageLimit: '1 TB Cloud Storage',
    aiInsights: 'Advanced AI Predictions & Safety Detector',
    activeCount: 14,
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Unlimited SaaS Tier',
    price: '$4,999 / month',
    projectsLimit: 'Unlimited Projects',
    usersLimit: 'Unlimited Users & Subcontractors',
    storageLimit: '10 TB NVMe Dedicated Storage',
    aiInsights: 'Full AI Suite + Custom LLM Integration',
    activeCount: 4,
  },
];

const billingHistory = [
  { invNo: 'INV-SaaS-2026-004', company: 'Solviontech Infrastructure Ltd', plan: 'Unlimited SaaS Tier', amount: '$4,999.00', date: '2026-08-01', status: 'PAID' },
  { invNo: 'INV-SaaS-2026-003', company: 'Apex Construction Group', plan: 'Pro Enterprise Plan', amount: '$1,999.00', date: '2026-08-01', status: 'PAID' },
  { invNo: 'INV-SaaS-2026-002', company: 'Titan Heavy Structures LLC', plan: 'Unlimited SaaS Tier', amount: '$4,999.00', date: '2026-07-15', status: 'PAID' },
  { invNo: 'INV-SaaS-2026-001', company: 'Metropolis Builders Corp', plan: 'Starter Plan', amount: '$499.00', date: '2026-07-01', status: 'OVERDUE' },
];

export default function Subscriptions() {
  const [plans, setPlans] = useState(plansData);
  const [notice, setNotice] = useState('');

  const notify = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3500);
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <p className="eyebrow" style={{ color: 'var(--blue)', fontWeight: 600 }}>REVENUE & SAAS MONETIZATION</p>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>SaaS Subscriptions & Billing Engine</h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '4px' }}>
            System Admin pricing console: configure subscription tiers, upgrade company plans, and generate platform revenue invoices.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={() => notify('Opened SaaS Tier Creator modal')}
        >
          <Plus size={16} /> Create Custom Plan Tier
        </button>
      </div>

      {notice && (
        <div style={{ background: 'rgba(36, 196, 107, 0.15)', border: '1px solid var(--green)', color: 'var(--green)', padding: '12px 18px', borderRadius: '10px', fontWeight: 600, fontSize: '14px' }}>
          {notice}
        </div>
      )}

      {/* Plan Tiers Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {plans.map((p) => (
          <div
            key={p.id}
            className="panel"
            style={{
              padding: '24px',
              position: 'relative',
              border: p.popular ? '2px solid var(--blue)' : '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
            }}
          >
            {p.popular && (
              <span
                style={{
                  position: 'absolute',
                  top: '-12px',
                  right: '20px',
                  background: 'var(--blue)',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '12px',
                }}
              >
                MOST POPULAR
              </span>
            )}

            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 6px 0' }}>{p.name}</h3>
              <h2 style={{ fontSize: '28px', color: 'var(--blue)', margin: '0 0 16px 0' }}>{p.price}</h2>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={16} style={{ color: 'var(--green)' }} /> {p.projectsLimit}
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={16} style={{ color: 'var(--green)' }} /> {p.usersLimit}
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={16} style={{ color: 'var(--green)' }} /> {p.storageLimit}
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={16} style={{ color: 'var(--green)' }} /> {p.aiInsights}
                </li>
              </ul>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Subscribed: <strong>{p.activeCount} Tenants</strong></span>
              <button
                type="button"
                className="secondary-button"
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={() => notify(`Updated pricing terms for ${p.name}`)}
              >
                Edit Tier
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* SaaS Billing History */}
      <div className="panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Receipt size={20} style={{ color: 'var(--blue)' }} /> Platform SaaS Invoicing & Billing History
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px' }}>Invoice ID</th>
                <th style={{ padding: '12px' }}>Subscribed Enterprise</th>
                <th style={{ padding: '12px' }}>Tier</th>
                <th style={{ padding: '12px' }}>Amount</th>
                <th style={{ padding: '12px' }}>Billed Date</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Invoice PDF</th>
              </tr>
            </thead>
            <tbody>
              {billingHistory.map((b, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '14px 12px', fontWeight: 600 }}>{b.invNo}</td>
                  <td style={{ padding: '14px 12px', color: 'var(--blue)', fontWeight: 600 }}>{b.company}</td>
                  <td style={{ padding: '14px 12px' }}>{b.plan}</td>
                  <td style={{ padding: '14px 12px', fontWeight: 700 }}>{b.amount}</td>
                  <td style={{ padding: '14px 12px', color: 'var(--muted)' }}>{b.date}</td>
                  <td style={{ padding: '14px 12px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 700,
                        background: b.status === 'PAID' ? 'rgba(36, 196, 107, 0.15)' : 'rgba(235, 87, 87, 0.15)',
                        color: b.status === 'PAID' ? 'var(--green)' : 'var(--red)',
                      }}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                    <button
                      type="button"
                      className="secondary-button"
                      style={{ padding: '4px 10px', fontSize: '12px' }}
                      onClick={() => notify(`Generated PDF Invoice for ${b.invNo}`)}
                    >
                      <Download size={14} /> Download PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
