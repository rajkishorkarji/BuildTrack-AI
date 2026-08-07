import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import authService from '../services/authService';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState({ loading: true, success: false, message: '' });
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setStatus({ loading: false, success: false, message: 'Invalid or missing verification token.' });
      return;
    }

    authService.verifyEmail(token).then((res) => {
      if (res.success) {
        setStatus({ loading: false, success: true, message: res.message || 'Email verified successfully!' });
      } else {
        setStatus({ loading: false, success: false, message: res.message || 'Email verification failed or token expired.' });
      }
    });
  }, [token]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '20px' }}>
      <div className="panel" style={{ width: '100%', maxWidth: '440px', padding: '36px', borderRadius: '16px', textAlign: 'center', border: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>Email Verification</h2>

        {status.loading ? (
          <p style={{ color: 'var(--muted)' }}>Verifying your token with BuildTrack AI server...</p>
        ) : (
          <div>
            <p style={{ color: status.success ? 'var(--green, #22c55e)' : 'var(--red, #ef4444)', fontWeight: 600, marginBottom: '20px' }}>
              {status.message}
            </p>
            <Link to="/login" className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 600 }}>
              Go to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
