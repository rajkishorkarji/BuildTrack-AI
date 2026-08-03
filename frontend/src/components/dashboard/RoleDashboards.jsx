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

/* 1. SUPER ADMIN DASHBOARD (SYSTEM ADMIN PLATFORM OVERVIEW) */
export function SuperAdminDashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
      {/* 14 System Admin Platform Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="panel" style={{ padding: '16px 20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Total Companies</span>
          <h2 style={{ fontSize: '24px', color: 'var(--blue)', marginTop: '4px' }}>24</h2>
          <small style={{ color: 'var(--green)' }}>+3 this month</small>
        </div>

        <div className="panel" style={{ padding: '16px 20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Active Companies</span>
          <h2 style={{ fontSize: '24px', color: 'var(--green)', marginTop: '4px' }}>22</h2>
          <small style={{ color: 'var(--green)' }}>Normal Status</small>
        </div>

        <div className="panel" style={{ padding: '16px 20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Suspended Companies</span>
          <h2 style={{ fontSize: '24px', color: 'var(--red)', marginTop: '4px' }}>2</h2>
          <small style={{ color: 'var(--red)' }}>Action Required</small>
        </div>

        <div className="panel" style={{ padding: '16px 20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Total Users</span>
          <h2 style={{ fontSize: '24px', color: 'var(--purple)', marginTop: '4px' }}>12,840</h2>
          <small style={{ color: 'var(--muted)' }}>Across 6 Roles</small>
        </div>

        <div className="panel" style={{ padding: '16px 20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Online Users</span>
          <h2 style={{ fontSize: '24px', color: 'var(--green)', marginTop: '4px' }}>1,420</h2>
          <small style={{ color: 'var(--green)' }}>Live Active Sessions</small>
        </div>

        <div className="panel" style={{ padding: '16px 20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Total Projects</span>
          <h2 style={{ fontSize: '24px', color: 'var(--blue)', marginTop: '4px' }}>142</h2>
          <small style={{ color: 'var(--muted)' }}>Global Portfolio</small>
        </div>

        <div className="panel" style={{ padding: '16px 20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Active Projects</span>
          <h2 style={{ fontSize: '24px', color: 'var(--green)', marginTop: '4px' }}>118</h2>
          <small style={{ color: 'var(--green)' }}>On-site active</small>
        </div>

        <div className="panel" style={{ padding: '16px 20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Completed Projects</span>
          <h2 style={{ fontSize: '24px', color: 'var(--purple)', marginTop: '4px' }}>24</h2>
          <small style={{ color: 'var(--purple)' }}>Handed over</small>
        </div>

        <div className="panel" style={{ padding: '16px 20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Total Workers</span>
          <h2 style={{ fontSize: '24px', color: 'var(--orange)', marginTop: '4px' }}>8,450</h2>
          <small style={{ color: 'var(--muted)' }}>On-field workforce</small>
        </div>

        <div className="panel" style={{ padding: '16px 20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Total ARR Revenue</span>
          <h2 style={{ fontSize: '24px', color: 'var(--green)', marginTop: '4px' }}>$142,500</h2>
          <small style={{ color: 'var(--green)' }}>+18.4% YoY Growth</small>
        </div>

        <div className="panel" style={{ padding: '16px 20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Active Subscriptions</span>
          <h2 style={{ fontSize: '24px', color: 'var(--purple)', marginTop: '4px' }}>24</h2>
          <small style={{ color: 'var(--purple)' }}>SaaS Contracts</small>
        </div>

        <div className="panel" style={{ padding: '16px 20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Server Health</span>
          <h2 style={{ fontSize: '24px', color: 'var(--green)', marginTop: '4px' }}>99.98%</h2>
          <small style={{ color: 'var(--green)' }}>Optimal Uptime</small>
        </div>

        <div className="panel" style={{ padding: '16px 20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Storage Used</span>
          <h2 style={{ fontSize: '24px', color: 'var(--blue)', marginTop: '4px' }}>1.4 TB</h2>
          <small style={{ color: 'var(--muted)' }}>Of 10 TB Capacity</small>
        </div>

        <div className="panel" style={{ padding: '16px 20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>API Requests Today</span>
          <h2 style={{ fontSize: '24px', color: 'var(--orange)', marginTop: '4px' }}>1.28M</h2>
          <small style={{ color: 'var(--green)' }}>Avg Latency: 14ms</small>
        </div>
      </div>

      {/* Main Ledger Section */}
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
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 0', fontWeight: 600 }}>Metropolis Builders Corp</td>
                <td style={{ padding: '12px 0', color: 'var(--orange)', fontWeight: 600 }}>Starter Plan ($499/mo)</td>
                <td style={{ padding: '12px 0' }}>2 Active Sites</td>
                <td style={{ padding: '12px 0', color: 'var(--red)', fontWeight: 700 }}>SUSPENDED</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bot size={20} style={{ color: 'var(--purple)' }} /> Global AI Telemetry
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
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--muted)' }}>Safety Vision Detector</span>
              <strong style={{ color: 'var(--purple)' }}>Active (96.5% Acc)</strong>
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

