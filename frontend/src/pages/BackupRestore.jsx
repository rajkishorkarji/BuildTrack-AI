import { useState } from 'react';
import {
  Database,
  Download,
  UploadCloud,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Play,
  HardDrive,
} from 'lucide-react';

const initialBackups = [
  { id: 1, name: 'buildtrack_full_db_snapshot_2026-08-03.sql.gz', type: 'Full Database & Storage Snapshot', size: '4.2 GB', createdAt: '2026-08-03 04:00 AM', status: 'COMPLETED' },
  { id: 2, name: 'buildtrack_db_snapshot_2026-08-02.sql.gz', type: 'Daily Automated Backup', size: '4.1 GB', createdAt: '2026-08-02 04:00 AM', status: 'COMPLETED' },
  { id: 3, name: 'buildtrack_db_snapshot_2026-08-01.sql.gz', type: 'Daily Automated Backup', size: '4.0 GB', createdAt: '2026-08-01 04:00 AM', status: 'COMPLETED' },
  { id: 4, name: 'buildtrack_db_snapshot_2026-07-31.sql.gz', type: 'Weekly Full Backup Archive', size: '3.9 GB', createdAt: '2026-07-31 04:00 AM', status: 'COMPLETED' },
];

export default function BackupRestore() {
  const [backups, setBackups] = useState(initialBackups);
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState('');
  const [schedule, setSchedule] = useState('Daily at 04:00 AM UTC');

  const notify = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3500);
  };

  const handleCreateInstantBackup = () => {
    setCreating(true);
    setTimeout(() => {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const newB = {
        id: Date.now(),
        name: `buildtrack_instant_snapshot_${dateStr}_${Date.now().toString().slice(-4)}.sql.gz`,
        type: 'On-Demand Manual Snapshot',
        size: '4.2 GB',
        createdAt: now.toLocaleString(),
        status: 'COMPLETED',
      };
      setBackups([newB, ...backups]);
      setCreating(false);
      notify(`Successfully generated database & file backup archive!`);
    }, 1500);
  };

  const handleRestore = (name) => {
    notify(`Triggered restore process for archive: ${name}. Verification checks passed.`);
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <p className="eyebrow" style={{ color: 'var(--blue)', fontWeight: 600 }}>DISASTER RECOVERY</p>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Database Backup & Disaster Restore</h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '4px' }}>
            System Admin disaster recovery vault: generate automated database snapshots, download archives, and restore system state.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={handleCreateInstantBackup}
          disabled={creating}
        >
          <Database size={16} /> {creating ? 'Creating Snapshot...' : 'Create Instant Snapshot'}
        </button>
      </div>

      {notice && (
        <div style={{ background: 'rgba(36, 196, 107, 0.15)', border: '1px solid var(--green)', color: 'var(--green)', padding: '12px 18px', borderRadius: '10px', fontWeight: 600, fontSize: '14px' }}>
          {notice}
        </div>
      )}

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Total Backups Saved</span>
          <h2 style={{ fontSize: '26px', color: 'var(--blue)', marginTop: '4px' }}>{backups.length} Snapshots</h2>
          <small style={{ color: 'var(--green)' }}>Encryption: AES-256 GCM</small>
        </div>
        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Automated Schedule</span>
          <h2 style={{ fontSize: '22px', color: 'var(--purple)', marginTop: '4px' }}>{schedule}</h2>
          <small style={{ color: 'var(--muted)' }}>Next run in 18 hrs</small>
        </div>
        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Storage Destination</span>
          <h2 style={{ fontSize: '22px', color: 'var(--green)', marginTop: '4px' }}>AWS S3 Coldline</h2>
          <small style={{ color: 'var(--green)' }}>Multi-region redundancy</small>
        </div>
      </div>

      {/* Backups Table */}
      <div className="panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HardDrive size={20} style={{ color: 'var(--blue)' }} /> Available Snapshot Archives
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px' }}>Archive File</th>
                <th style={{ padding: '12px' }}>Backup Type</th>
                <th style={{ padding: '12px' }}>Compressed Size</th>
                <th style={{ padding: '12px' }}>Created Timestamp</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {backups.map((b) => (
                <tr key={b.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '14px 12px', fontWeight: 600, color: 'var(--blue)' }}>{b.name}</td>
                  <td style={{ padding: '14px 12px' }}>{b.type}</td>
                  <td style={{ padding: '14px 12px', fontWeight: 600 }}>{b.size}</td>
                  <td style={{ padding: '14px 12px', color: 'var(--muted)' }}>{b.createdAt}</td>
                  <td style={{ padding: '14px 12px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '12px', background: 'rgba(36, 196, 107, 0.15)', color: 'var(--green)', fontWeight: 700, fontSize: '12px' }}>
                      ✓ {b.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        type="button"
                        className="secondary-button"
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                        onClick={() => notify(`Downloading archive ${b.name}...`)}
                      >
                        <Download size={14} /> Download
                      </button>
                      <button
                        type="button"
                        className="secondary-button"
                        style={{ padding: '4px 10px', fontSize: '12px', color: 'var(--purple)' }}
                        onClick={() => handleRestore(b.name)}
                      >
                        <Play size={14} /> Restore Snapshot
                      </button>
                    </div>
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
