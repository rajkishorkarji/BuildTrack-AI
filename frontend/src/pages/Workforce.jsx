import { useState } from 'react';
import { Users, UserPlus, Search, Phone, HardHat, CheckCircle2, QrCode } from 'lucide-react';

const initialWorkers = [
  { id: 1, name: 'Rose Smith', trade: 'Senior Mason', dailyWage: '$85', status: 'Active', site: 'Metro Tower', phone: '+91 9876543210', qr: 'QR-WRK-001' },
  { id: 2, name: 'Robert Fox', trade: 'Structural Welder', dailyWage: '$95', status: 'Active', site: 'Metro Tower', phone: '+91 9876543211', qr: 'QR-WRK-002' },
  { id: 3, name: 'Theresa Webb', trade: 'Electrician', dailyWage: '$90', status: 'On Leave', site: 'Skyview Residency', phone: '+91 9876543212', qr: 'QR-WRK-003' },
  { id: 4, name: 'Ronald Richards', trade: 'Heavy Equipment Operator', dailyWage: '$120', status: 'Active', site: 'Metro Tower', phone: '+91 9876543213', qr: 'QR-WRK-004' },
  { id: 5, name: 'Josh Wilson', trade: 'Site Supervisor', dailyWage: '$110', status: 'Active', site: 'Skyview Residency', phone: '+91 9876543214', qr: 'QR-WRK-005' },
];

export default function Workforce() {
  const [search, setSearch] = useState('');
  const [workers, setWorkers] = useState(initialWorkers);
  const [showModal, setShowModal] = useState(false);
  const [newWorker, setNewWorker] = useState({ name: '', trade: '', dailyWage: '', phone: '', site: 'Metro Tower' });

  const filtered = workers.filter(
    (w) => w.name.toLowerCase().includes(search.toLowerCase()) || w.trade.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newWorker.name) return;
    const added = {
      id: workers.length + 1,
      ...newWorker,
      dailyWage: `$${newWorker.dailyWage}`,
      status: 'Active',
      qr: `QR-WRK-00${workers.length + 1}`,
    };
    setWorkers([added, ...workers]);
    setShowModal(false);
    setNewWorker({ name: '', trade: '', dailyWage: '', phone: '', site: 'Metro Tower' });
  };

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow">Workforce Management</p>
          <h1>Site Workers & Crew Directory</h1>
        </div>
        <button type="button" className="primary-button" onClick={() => setShowModal(true)}>
          <UserPlus size={16} /> Register Worker
        </button>
      </section>

      <div className="panel" style={{ padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Search size={18} style={{ color: 'var(--muted)' }} />
        <input
          type="text"
          placeholder="Filter by worker name or skill trade (e.g. Mason, Electrician)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontSize: '14px' }}
        />
      </div>

      <div className="panel" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: 'var(--panel-soft)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
              <th style={{ padding: '16px 20px' }}>Worker Name</th>
              <th style={{ padding: '16px 20px' }}>Skill Trade</th>
              <th style={{ padding: '16px 20px' }}>Assigned Site</th>
              <th style={{ padding: '16px 20px' }}>Daily Rate</th>
              <th style={{ padding: '16px 20px' }}>Status</th>
              <th style={{ padding: '16px 20px' }}>QR Code Token</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((w) => (
              <tr key={w.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--bg-accent-1)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                      {w.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <div>{w.name}</div>
                      <small style={{ color: 'var(--muted)' }}>{w.phone}</small>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--panel-soft)', padding: '4px 10px', borderRadius: '6px' }}>
                    <HardHat size={14} style={{ color: 'var(--orange)' }} /> {w.trade}
                  </span>
                </td>
                <td style={{ padding: '16px 20px', color: 'var(--muted)' }}>{w.site}</td>
                <td style={{ padding: '16px 20px', fontWeight: 600 }}>{w.dailyWage} / day</td>
                <td style={{ padding: '16px 20px' }}>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: w.status === 'Active' ? 'rgba(36, 196, 107, 0.15)' : 'rgba(239, 82, 82, 0.15)',
                      color: w.status === 'Active' ? 'var(--green)' : 'var(--red)',
                    }}
                  >
                    {w.status}
                  </span>
                </td>
                <td style={{ padding: '16px 20px', fontFamily: 'monospace', color: 'var(--blue)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <QrCode size={14} /> {w.qr}
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
            <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Register New Worker</h2>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input
                type="text"
                placeholder="Full Name"
                value={newWorker.name}
                onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                required
                style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
              />
              <input
                type="text"
                placeholder="Skill Trade (e.g. Mason, Electrician)"
                value={newWorker.trade}
                onChange={(e) => setNewWorker({ ...newWorker, trade: e.target.value })}
                required
                style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
              />
              <input
                type="number"
                placeholder="Daily Wage ($)"
                value={newWorker.dailyWage}
                onChange={(e) => setNewWorker({ ...newWorker, dailyWage: e.target.value })}
                required
                style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={newWorker.phone}
                onChange={(e) => setNewWorker({ ...newWorker, phone: e.target.value })}
                style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
              />
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
