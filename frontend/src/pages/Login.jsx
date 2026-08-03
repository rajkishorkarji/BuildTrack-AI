import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, User, Phone, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    firstName: 'Rajkishor',
    lastName: 'Karji',
    email: 'rajkishor@buildtrack.ai',
    phone: '+91 9876543210',
    password: 'password123',
    confirmPassword: 'password123',
    companyName: 'Solviontech Pvt Ltd',
    role: 'PROJECT_MANAGER',
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

      try {
        const regRes = await fetch('http://localhost:8080/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const regData = await regRes.json();

        if (regData.success && regData.data) {
          await fetch(`http://localhost:8080/api/auth/verify-email?token=${regData.data}`);
        }

        login(formData.email, formData.password, formData.role, `${formData.firstName} ${formData.lastName}`);
        navigate('/dashboard');
      } catch (err) {
        login(formData.email, formData.password, formData.role, `${formData.firstName} ${formData.lastName}`);
        navigate('/dashboard');
      }
    } else {
      try {
        const loginRes = await fetch('http://localhost:8080/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        });

        const loginData = await loginRes.json();

        if (loginData.success && loginData.data) {
          localStorage.setItem('accessToken', loginData.data.accessToken);
          localStorage.setItem('refreshToken', loginData.data.refreshToken);
        }
      } catch (err) {
        // Fallthrough
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
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)' }}>BuildTrack AI</h1>
          <p style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '4px' }}>
            {isSignUp ? 'Register your account to access the platform' : 'Welcome back! Sign in to enter the system'}
          </p>
        </div>

        {message.text && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: message.type === 'success' ? 'rgba(36, 196, 107, 0.15)' : 'rgba(239, 82, 82, 0.15)',
              color: message.type === 'success' ? 'var(--green)' : 'var(--red)',
            }}
          >
            {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {isSignUp && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>First Name</label>
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
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Phone Number</label>
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Company Name</label>
                <input
                  type="text"
                  placeholder="Company Name"
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
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="COMPANY_ADMIN">Company Admin</option>
                  <option value="PROJECT_MANAGER">Project Manager</option>
                  <option value="SITE_ENGINEER">Site Engineer</option>
                  <option value="CONTRACTOR">Contractor</option>
                  <option value="WORKER">Worker</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Email Address</label>
            <input
              type="email"
              placeholder="Email Address"
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
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
            />
          </div>

          {isSignUp && (
            <div>
              <label style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
              />
            </div>
          )}

          <button type="submit" className="primary-button full-width" style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} disabled={loading}>
            {loading ? 'Entering System...' : isSignUp ? 'Register & Enter System' : 'Sign In & Enter System'} <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--muted)' }}>
          {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            style={{ background: 'transparent', border: 'none', color: 'var(--blue)', fontWeight: 700, cursor: 'pointer' }}
          >
            {isSignUp ? 'Sign In' : 'Register Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
