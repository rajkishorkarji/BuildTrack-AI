import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OAuthRedirect() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const email = searchParams.get('email');
    const role = searchParams.get('role') || 'COMPANY_ADMIN';
    const provider = searchParams.get('provider') || 'GOOGLE';

    if (accessToken && refreshToken) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      updateUser({
        email,
        role: role.toUpperCase(),
        roleLabel: role.replace(/_/g, ' '),
        fullName: email ? email.split('@')[0] : 'Google User',
        provider: provider,
      });

      navigate('/dashboard', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate, updateUser]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center', padding: '30px' }}>
        <h3 style={{ fontSize: '1.25rem', color: 'var(--primary)', marginBottom: '8px' }}>Processing OAuth2 Login...</h3>
        <p style={{ color: 'var(--muted)' }}>Securing access tokens and redirecting to your workspace.</p>
      </div>
    </div>
  );
}