/* 2. COMPANY ADMIN DASHBOARD (COMPANY OVERVIEW) */
export function CompanyAdminDashboard() {
  const [actionMsg, setActionMsg] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
      {actionMsg && (
        <div style={{ background: 'rgba(36, 196, 107, 0.15)', border: '1px solid var(--green)', color: 'var(--green)', padding: '12px 18px', borderRadius: '10px', fontWeight: 600, fontSize: '14px' }}>
          {actionMsg}
        </div>
      )}

      {/* 8 Company Overview Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="panel" style={{ padding: '16px 20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Total Projects</span>
          <h2 style={{ fontSize: '24px', color: 'var(--blue)', marginTop: '4px' }}>14</h2>
          <small style={{ color: 'var(--muted)' }}>Enterprise Sites</small>
        </div>

        <div className="panel" style={{ padding: '16px 20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Active Projects</span>
          <h2 style={{ fontSize: '24px', color: 'var(--green)', marginTop: '4px' }}>12</h2>
          <small style={{ color: 'var(--green)' }}>Under Execution</small>
        </div>

        <div className="panel" style={{ padding: '16px 20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Total Employees</span>
          <h2 style={{ fontSize: '24px', color: 'var(--purple)', marginTop: '4px' }}>240</h2>
          <small style={{ color: 'var(--muted)' }}>Staff & Engineers</small>
        </div>

        <div className="panel" style={{ padding: '16px 20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Total Workers</span>
          <h2 style={{ fontSize: '24px', color: 'var(--orange)', marginTop: '4px' }}>850</h2>
          <small style={{ color: 'var(--muted)' }}>Across 12 Contractors</small>
        </div>

        <div className="panel" style={{ padding: '16px 20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Today&apos;s Attendance</span>
          <h2 style={{ fontSize: '24px', color: 'var(--green)', marginTop: '4px' }}>94.8%</h2>
          <small style={{ color: 'var(--green)' }}>806 Workers Clocked In</small>
        </div>

        <div className="panel" style={{ padding: '16px 20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Equipment Status</span>
          <h2 style={{ fontSize: '24px', color: 'var(--blue)', marginTop: '4px' }}>32 Active</h2>
          <small style={{ color: 'var(--orange)' }}>2 In Maintenance</small>
        </div>

        <div className="panel" style={{ padding: '16px 20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Budget Overview</span>
          <h2 style={{ fontSize: '24px', color: 'var(--green)', marginTop: '4px' }}>$4,250,000</h2>
          <small style={{ color: 'var(--green)' }}>CPI: 0.895 (Under Budget)</small>
        </div>

        <div className="panel" style={{ padding: '16px 20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Schedule Performance</span>
          <h2 style={{ fontSize: '24px', color: 'var(--orange)', marginTop: '4px' }}>SPI: 0.820</h2>
          <small style={{ color: 'var(--orange)' }}>Minor Timeline Variance</small>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign size={20} style={{ color: 'var(--orange)' }} /> Financial Authorizations (&gt;$50k)
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

/* 3. SITE ENGINEER DASHBOARD (ON-SITE EXECUTION) */
export function SiteEngineerDashboard() {
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
      {/* 10 Site Engineer Overview Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="panel" style={{ padding: '16px 20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Assigned Project</span>
          <h2 style={{ fontSize: '20px', color: 'var(--blue)', marginTop: '4px' }}>Metro Tower Complex</h2>
          <small style={{ color: 'var(--muted)' }}>Tower A • Floor 14</small>
        </div>

        <div className="panel" style={{ padding: '16px 20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Today&apos;s Tasks</span>
          <h2 style={{ fontSize: '24px', color: 'var(--purple)', marginTop: '4px' }}>8 Tasks</h2>
          <small style={{ color: 'var(--green)' }}>6 In Progress</small>
        </div>

        <div className="panel" style={{ padding: '16px 20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Active Workers</span>
          <h2 style={{ fontSize: '24px', color: 'var(--orange)', marginTop: '4px' }}>45 Laborers</h2>
          <small style={{ color: 'var(--muted)' }}>3 Subcontractor Crews</small>
        </div>

        <div className="panel" style={{ padding: '16px 20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Today&apos;s Attendance</span>
          <h2 style={{ fontSize: '24px', color: 'var(--green)', marginTop: '4px' }}>96% Verified</h2>
          <small style={{ color: 'var(--green)' }}>43 Verified via QR</small>
        </div>

        <div className="panel" style={{ padding: '16px 20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Work Progress</span>
          <h2 style={{ fontSize: '24px', color: 'var(--blue)', marginTop: '4px' }}>80% Completed</h2>
          <small style={{ color: 'var(--muted)' }}>Shift Target: 100%</small>
        </div>

        <div className="panel" style={{ padding: '16px 20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Pending Issues</span>
          <h2 style={{ fontSize: '24px', color: 'var(--red)', marginTop: '4px' }}>1 Hazard</h2>
          <small style={{ color: 'var(--red)' }}>Scaffold Handrail</small>
        </div>

        <div className="panel" style={{ padding: '16px 20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Equipment in Use</span>
          <h2 style={{ fontSize: '24px', color: 'var(--purple)', marginTop: '4px' }}>4 Machines</h2>
          <small style={{ color: 'var(--muted)' }}>1 Crane, 2 Hoists</small>
        </div>

        <div className="panel" style={{ padding: '16px 20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Material Requests</span>
          <h2 style={{ fontSize: '24px', color: 'var(--blue)', marginTop: '4px' }}>2 Sent</h2>
          <small style={{ color: 'var(--green)' }}>Grade M40 Concrete</small>
        </div>

        <div className="panel" style={{ padding: '16px 20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Site Weather</span>
          <h2 style={{ fontSize: '20px', color: 'var(--green)', marginTop: '4px' }}>32°C Sunny</h2>
          <small style={{ color: 'var(--green)' }}>Clear Field Conditions</small>
        </div>

        <div className="panel" style={{ padding: '16px 20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Site Notifications</span>
          <h2 style={{ fontSize: '24px', color: 'var(--orange)', marginTop: '4px' }}>3 Alerts</h2>
          <small style={{ color: 'var(--muted)' }}>Quality & Safety</small>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Camera size={20} style={{ color: 'var(--blue)' }} /> Site Image & Quality Upload
          </h3>
          {photoUploaded && (
            <div style={{ background: 'rgba(36, 196, 107, 0.15)', border: '1px solid var(--green)', color: 'var(--green)', padding: '10px', borderRadius: '8px', marginBottom: '12px', fontSize: '13px' }}>
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
            <div style={{ background: 'rgba(36, 196, 107, 0.15)', border: '1px solid var(--green)', color: 'var(--green)', padding: '10px', borderRadius: '8px', marginBottom: '12px', fontSize: '13px' }}>
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

/* 4. CONTRACTOR DASHBOARD (SUBCONTRACTOR EXECUTION) */
export function ContractorDashboard() {
  const [invoiceSubmitted, setInvoiceSubmitted] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
      {/* 9 Subcontractor Overview Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="panel" style={{ padding: '16px 20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Assigned Project</span>
          <h2 style={{ fontSize: '20px', color: 'var(--blue)', marginTop: '4px' }}>Metro Tower Complex</h2>
          <small style={{ color: 'var(--muted)' }}>Contract #FOX-STL-2025</small>
        </div>

        <div className="panel" style={{ padding: '16px 20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Assigned Tasks</span>
          <h2 style={{ fontSize: '24px', color: 'var(--purple)', marginTop: '4px' }}>12 Tasks</h2>
          <small style={{ color: 'var(--green)' }}>Steel Framing & Masonry</small>
        </div>

        <div className="panel" style={{ padding: '16px 20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Active Workers</span>
          <h2 style={{ fontSize: '24px', color: 'var(--green)', marginTop: '4px' }}>18 Workers</h2>
          <small style={{ color: 'var(--green)' }}>Masons & Welders</small>
        </div>

        <div className="panel" style={{ padding: '16px 20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Today&apos;s Attendance</span>
          <h2 style={{ fontSize: '24px', color: 'var(--green)', marginTop: '4px' }}>100% Present</h2>
          <small style={{ color: 'var(--green)' }}>18 / 18 Clocked In via QR</small>
        </div>

        <div className="panel" style={{ padding: '16px 20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Work Progress</span>
          <h2 style={{ fontSize: '24px', color: 'var(--blue)', marginTop: '4px' }}>68% Completion</h2>
          <small style={{ color: 'var(--muted)' }}>On Schedule</small>
        </div>

        <div className="panel" style={{ padding: '16px 20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Pending Tasks</span>
          <h2 style={{ fontSize: '24px', color: 'var(--orange)', marginTop: '4px' }}>4 Active</h2>
          <small style={{ color: 'var(--orange)' }}>Floor 14 Shaft Steel</small>
        </div>

        <div className="panel" style={{ padding: '16px 20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Material Requests</span>
          <h2 style={{ fontSize: '24px', color: 'var(--blue)', marginTop: '4px' }}>2 Pending</h2>
          <small style={{ color: 'var(--muted)' }}>Rebar & Aggregate</small>
        </div>

        <div className="panel" style={{ padding: '16px 20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Equipment Requests</span>
          <h2 style={{ fontSize: '24px', color: 'var(--purple)', marginTop: '4px' }}>1 Approved</h2>
          <small style={{ color: 'var(--green)' }}>Tower Crane Slot</small>
        </div>

        <div className="panel" style={{ padding: '16px 20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Notifications</span>
          <h2 style={{ fontSize: '24px', color: 'var(--orange)', marginTop: '4px' }}>2 Alerts</h2>
          <small style={{ color: 'var(--muted)' }}>Material Delivery</small>
        </div>
      </div>

      <div className="panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DollarSign size={20} style={{ color: 'var(--green)' }} /> Submit Labor Billing Invoice
        </h3>
        {invoiceSubmitted && (
          <div style={{ background: 'rgba(36, 196, 107, 0.15)', border: '1px solid var(--green)', color: 'var(--green)', padding: '10px', borderRadius: '8px', marginBottom: '12px', fontSize: '13px' }}>
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

/* 5. WORKER DASHBOARD (MOBILE FIRST FIELD INTERFACE) */
export function WorkerDashboard() {
  const [checkedIn, setCheckedIn] = useState(true);
  const [taskStatus, setTaskStatus] = useState('IN_PROGRESS'); // 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
  const [voiceActive, setVoiceActive] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px', maxWidth: '540px', margin: '16px auto' }}>
      {/* 6 Mobile Overview Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div className="panel" style={{ padding: '14px 16px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '11px', fontWeight: 600 }}>Today&apos;s Tasks</span>
          <h2 style={{ fontSize: '20px', color: 'var(--blue)', marginTop: '2px' }}>2 Tasks</h2>
          <small style={{ color: 'var(--muted)' }}>Floor 14 Shaft</small>
        </div>

        <div className="panel" style={{ padding: '14px 16px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '11px', fontWeight: 600 }}>Attendance Status</span>
          <h2 style={{ fontSize: '20px', color: 'var(--green)', marginTop: '2px' }}>Clocked In</h2>
          <small style={{ color: 'var(--green)' }}>08:12 AM • Zone A</small>
        </div>

        <div className="panel" style={{ padding: '14px 16px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '11px', fontWeight: 600 }}>Completed Tasks</span>
          <h2 style={{ fontSize: '20px', color: 'var(--green)', marginTop: '2px' }}>1 Completed</h2>
          <small style={{ color: 'var(--green)' }}>Rebar Shuttering</small>
        </div>

        <div className="panel" style={{ padding: '14px 16px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '11px', fontWeight: 600 }}>Pending Tasks</span>
          <h2 style={{ fontSize: '20px', color: 'var(--orange)', marginTop: '2px' }}>1 In Progress</h2>
          <small style={{ color: 'var(--orange)' }}>Saw Cutting</small>
        </div>

        <div className="panel" style={{ padding: '14px 16px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '11px', fontWeight: 600 }}>Work Progress</span>
          <h2 style={{ fontSize: '20px', color: 'var(--blue)', marginTop: '2px' }}>85% Done</h2>
          <small style={{ color: 'var(--muted)' }}>Shift Progress</small>
        </div>

        <div className="panel" style={{ padding: '14px 16px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '11px', fontWeight: 600 }}>Notifications</span>
          <h2 style={{ fontSize: '20px', color: 'var(--purple)', marginTop: '2px' }}>2 Safety Alerts</h2>
          <small style={{ color: 'var(--purple)' }}>Wear Hardhat</small>
        </div>
      </div>

      {/* QR Attendance Check-In Widget */}
      <div className="panel" style={{ padding: '24px', textAlign: 'center', background: 'linear-gradient(135deg, var(--panel), var(--panel-soft))' }}>
        <QrCode size={48} style={{ color: 'var(--blue)', marginBottom: '10px' }} />
        <h2 style={{ fontSize: '20px', marginBottom: '4px' }}>On-Site QR Attendance</h2>
        <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '14px' }}>
          {checkedIn ? 'Clocked in at 08:12 AM • Verified by Geo-Fence' : 'Scan site terminal QR code to mark attendance'}
        </p>
        <button
          type="button"
          className="primary-button full-width"
          style={{ background: checkedIn ? 'var(--green)' : undefined, padding: '12px', fontSize: '15px' }}
          onClick={() => setCheckedIn(!checkedIn)}
        >
          {checkedIn ? '✓ Clocked In (8.0 Hrs Logged)' : 'Instant QR Check-In'}
        </button>
      </div>

      {/* Active Work Assignment Controls */}
      <div className="panel" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HardHat size={18} style={{ color: 'var(--orange)' }} /> Today&apos;s Active Work Assignment
        </h3>
        <div style={{ background: 'var(--panel-soft)', padding: '14px', borderRadius: '10px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <strong style={{ fontSize: '15px', color: 'var(--text)' }}>02120 Diamond Saw Cutting</strong>
            <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: taskStatus === 'COMPLETED' ? 'rgba(36, 196, 107, 0.15)' : 'rgba(78, 132, 247, 0.15)', color: taskStatus === 'COMPLETED' ? 'var(--green)' : 'var(--blue)' }}>
              {taskStatus}
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
            Precision concrete cutting for Floor 14 riser shafts. High priority.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {taskStatus !== 'COMPLETED' ? (
            <>
              <button
                type="button"
                className="secondary-button"
                style={{ flex: 1, padding: '10px' }}
                onClick={() => setTaskStatus(taskStatus === 'IN_PROGRESS' ? 'PAUSED' : 'IN_PROGRESS')}
              >
                {taskStatus === 'IN_PROGRESS' ? 'Pause Work' : 'Resume Work'}
              </button>
              <button
                type="button"
                className="primary-button"
                style={{ flex: 1, padding: '10px', background: 'var(--green)' }}
                onClick={() => setTaskStatus('COMPLETED')}
              >
                ✓ Complete Task
              </button>
            </>
          ) : (
            <div style={{ color: 'var(--green)', fontWeight: 600, fontSize: '13px', textAlign: 'center', width: '100%' }}>
              ✓ Task marked completed & reported to Site Engineer!
            </div>
          )}
        </div>
      </div>

      {/* Daily Wage & AI Voice Assistant */}
      <div className="panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Daily Shift Rate</span>
          <h3 style={{ fontSize: '20px', color: 'var(--green)', marginTop: '2px' }}>$85.00 / day</h3>
        </div>
        <button
          type="button"
          className="primary-button"
          style={{ background: 'var(--purple)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          onClick={() => setVoiceActive(!voiceActive)}
        >
          <Mic size={16} /> {voiceActive ? 'Listening...' : 'AI Voice Helper'}
        </button>
      </div>
    </div>
  );
}
