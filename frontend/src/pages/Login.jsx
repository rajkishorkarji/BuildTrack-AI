import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, registerUser } = useAuth();
  const { addCompany } = useData();

  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: 'raj@buildtrack.ai',
    phone: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    role: 'COMPANY_ADMIN',
  });

  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    if (isSignUp) {
      if (formData.password !== formData.confirmPassword) {
        setMessage({ text: 'Passwords do not match!', type: 'error' });
        setLoading(false);
        return;
      }

      if (!formData.email || !formData.firstName) {
        setMessage({ text: 'Please fill in all required fields.', type: 'error' });
        setLoading(false);
        return;
      }

      // Register real user
      registerUser(formData);

      // Register company tenant if specified
      if (formData.companyName.trim()) {
        addCompany({
          name: formData.companyName.trim(),
          adminName: `${formData.firstName} ${formData.lastName}`.trim(),
          adminEmail: formData.email,
        });
      }

      navigate('/dashboard');
    } else {
      if (!formData.email) {
        setMessage({ text: 'Please enter your email address.', type: 'error' });
        setLoading(false);
        return;
      }

      login(formData.email, formData.password);
      navigate('/dashboard');
    }

    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '20px' }}>
      <div className="panel" style={{ width: '100%', maxWidth: '480px', padding: '36px', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'center' }}>
            <svg width="64" height="64" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '14px', boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)' }}>
              <defs>
                <linearGradient id="bt-bg-login" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0B1739"/>
                  <stop offset="100%" stopColor="#2563EB"/>
                </linearGradient>
                <filter id="bt-glow-login" x="-150%" y="-150%" width="400%" height="400%">
                  <feGaussianBlur stdDeviation="12" result="blur"/>
                  <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              <rect x="28" y="28" width="456" height="456" rx="100" fill="url(#bt-bg-login)"/>
              <rect x="144" y="308" width="44" height="67"  rx="18" fill="#F8FAFC"/>
              <rect x="204" y="266" width="44" height="109" rx="18" fill="#F8FAFC"/>
              <rect x="264" y="224" width="44" height="151" rx="18" fill="#F8FAFC"/>
              <rect x="324" y="178" width="44" height="197" rx="18" fill="#F8FAFC"/>
              <circle cx="346" cy="107" r="26" fill="#F59E0B" filter="url(#bt-glow-login)"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>BuildTrack AI</h1>
          <p style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '4px' }}>
            {isSignUp ? 'Register Real Account & Tenant Company' : 'Sign in to access your role-based workspace'}
          </p>
        </div>

        {message.text && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '13px',
              fontWeight: 600,
              background: message.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(36, 196, 107, 0.15)',
              color: message.type === 'error' ? 'var(--red)' : 'var(--green)',
            }}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {isSignUp && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>First Name *</label>
                  <input
                    type="text"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Last Name</label>
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Company Name</label>
                <input
                  type="text"
                  placeholder="Company / Enterprise Name"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Assign System Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
                >
                  <option value="COMPANY_ADMIN">Company Admin</option>
                  <option value="PROJECT_MANAGER">Project Manager</option>
                  <option value="SITE_ENGINEER">Site Engineer</option>
                  <option value="CONTRACTOR">Contractor</option>
                  <option value="WORKER">Worker</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Email Address *</label>
            <input
              type="email"
              placeholder="e.g. raj@buildtrack.ai"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
            />
          </div>

          {isSignUp && (
            <div>
              <label style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
              />
            </div>
          )}

          <button type="submit" className="primary-button full-width" style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} disabled={loading}>
            {loading ? 'Entering System...' : isSignUp ? 'Register & Enter Workspace' : 'Sign In & Enter Workspace'} <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--muted)' }}>
          {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
          >
            {isSignUp ? 'Sign In' : 'Register Real Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
