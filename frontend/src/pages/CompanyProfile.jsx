import { useState } from 'react';
import {
  Building2,
  Upload,
  Save,
  Mail,
  Phone,
  MapPin,
  FileCheck,
  CheckCircle2,
  Globe,
  Briefcase,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CompanyProfile() {
  const { user } = useAuth();
  const [companyData, setCompanyData] = useState({
    name: user?.companyName || 'Solviontech Infrastructure Ltd',
    code: 'SOLV-INFRA-2024',
    regNumber: 'CIN-U45200OR2024PLC09420',
    email: 'contact@solviontech.com',
    phone: '+91 674 230 9482',
    website: 'https://solviontech.com',
    address: 'Plot 42, Infocity Technology Park, Bhubaneswar, Odisha - 751024',
    description: 'Premier infrastructure and civil engineering firm specializing in high-rise towers, highways, and smart city projects.',
  });
  const [notice, setNotice] = useState('');

  const notify = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    notify('Company Profile & Enterprise details saved successfully!');
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <p className="eyebrow" style={{ color: 'var(--blue)', fontWeight: 600 }}>ENTERPRISE PROFILE</p>
        <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Company Profile & Credentials</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '4px' }}>
          Company Admin portal to manage official business details, corporate contact information, and logo branding.
        </p>
      </div>

      {notice && (
        <div style={{ background: 'rgba(36, 196, 107, 0.15)', border: '1px solid var(--green)', color: 'var(--green)', padding: '12px 18px', borderRadius: '10px', fontWeight: 600, fontSize: '14px' }}>
          {notice}
        </div>
      )}

      {/* Header Card with Logo */}
      <div className="panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '16px', background: 'rgba(78, 132, 247, 0.15)', border: '1px solid var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blue)' }}>
          <Building2 size={40} />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '22px', margin: 0 }}>{companyData.name}</h2>
          <span style={{ color: 'var(--purple)', fontWeight: 600, fontSize: '13px' }}>Corporate ID: {companyData.code}</span>
          <p style={{ color: 'var(--muted)', fontSize: '13px', margin: '4px 0 0 0' }}>{companyData.address}</p>
        </div>
        <button
          type="button"
          className="secondary-button"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={() => notify('Company logo updated!')}
        >
          <Upload size={16} /> Upload New Logo
        </button>
      </div>

      {/* Profile Form */}
      <div className="panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Briefcase size={20} style={{ color: 'var(--blue)' }} /> Business Identification & Contacts
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>Company Legal Name</label>
              <input
                type="text"
                value={companyData.name}
                onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>Tax Registration / CIN</label>
              <input
                type="text"
                value={companyData.regNumber}
                onChange={(e) => setCompanyData({ ...companyData, regNumber: e.target.value })}
                style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>Corporate Email</label>
              <input
                type="email"
                value={companyData.email}
                onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>Contact Phone Number</label>
              <input
                type="text"
                value={companyData.phone}
                onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>Company Website URL</label>
            <input
              type="text"
              value={companyData.website}
              onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
              style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>Corporate Registered Address</label>
            <input
              type="text"
              value={companyData.address}
              onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
              style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>Company Overview & Description</label>
            <textarea
              rows={3}
              value={companyData.description}
              onChange={(e) => setCompanyData({ ...companyData, description: e.target.value })}
              style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button type="submit" className="primary-button" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Save size={16} /> Save Company Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
