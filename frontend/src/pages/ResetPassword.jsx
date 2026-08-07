import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import authService from '../services/authService';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState({ loading: false, message: '', type: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus({ loading: false, message: 'Passwords do not match.', type: 'error' });
      return;
    }
    if (!token) {
      setStatus({ loading: false, message: 'Invalid or missing reset token.', type: 'error' });
      return;
    }

    setStatus({ loading: true, message: '', type: '' });
    const res = await authService.resetPassword(token, newPassword);
    setStatus({
      loading: false,
      message: res.message || (res.success ? 'Password reset successfully!' : 'Password reset failed.'),
      type: res.success ? 'success' : 'error',
    });

    if (res.success) {
      setTimeout(() => navigate('/login'), 2500);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '20px' }}>
      <div className="panel" style={{ width: '100%', maxWidth: '440px', padding: '36px', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', marginBottom: '8px', textAlign: 'center' }}>Reset Your Password</h2>
        <p style={{ fontSize: '14px', color: 'var(--muted)', textAlign: 'center', marginBottom: '20px' }}>
          Enter a new password for your account below.
        </p>

        {status.message && (
          <div style={{ padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', fontWeight: 600, background: status.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(36, 196, 107, 0.15)', color: status.type === 'error' ? 'var(--red)' : 'var(--green)' }}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>New Password</label>
            <input
              type="password"
              placeholder="Min 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Confirm New Password</label>
            <input
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
            />
          </div>

          <button type="submit" disabled={status.loading} style={{ padding: '12px', borderRadius: '8px', background: 'var(--primary)', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', marginTop: '6px' }}>
            {status.loading ? 'Updating Password...' : 'Reset Password'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/login" style={{ color: 'var(--primary)', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
