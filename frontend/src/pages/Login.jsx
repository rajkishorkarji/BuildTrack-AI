import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, X } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import authService from '../services/authService';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme } = useTheme();

  // ============================================================
  // STATE
  // ============================================================

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [forgotEmail, setForgotEmail] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [googleCheckLoading, setGoogleCheckLoading] = useState(false);

  const [message, setMessage] = useState({
    text: '',
    type: '',
  });

  const [forgotMessage, setForgotMessage] = useState({
    text: '',
    type: '',
  });

  // ============================================================
  // FORM CHANGE
  // ============================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    // Clear old error when user starts typing
    if (message.text) {
      setMessage({
        text: '',
        type: '',
      });
    }
  };

  // ============================================================
  // LOGIN
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    // ----------------------------------------------------------
    // Validation
    // ----------------------------------------------------------

    if (!email) {
      setMessage({
        text: 'Please enter your email address.',
        type: 'error',
      });
      return;
    }

    if (!password) {
      setMessage({
        text: 'Please enter your password.',
        type: 'error',
      });
      return;
    }

    setLoading(true);

    setMessage({
      text: '',
      type: '',
    });

    try {
      // --------------------------------------------------------
      // Backend is the ONLY authentication source.
      // --------------------------------------------------------

      const apiUser = await authService.login(
        email,
        password
      );

      if (!apiUser) {
        throw new Error('Authentication failed.');
      }

      // Store authenticated user through AuthContext
      login(apiUser);

      // --------------------------------------------------------
      // Redirect after successful login
      // --------------------------------------------------------

      navigate('/dashboard', {
        replace: true,
      });

    } catch (error) {
      console.error('Login failed:', error);

      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error;

      let errorMessage =
        backendMessage ||
        error?.message ||
        'Invalid email or password.';

      // Handle common HTTP errors more professionally
      if (error?.response?.status === 401) {
        errorMessage =
          'Invalid email or password.';
      }

      if (error?.response?.status === 403) {
        errorMessage =
          'Your account does not have permission to access BuildTrack AI.';
      }

      if (error?.response?.status === 404) {
        errorMessage =
          'Authentication service is unavailable.';
      }

      if (error?.response?.status >= 500) {
        errorMessage =
          'Server error. Please try again after the backend is running.';
      }

      setMessage({
        text: errorMessage,
        type: 'error',
      });

    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // GOOGLE LOGIN — GATED
  // ============================================================
  // GOOGLE LOGIN & QUERY ERROR HANDLING
  // ============================================================

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get('error');
    if (errorParam) {
      setMessage({
        text: decodeURIComponent(errorParam).replace(/^"|"$/g, '') || 'Google authentication failed.',
        type: 'error',
      });
    }
  }, []);

  const handleGoogleLoginGated = async () => {
    const email = formData.email.trim().toLowerCase();

    if (!email) {
      handleGoogleLogin();
      return;
    }

    setGoogleCheckLoading(true);

    setMessage({
      text: '',
      type: '',
    });

    try {
      const result = await authService.checkGoogleEligibility(email);

      if (!result?.eligible) {
        setMessage({
          text:
            result?.reason ||
            'Your account is not eligible for Google login. Please sign in with your password.',
          type: 'error',
        });
        return;
      }

      handleGoogleLogin();

    } catch (error) {
      console.error('Google eligibility check failed:', error);
      handleGoogleLogin();
    } finally {
      setGoogleCheckLoading(false);
    }
  };

  // ============================================================
  // GOOGLE LOGIN (original — called only after eligibility is confirmed)
  // ============================================================

  const handleGoogleLogin = () => {
    try {
      setLoading(true);

      setMessage({
        text: '',
        type: '',
      });

      const googleAuthUrl =
        authService.getGoogleLoginUrl();

      window.location.href = googleAuthUrl;

    } catch (error) {
      console.error(
        'Google authentication error:',
        error
      );

      setLoading(false);

      setMessage({
        text:
          error?.message ||
          'Google authentication could not be started.',
        type: 'error',
      });
    }
  };

  // ============================================================
  // FORGOT PASSWORD
  // ============================================================

  const handleForgotPasswordSubmit = async (event) => {
    event.preventDefault();

    const email = forgotEmail.trim().toLowerCase();

    if (!email) {
      setForgotMessage({
        text: 'Please enter your email address.',
        type: 'error',
      });
      return;
    }

    setForgotLoading(true);

    setForgotMessage({
      text: '',
      type: '',
    });

    try {
      const response =
        await authService.forgotPassword(email);

      setForgotMessage({
        text:
          response?.message ||
          'If an account exists for this email, a password reset link has been sent.',
        type: 'success',
      });

    } catch (error) {
      console.error(
        'Forgot password error:',
        error
      );

      /*
       * Keep the response generic.
       *
       * This prevents revealing whether
       * a particular email exists.
       */

      setForgotMessage({
        text:
          'If an account exists for this email, a password reset link has been sent.',
        type: 'success',
      });

    } finally {
      setForgotLoading(false);
    }
  };

  // ============================================================
  // CLOSE FORGOT MODAL
  // ============================================================

  const closeForgotModal = () => {
    setShowForgotModal(false);

    setForgotEmail('');

    setForgotMessage({
      text: '',
      type: '',
    });
  };

  // ============================================================
  // MESSAGE STYLE
  // ============================================================

  const messageStyle = (type) => ({
    padding: '11px 14px',
    borderRadius: '9px',
    marginBottom: '16px',
    fontSize: '13px',
    fontWeight: 600,
    lineHeight: 1.4,
    background:
      type === 'error'
        ? 'rgba(239, 68, 68, 0.12)'
        : 'rgba(34, 197, 94, 0.12)',
    color:
      type === 'error'
        ? 'var(--red)'
        : 'var(--green)',
    border:
      type === 'error'
        ? '1px solid rgba(239, 68, 68, 0.25)'
        : '1px solid rgba(34, 197, 94, 0.25)',
  });

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      className="login-page"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        padding: '20px',
      }}
    >

      {/* ======================================================
          LOGIN CARD
      ======================================================= */}

      <div
        className="panel login-card"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '36px',
          borderRadius: '18px',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow)',
        }}
      >

        {/* ====================================================
            LOGO
        ===================================================== */}

        <div
          style={{
            textAlign: 'center',
            marginBottom: '28px',
          }}
        >
          <img
            src={
              theme === 'dark'
                ? '/logo-brand.svg'
                : '/logo-brand-light.svg'
            }
            alt="BuildTrack AI"
            className="login-brand-logo"
          />

          <p
            style={{
              marginTop: '10px',
              marginBottom: 0,
              fontSize: '13px',
              color: 'var(--muted)',
            }}
          >
            Construction Workforce & Project Management
          </p>
        </div>

        {/* ====================================================
            TITLE
        ===================================================== */}

        <div
          style={{
            marginBottom: '22px',
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: 800,
              color: 'var(--text)',
            }}
          >
            Welcome back
          </h1>

          <p
            style={{
              marginTop: '6px',
              marginBottom: 0,
              fontSize: '13px',
              color: 'var(--muted)',
            }}
          >
            Sign in to your BuildTrack AI account.
          </p>
        </div>

        {/* ====================================================
            LOGIN MESSAGE
        ===================================================== */}

        {message.text && (
          <div style={messageStyle(message.type)}>
            {message.text}
          </div>
        )}

        {/* ====================================================
            LOGIN FORM
        ===================================================== */}

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >

          {/* ==================================================
              EMAIL
          =================================================== */}

          <div>
            <label
              htmlFor="login-email"
              style={{
                fontSize: '12px',
                color: 'var(--muted)',
                fontWeight: 700,
                display: 'block',
                marginBottom: '6px',
              }}
            >
              Email Address
            </label>

            <input
              id="login-email"
              name="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              autoComplete="username"
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '9px',
                border: '1px solid var(--border)',
                background: 'var(--panel)',
                color: 'var(--text)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* ==================================================
              PASSWORD
          =================================================== */}

          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '6px',
              }}
            >
              <label
                htmlFor="login-password"
                style={{
                  fontSize: '12px',
                  color: 'var(--muted)',
                  fontWeight: 700,
                }}
              >
                Password
              </label>

              <button
                type="button"
                onClick={() =>
                  setShowForgotModal(true)
                }
                disabled={loading}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--primary)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Forgot password?
              </button>
            </div>

            <div
              style={{
                position: 'relative',
              }}
            >
              <input
                id="login-password"
                name="password"
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '11px 44px 11px 14px',
                  borderRadius: '9px',
                  border: '1px solid var(--border)',
                  background: 'var(--panel)',
                  color: 'var(--text)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (previous) => !previous
                  )
                }
                aria-label={
                  showPassword
                    ? 'Hide password'
                    : 'Show password'
                }
                disabled={loading}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                }}
              >
                {showPassword ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}
              </button>
            </div>
          </div>

          {/* ==================================================
              SIGN IN BUTTON
          =================================================== */}

          <button
            type="submit"
            className="primary-button full-width"
            disabled={loading}
            style={{
              marginTop: '4px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: loading
                ? 'not-allowed'
                : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? 'Signing in...'
              : 'Sign In'}

            {!loading && (
              <ArrowRight size={17} />
            )}
          </button>

          {/* ==================================================
              GOOGLE LOGIN
          =================================================== */}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              margin: '4px 0',
            }}
          >
            <div
              style={{
                flex: 1,
                height: '1px',
                background: 'var(--border)',
              }}
            />

            <span
              style={{
                fontSize: '11px',
                color: 'var(--muted)',
                fontWeight: 600,
              }}
            >
              OR
            </span>

            <div
              style={{
                flex: 1,
                height: '1px',
                background: 'var(--border)',
              }}
            />
          </div>

          <button
            type="button"
            onClick={handleGoogleLoginGated}
            disabled={loading || googleCheckLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              width: '100%',
              minHeight: '44px',
              padding: '10px 14px',
              borderRadius: '9px',
              border: '1px solid var(--border)',
              background: '#ffffff',
              color: '#1e293b',
              fontWeight: 700,
              fontSize: '13px',
              cursor: loading || googleCheckLoading
                ? 'not-allowed'
                : 'pointer',
              opacity: loading || googleCheckLoading ? 0.7 : 1,
              boxSizing: 'border-box',
            }}
          >
            {/* Google icon */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />

              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />

              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />

              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>

            {googleCheckLoading ? 'Verifying...' : 'Continue with Google'}
          </button>

        </form>

        {/* ====================================================
            INFORMATION
        ===================================================== */}

        <div
          style={{
            marginTop: '22px',
            padding: '12px 14px',
            borderRadius: '9px',
            background: 'var(--panel-soft)',
            border: '1px solid var(--border)',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '11px',
              lineHeight: 1.5,
              color: 'var(--muted)',
            }}
          >
            New users cannot create accounts directly.
            Accounts are created through the
            BuildTrack AI invitation process.
          </p>
        </div>

      </div>

      {/* ======================================================
          FORGOT PASSWORD MODAL
      ======================================================= */}

      {showForgotModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 1000,
          }}
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeForgotModal();
            }
          }}
        >

          <div
            className="panel"
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '26px',
              borderRadius: '14px',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow)',
            }}
          >

            {/* Modal header */}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px',
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: 800,
                  color: 'var(--text)',
                }}
              >
                Forgot Password
              </h3>

              <button
                type="button"
                onClick={closeForgotModal}
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '7px',
                  border: '1px solid var(--border)',
                  background: 'var(--panel-soft)',
                  color: 'var(--muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={16} />
              </button>
            </div>

            <p
              style={{
                fontSize: '13px',
                color: 'var(--muted)',
                lineHeight: 1.5,
                marginBottom: '18px',
              }}
            >
              Enter your registered email address.
              If an account exists, we will send
              a secure password reset link.
            </p>

            {/* Forgot password message */}

            {forgotMessage.text && (
              <div
                style={messageStyle(
                  forgotMessage.type
                )}
              >
                {forgotMessage.text}
              </div>
            )}

            <form
              onSubmit={
                handleForgotPasswordSubmit
              }
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >

              <div>
                <label
                  htmlFor="forgot-email"
                  style={{
                    fontSize: '12px',
                    color: 'var(--muted)',
                    fontWeight: 700,
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  Email Address
                </label>

                <input
                  id="forgot-email"
                  type="email"
                  placeholder="Enter email address"
                  value={forgotEmail}
                  onChange={(event) => {
                    setForgotEmail(
                      event.target.value
                    );

                    if (
                      forgotMessage.text
                    ) {
                      setForgotMessage({
                        text: '',
                        type: '',
                      });
                    }
                  }}
                  autoComplete="email"
                  required
                  disabled={forgotLoading}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '9px',
                    border:
                      '1px solid var(--border)',
                    background: 'var(--panel)',
                    color: 'var(--text)',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '8px',
                  marginTop: '4px',
                }}
              >

                <button
                  type="button"
                  onClick={closeForgotModal}
                  disabled={forgotLoading}
                  style={{
                    padding: '9px 14px',
                    borderRadius: '8px',
                    border:
                      '1px solid var(--border)',
                    background:
                      'var(--panel-soft)',
                    color: 'var(--text)',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  style={{
                    padding: '9px 14px',
                    borderRadius: '8px',
                    background:
                      'var(--primary)',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 700,
                    cursor: forgotLoading
                      ? 'not-allowed'
                      : 'pointer',
                    opacity: forgotLoading
                      ? 0.7
                      : 1,
                  }}
                >
                  {forgotLoading
                    ? 'Sending...'
                    : 'Send Reset Link'}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}