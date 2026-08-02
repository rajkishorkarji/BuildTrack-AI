import { useState } from 'react';
import {
  Building2,
  FolderKanban,
  Users,
  CreditCard,
  Server,
  Activity,
  Bot,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Camera,
  QrCode,
  Mic,
  Clock,
  HardHat,
  FileText,
  Truck,
  Plus,
  Upload,
  XCircle,
  UserPlus,
} from 'lucide-react';

/* 1. SUPER ADMIN DASHBOARD */
export function SuperAdminDashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Total Tenant Companies</span>
          <h2 style={{ fontSize: '28px', color: 'var(--blue)', marginTop: '6px' }}>24 Companies</h2>
          <small style={{ color: 'var(--green)' }}>+3 registered this month</small>
        </div>
        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Total Enterprise Projects</span>
          <h2 style={{ fontSize: '28px', color: 'var(--green)', marginTop: '6px' }}>142 Sites</h2>
          <small style={{ color: 'var(--muted)' }}>Across 18 regions</small>
        </div>
        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>System Active Users</span>
          <h2 style={{ fontSize: '28px', color: 'var(--purple)', marginTop: '6px' }}>12,840 Users</h2>
          <small style={{ color: 'var(--blue)' }}>8,450 Workers Active</small>
        </div>
        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Platform Server Health</span>
          <h2 style={{ fontSize: '28px', color: 'var(--green)', marginTop: '6px' }}>99.98% Uptime</h2>
          <small style={{ color: 'var(--green)' }}>Storage: 1.4 TB / 10 TB</small>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={20} style={{ color: 'var(--blue)' }} /> Platform Registered Companies Ledger
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '10px 0' }}>Company Name</th>
                <th style={{ padding: '10px 0' }}>Subscription Tier</th>
                <th style={{ padding: '10px 0' }}>Active Projects</th>
                <th style={{ padding: '10px 0' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 0', fontWeight: 600 }}>Solviontech Infrastructure Ltd</td>
                <td style={{ padding: '12px 0', color: 'var(--purple)', fontWeight: 600 }}>Enterprise ($4,999/mo)</td>
                <td style={{ padding: '12px 0' }}>3 Active Sites</td>
                <td style={{ padding: '12px 0', color: 'var(--green)', fontWeight: 700 }}>ACTIVE</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 0', fontWeight: 600 }}>Apex Construction Group</td>
                <td style={{ padding: '12px 0', color: 'var(--blue)', fontWeight: 600 }}>Pro Plan ($1,999/mo)</td>
                <td style={{ padding: '12px 0' }}>8 Active Sites</td>
                <td style={{ padding: '12px 0', color: 'var(--green)', fontWeight: 700 }}>ACTIVE</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bot size={20} style={{ color: 'var(--purple)' }} /> Global AI Engine Health
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--muted)' }}>Global Delay Model</span>
              <strong style={{ color: 'var(--green)' }}>Active (94.2% Acc)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--muted)' }}>Cost Risk Model</span>
              <strong style={{ color: 'var(--green)' }}>Active (91.8% Acc)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--muted)' }}>SMTP / Gateway</span>
              <strong style={{ color: 'var(--blue)' }}>Connected</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 2. COMPANY ADMIN DASHBOARD */
