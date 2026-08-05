import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredPermission }) {
  const { user, hasPermission } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main, #0f172a)', marginBottom: '12px' }}>
          Access Restricted
        </h2>
        <p style={{ color: 'var(--text-muted, #64748b)', marginBottom: '20px' }}>
          Your current role (<strong>{user.roleLabel || user.role}</strong>) does not have permission (<code>{requiredPermission}</code>) to access this feature.
        </p>
        <button
          className="btn btn-primary"
          onClick={() => window.history.back()}
          style={{ padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return children;
}
