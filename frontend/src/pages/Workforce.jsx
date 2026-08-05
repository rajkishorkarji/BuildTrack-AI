import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  UserPlus,
  Search,
  HardHat,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Phone,
  Mail,
  Building2,
  MapPin,
  Calendar,
} from 'lucide-react';

export default function Workforce() {
  const { workers, addWorker, deleteWorker } = useData();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWorker, setNewWorker] = useState({
    fullName: '',
    trade: 'Masonry',
    phone: '',
    companyName: user?.companyName || 'Solviontech Infrastructure Ltd',
    projectName: 'Metro Tower Site',
    dailyWage: '$50/day',
  });

  const handleAddWorker = (e) => {
    e.preventDefault();
    if (!newWorker.fullName.trim()) return;

    addWorker({
      fullName: newWorker.fullName.trim(),
      role: `${newWorker.trade} Specialist`,
      trade: newWorker.trade,
      companyName: newWorker.companyName,
      projectName: newWorker.projectName,
      phone: newWorker.phone || '+91 9876543210',
      dailyWage: newWorker.dailyWage,
    });

    setShowAddModal(false);
    setNewWorker({
      fullName: '',
      trade: 'Masonry',
      phone: '',
      companyName: user?.companyName || 'Solviontech Infrastructure Ltd',
      projectName: 'Metro Tower Site',
      dailyWage: '$50/day',
    });
  };

  const filteredWorkers = workers.filter(
    (w) =>
      (w.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
      (w.trade || '').toLowerCase().includes(search.toLowerCase()) ||
      (w.companyName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-page">
      {/* Page Header */}
      <section className="hero-row">
        <div>
          <p className="eyebrow">Workforce Management Suite</p>
          <h1>Site Personnel & Crews ({workers.length})</h1>
        </div>

        <button type="button" className="primary-button" onClick={() => setShowAddModal(true)}>
          <UserPlus size={16} /> Onboard New Worker
        </button>
      </section>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
        <div className="search-box" style={{ width: '320px' }}>
          <Search size={16} style={{ color: 'var(--muted)' }} />
          <input placeholder="Search worker name, trade, or company..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Workers Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {filteredWorkers.length === 0 ? (
          <div className="panel" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
            <HardHat size={36} style={{ marginBottom: '12px', color: 'var(--muted)' }} />
            <h3 style={{ fontSize: '16px', color: 'var(--text)', margin: '0 0 6px 0' }}>No Field Workers Onboarded Yet</h3>
            <p style={{ fontSize: '13px', margin: 0 }}>Click &quot;Onboard New Worker&quot; above to add personnel and update Total Workers.</p>
          </div>
        ) : (
          filteredWorkers.map((w) => (
            <div key={w.id} className="panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span className="schedule-pill" style={{ background: 'rgba(36, 196, 107, 0.15)', color: 'var(--green)' }}>
                    Active Duty
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>{w.trade || 'General'}</span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>{w.fullName}</h3>
                <span style={{ fontSize: '12px', color: 'var(--blue)', fontWeight: 600, display: 'block', marginBottom: '12px' }}>
                  {w.companyName}
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--muted)' }}>
                  <span><Phone size={14} style={{ display: 'inline', marginRight: '6px' }} />{w.phone}</span>
                  <span><MapPin size={14} style={{ display: 'inline', marginRight: '6px' }} />{w.projectName}</span>
                  <span>Wage: <strong style={{ color: 'var(--text)' }}>{w.dailyWage}</strong></span>
                </div>
              </div>

              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--green)', fontWeight: 600 }}>Attendance: 100%</span>
                <button type="button" className="secondary-button" onClick={() => deleteWorker(w.id)} style={{ color: 'var(--red)', padding: '6px 10px' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ADD WORKER MODAL */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="panel" style={{ width: '100%', maxWidth: '480px', padding: '28px', borderRadius: '16px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--text)' }}>Onboard New Site Worker</h2>
            <form onSubmit={handleAddWorker} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div>
                <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Worker Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={newWorker.fullName}
                  onChange={(e) => setNewWorker({ ...newWorker, fullName: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Trade Specialization</label>
                  <select
                    value={newWorker.trade}
                    onChange={(e) => setNewWorker({ ...newWorker, trade: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
                  >
                    <option value="Masonry">Masonry</option>
                    <option value="Steel Framing">Steel Framing</option>
                    <option value="Carpentry">Carpentry</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Crane Operator">Crane Operator</option>
                  </select>
                </div>
                <div>
                  <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={newWorker.phone}
                    onChange={(e) => setNewWorker({ ...newWorker, phone: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Company Tenant</label>
                <input
                  type="text"
                  value={newWorker.companyName}
                  onChange={(e) => setNewWorker({ ...newWorker, companyName: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="secondary-button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Onboard Worker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