export function CompanyAdminDashboard() {
  const [actionMsg, setActionMsg] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
      {actionMsg && (
        <div style={{ background: 'rgba(36, 196, 107, 0.15)', color: 'var(--green)', padding: '12px 18px', borderRadius: '10px', fontWeight: 600, fontSize: '14px' }}>
          {actionMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Company Financial Cap</span>
          <h2 style={{ fontSize: '26px', color: 'var(--blue)', marginTop: '6px' }}>$500,000</h2>
          <small style={{ color: 'var(--muted)' }}>Across 3 active sites</small>
        </div>
        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>CPI (Cost Performance)</span>
          <h2 style={{ fontSize: '26px', color: 'var(--green)', marginTop: '6px' }}>0.895</h2>
          <small style={{ color: 'var(--green)' }}>Under Budget Target</small>
        </div>
        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>SPI (Schedule Performance)</span>
          <h2 style={{ fontSize: '26px', color: 'var(--orange)', marginTop: '6px' }}>0.765</h2>
          <small style={{ color: 'var(--orange)' }}>Minor Timeline Variance</small>
        </div>
        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Total Workforce Managed</span>
          <h2 style={{ fontSize: '26px', color: 'var(--purple)', marginTop: '6px' }}>850 Workers</h2>
          <small style={{ color: 'var(--muted)' }}>12 Subcontractors</small>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign size={20} style={{ color: 'var(--orange)' }} /> High-Value Financial Authorizations (&gt;$50k)
          </h3>
          <div style={{ background: 'var(--panel-soft)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <strong style={{ color: 'var(--text)' }}>Tata Steel Ltd.</strong>
              <span style={{ color: 'var(--blue)', fontWeight: 700 }}>$78,000.00</span>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px' }}>
              Project: Metro Tower Complex • GST: $14,040
            </div>
            <button
              type="button"
              className="primary-button"
              style={{ background: 'var(--green)', padding: '6px 14px', fontSize: '12px' }}
              onClick={() => {
                setActionMsg('High-value invoice for Tata Steel Ltd. AUTHORIZED!');
                setTimeout(() => setActionMsg(''), 3000);
              }}
            >
              <CheckCircle2 size={14} /> Authorize Payment
            </button>
          </div>
        </div>

        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} style={{ color: 'var(--blue)' }} /> Project Manager Allocation Desk
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '10px 0' }}>Manager Name</th>
                <th style={{ padding: '10px 0' }}>Assigned Site</th>
                <th style={{ padding: '10px 0' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 0', fontWeight: 600 }}>Vikram Nair</td>
                <td style={{ padding: '12px 0', color: 'var(--muted)' }}>Metro Tower Complex</td>
                <td style={{ padding: '12px 0', color: 'var(--green)', fontWeight: 700 }}>ACTIVE</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 0', fontWeight: 600 }}>Rajkishor Karji</td>
                <td style={{ padding: '12px 0', color: 'var(--muted)' }}>Skyview Residency</td>
                <td style={{ padding: '12px 0', color: 'var(--green)', fontWeight: 700 }}>ACTIVE</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* 3. SITE ENGINEER DASHBOARD */
export function SiteEngineerDashboard() {
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Site Inspection Status</span>
          <h2 style={{ fontSize: '26px', color: 'var(--green)', marginTop: '6px' }}>Passed (Floor 14)</h2>
        </div>
        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Daily Progress Log</span>
          <h2 style={{ fontSize: '26px', color: 'var(--blue)', marginTop: '6px' }}>80% Completed</h2>
        </div>
        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Concrete Quality Check</span>
          <h2 style={{ fontSize: '26px', color: 'var(--purple)', marginTop: '6px' }}>Grade M40 Approved</h2>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Camera size={20} style={{ color: 'var(--blue)' }} /> Site Image & Quality Upload
          </h3>
          {photoUploaded && (
            <div style={{ background: 'rgba(36, 196, 107, 0.15)', color: 'var(--green)', padding: '10px', borderRadius: '8px', marginBottom: '12px', fontSize: '13px' }}>
              Site photo uploaded and analyzed by AI Safety Detector!
            </div>
          )}
          <button type="button" className="primary-button" onClick={() => setPhotoUploaded(true)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Upload size={16} /> Take / Upload Site Inspection Photo
          </button>
        </div>

        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} style={{ color: 'var(--green)' }} /> Submit Daily Progress Report
          </h3>
          {reportSubmitted && (
            <div style={{ background: 'rgba(36, 196, 107, 0.15)', color: 'var(--green)', padding: '10px', borderRadius: '8px', marginBottom: '12px', fontSize: '13px' }}>
              Daily Progress Report submitted to Project Manager!
            </div>
          )}
          <button type="button" className="primary-button" onClick={() => setReportSubmitted(true)} style={{ width: '100%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} /> Submit Today&apos;s Engineering Report
          </button>
        </div>
      </div>
    </div>
  );
}

/* 4. CONTRACTOR DASHBOARD */
export function ContractorDashboard() {
  const [invoiceSubmitted, setInvoiceSubmitted] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Contract Value</span>
          <h2 style={{ fontSize: '26px', color: 'var(--blue)', marginTop: '6px' }}>$78,000.00</h2>
        </div>
        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Subcontractor Crew</span>
          <h2 style={{ fontSize: '26px', color: 'var(--green)', marginTop: '6px' }}>18 Masons & Welders</h2>
        </div>
        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Payment Claim Status</span>
          <h2 style={{ fontSize: '26px', color: 'var(--orange)', marginTop: '6px' }}>Pending Approval</h2>
        </div>
      </div>

      <div className="panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DollarSign size={20} style={{ color: 'var(--green)' }} /> Submit Labor Billing Invoice
        </h3>
        {invoiceSubmitted && (
          <div style={{ background: 'rgba(36, 196, 107, 0.15)', color: 'var(--green)', padding: '10px', borderRadius: '8px', marginBottom: '12px', fontSize: '13px' }}>
            Invoice #INV-2025-009 submitted to Company Admin for payment approval!
          </div>
        )}
        <button type="button" className="primary-button" onClick={() => setInvoiceSubmitted(true)}>
          <Plus size={16} /> Submit Subcontractor Payment Claim
        </button>
      </div>
    </div>
  );
}

/* 5. WORKER DASHBOARD (MOBILE FIRST) */
export function WorkerDashboard() {
  const [checkedIn, setCheckedIn] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px', maxWidth: '500px', margin: '16px auto' }}>
      <div className="panel" style={{ padding: '24px', textAlign: 'center', background: 'linear-gradient(135deg, var(--panel), var(--panel-soft))' }}>
        <QrCode size={56} style={{ color: 'var(--blue)', marginBottom: '12px' }} />
        <h2 style={{ fontSize: '22px', marginBottom: '6px' }}>Site Attendance Check-In</h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '16px' }}>
          {checkedIn ? 'Clocked in at 08:12 AM • Zone A' : 'Tap to scan QR Code and clock in for shift'}
        </p>
        <button
          type="button"
          className="primary-button full-width"
          style={{ background: checkedIn ? 'var(--green)' : undefined, padding: '14px', fontSize: '16px' }}
          onClick={() => setCheckedIn(!checkedIn)}
        >
          {checkedIn ? '✓ Clocked In (8.0 Hrs Logged)' : 'Instant QR Check-In'}
        </button>
      </div>

      <div className="panel" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HardHat size={18} style={{ color: 'var(--orange)' }} /> Today&apos;s Assigned Task
        </h3>
        <div style={{ background: 'var(--panel-soft)', padding: '14px', borderRadius: '10px' }}>
          <strong style={{ fontSize: '15px', color: 'var(--text)' }}>02120 Diamond Saw Cutting</strong>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px', margin: 0 }}>
            Precision concrete cutting for Floor 14 riser shafts.
          </p>
        </div>
      </div>

      <div className="panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Daily Wage Earned Today</span>
          <h3 style={{ fontSize: '22px', color: 'var(--green)', marginTop: '2px' }}>$85.00 / day</h3>
        </div>
        <button type="button" className="primary-button" style={{ background: 'var(--purple)', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => setVoiceActive(!voiceActive)}>
          <Mic size={16} /> {voiceActive ? 'Listening...' : 'AI Voice Assistant'}
        </button>
      </div>
    </div>
  );
}
