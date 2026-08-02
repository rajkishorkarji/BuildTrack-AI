import { useState } from 'react';
import { Receipt, Plus, DollarSign, FileText, CheckCircle2 } from 'lucide-react';

const initialInvoices = [
  { id: 1, invNo: 'INV-2025-001', vendor: 'Ultratech Cement Ltd.', category: 'Raw Materials', amount: 45000, gst: 8100, total: 53100, status: 'Paid', dueDate: '2025-06-15' },
  { id: 2, invNo: 'INV-2025-002', vendor: 'Tata Steel Ltd.', category: 'Structural Steel', amount: 78000, gst: 14040, total: 92040, status: 'Approved', dueDate: '2025-07-05' },
  { id: 3, invNo: 'INV-2025-003', vendor: 'Mahindra Heavy Power', category: 'Fuel & Generators', amount: 18500, gst: 3330, total: 21830, status: 'Pending', dueDate: '2025-07-12' },
];

export default function Finance() {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [showModal, setShowModal] = useState(false);
  const [inv, setInv] = useState({ vendor: '', category: 'Raw Materials', amount: '' });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!inv.vendor || !inv.amount) return;
    const baseAmt = parseFloat(inv.amount);
    const gstAmt = baseAmt * 0.18;
    const newInv = {
      id: invoices.length + 1,
      invNo: `INV-2025-00${invoices.length + 1}`,
      vendor: inv.vendor,
      category: inv.category,
      amount: baseAmt,
      gst: gstAmt,
      total: baseAmt + gstAmt,
      status: 'Pending',
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    };
    setInvoices([newInv, ...invoices]);
    setShowModal(false);
    setInv({ vendor: '', category: 'Raw Materials', amount: '' });
  };

  const totalSpent = invoices.reduce((acc, i) => acc + i.total, 0);

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow">Financial Controls & Invoicing</p>
          <h1>Budget Analytics & GST Reports</h1>
        </div>
        <button type="button" className="primary-button" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Create Invoice
        </button>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Allocated Project Budget</span>
          <h2 style={{ fontSize: '26px', marginTop: '6px' }}>$162,600.00</h2>
        </div>
        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Total Invoiced Expenses</span>
          <h2 style={{ fontSize: '26px', color: 'var(--blue)', marginTop: '6px' }}>${totalSpent.toLocaleString()}</h2>
        </div>
        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>GST Tax Audit Credit (18%)</span>
          <h2 style={{ fontSize: '26px', color: 'var(--purple)', marginTop: '6px' }}>
            ${invoices.reduce((acc, i) => acc + i.gst, 0).toLocaleString()}
          </h2>
        </div>
      </div>

      <div className="panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Vendor Invoice Ledger</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: 'var(--panel-soft)', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '14px 20px' }}>Invoice Number</th>
              <th style={{ padding: '14px 20px' }}>Vendor Name</th>
              <th style={{ padding: '14px 20px' }}>Category</th>
              <th style={{ padding: '14px 20px' }}>Base Amount</th>
              <th style={{ padding: '14px 20px' }}>GST (18%)</th>
              <th style={{ padding: '14px 20px' }}>Total Billing</th>
              <th style={{ padding: '14px 20px' }}>Payment Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((i) => (
              <tr key={i.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--blue)', fontFamily: 'monospace' }}>{i.invNo}</td>
                <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text)' }}>{i.vendor}</td>
                <td style={{ padding: '14px 20px', color: 'var(--muted)' }}>{i.category}</td>
                <td style={{ padding: '14px 20px' }}>${i.amount.toLocaleString()}</td>
                <td style={{ padding: '14px 20px', color: 'var(--purple)' }}>${i.gst.toLocaleString()}</td>
                <td style={{ padding: '14px 20px', fontWeight: 700 }}>${i.total.toLocaleString()}</td>
                <td style={{ padding: '14px 20px' }}>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: i.status === 'Paid' ? 'rgba(36, 196, 107, 0.15)' : i.status === 'Approved' ? 'rgba(78, 132, 247, 0.15)' : 'rgba(245, 154, 22, 0.15)',
                      color: i.status === 'Paid' ? 'var(--green)' : i.status === 'Approved' ? 'var(--blue)' : 'var(--orange)',
                    }}
                  >
                    {i.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="panel" style={{ width: '100%', maxWidth: '450px', padding: '28px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Create Vendor Invoice</h2>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input
                type="text"
                placeholder="Vendor Name (e.g. Tata Steel Ltd)"
                value={inv.vendor}
                onChange={(e) => setInv({ ...inv, vendor: e.target.value })}
                required
                style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
              />
              <input
                type="number"
                placeholder="Base Amount ($)"
                value={inv.amount}
                onChange={(e) => setInv({ ...inv, amount: e.target.value })}
                required
                style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
              />
              <div style={{ fontSize: '13px', color: 'var(--muted)', background: 'var(--panel-soft)', padding: '10px', borderRadius: '8px' }}>
                Note: 18% GST (${(parseFloat(inv.amount || 0) * 0.18).toFixed(2)}) will be automatically added.
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', cursor: 'pointer' }}>
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
