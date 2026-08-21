import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
  Building2,
  BriefcaseBusiness,
  AlertCircle,
  KeyRound,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

import api from '../services/api';

const MIN_PASSWORD_LENGTH = 8;

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

function normalizeInvitationResponse(response) {
  return (
    response?.data?.data ||
    response?.data ||
    response
  );
}

function getRoleLabel(role) {
  return String(role || 'User')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // ============================================================
  // INVITATION STATE
  // ============================================================

  const [invitation, setInvitation] = useState(null);
  const [loadingInvitation, setLoadingInvitation] = useState(true);
  const [invitationError, setInvitationError] = useState('');

  // ============================================================
  // PASSWORD STATE
  // ============================================================

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ============================================================
  // SUBMISSION STATE
  // ============================================================

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [activated, setActivated] = useState(false);

  // ============================================================
  // PASSWORD VALIDATION & STRENGTH
  // ============================================================

  const passwordLongEnough = password.length >= MIN_PASSWORD_LENGTH;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const passwordValid = passwordLongEnough && passwordsMatch;

  const passwordStrengthScore = useMemo(() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score += 33;
    if (password.length >= 12) score += 17;
    if (hasLetter) score += 25;
    if (hasNumber) score += 25;
    return Math.min(score, 100);
  }, [password, hasLetter, hasNumber]);

  const strengthColor =
    passwordStrengthScore >= 75
      ? 'var(--green, #22c55e)'
      : passwordStrengthScore >= 50
      ? 'var(--blue, #2563eb)'
      : 'var(--orange, #f59e0b)';

  const strengthLabel =
    passwordStrengthScore >= 75
      ? 'Strong'
      : passwordStrengthScore >= 50
      ? 'Medium'
      : 'Weak';

  // ============================================================
  // LOAD INVITATION
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    async function loadInvitation() {
      if (!token) {
        setInvitationError('This invitation link is missing a valid token.');
        setLoadingInvitation(false);
        return;
      }

      try {
        setLoadingInvitation(true);
        setInvitationError('');

        const response = await api.get('/auth/invitations/' + token);

        if (cancelled) return;

        const data = normalizeInvitationResponse(response);

        if (!data) {
          throw new Error('Invitation information could not be loaded.');
        }

        setInvitation(data);
      } catch (error) {
        if (cancelled) return;

        setInvitationError(
          getErrorMessage(
            error,
            'This invitation is invalid or has expired.'
          )
        );
      } finally {
        if (!cancelled) {
          setLoadingInvitation(false);
        }
      }
    }

    loadInvitation();

    return () => {
      cancelled = true;
    };
  }, [token]);

  // ============================================================
  // PASSWORD REQUIREMENTS
  // ============================================================

  const passwordRequirements = useMemo(
    () => [
      {
        label: 'At least 8 characters',
        valid: passwordLongEnough,
      },
      {
        label: 'Contains letters & numbers',
        valid: hasLetter && hasNumber,
      },
      {
        label: 'Passwords match',
        valid: passwordsMatch,
      },
    ],
    [passwordLongEnough, hasLetter, hasNumber, passwordsMatch]
  );

  // ============================================================
  // ACTIVATE ACCOUNT
  // ============================================================

  const handleActivateAccount = async (event) => {
    event.preventDefault();

    setSubmitError('');

    if (!token) {
      setSubmitError('Invalid invitation link.');
      return;
    }

    if (!passwordLongEnough) {
      setSubmitError('Password must contain at least 8 characters.');
      return;
    }

    if (!passwordsMatch) {
      setSubmitError('Passwords do not match.');
      return;
    }

    try {
      setSubmitting(true);

      await api.post('/auth/invitations/accept', {
        token,
        password,
        confirmPassword,
      });

      setActivated(true);
    } catch (error) {
      setSubmitError(
        getErrorMessage(
          error,
          'Unable to activate your account. Please try again.'
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // LOADING STATE
  // ============================================================

  if (loadingInvitation) {
    return (
      <AuthPageShell>
        <div
          style={{
            minHeight: '360px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '16px',
            textAlign: 'center',
            padding: '40px 20px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'rgba(37, 99, 235, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Loader2
              size={32}
              className="spin"
              style={{ color: 'var(--blue, #2563eb)' }}
            />
          </div>

          <div>
            <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text)' }}>
              Validating your invitation...
            </div>
            <div style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '4px' }}>
              Please wait while we verify your BuildTrack AI invite link.
            </div>
          </div>
        </div>
      </AuthPageShell>
    );
  }

  // ============================================================
  // INVALID / EXPIRED INVITATION STATE
  // ============================================================

  if (invitationError) {
    return (
      <AuthPageShell>
        <StatusCard
          icon={<AlertCircle size={32} />}
          title="Invitation Unavailable"
          message={invitationError}
        >
          <div
            style={{
              marginTop: '20px',
              padding: '14px 16px',
              borderRadius: '10px',
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              color: 'var(--muted)',
              fontSize: '13px',
              lineHeight: 1.6,
              textAlign: 'left',
            }}
          >
            <strong>What to do next:</strong>
            <p style={{ margin: '6px 0 0', fontSize: '12px' }}>
              Contact your Company Administrator to issue a new BuildTrack AI invitation link to your email.
            </p>
          </div>

          <Link
            to="/login"
            className="primary-button"
            style={{
              marginTop: '22px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              textDecoration: 'none',
              width: '100%',
              minHeight: '44px',
              fontWeight: 700,
            }}
          >
            Go to Login Page <ArrowRight size={16} />
          </Link>
        </StatusCard>
      </AuthPageShell>
    );
  }

  // ============================================================
  // SUCCESS STATE
  // ============================================================

  if (activated) {
    return (
      <AuthPageShell>
        <StatusCard
          success
          icon={<CheckCircle2 size={36} />}
          title="Account Activated!"
          message="Your BuildTrack AI account setup is complete. You can now sign in."
        >
          <div
            style={{
              marginTop: '20px',
              padding: '18px',
              borderRadius: '12px',
              background: 'rgba(34, 197, 94, 0.08)',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              textAlign: 'left',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                color: 'var(--muted)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Activated Account
            </div>

            <div
              style={{
                marginTop: '6px',
                fontWeight: 800,
                fontSize: '15px',
                color: 'var(--text)',
              }}
            >
              {invitation?.email}
            </div>

            <div
              style={{
                marginTop: '10px',
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  background: 'rgba(37, 99, 235, 0.1)',
                  color: 'var(--blue, #2563eb)',
                  fontWeight: 700,
                }}
              >
                Role: {getRoleLabel(invitation?.role)}
              </span>
              {invitation?.companyName && (
                <span
                  style={{
                    fontSize: '11px',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    background: 'var(--panel-alt)',
                    color: 'var(--text)',
                    fontWeight: 600,
                  }}
                >
                  {invitation.companyName}
                </span>
              )}
            </div>
          </div>

          <Link
            to="/login"
            className="primary-button"
            style={{
              marginTop: '22px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              textDecoration: 'none',
              width: '100%',
              minHeight: '44px',
              fontWeight: 700,
            }}
          >
            Sign In to BuildTrack AI <ArrowRight size={16} />
          </Link>
        </StatusCard>
      </AuthPageShell>
    );
  }

  // ============================================================
  // INVITATION FORM & PASSWORD CREATION
  // ============================================================

  return (
    <AuthPageShell>
      {/* Header Banner */}
      <div
        style={{
          marginBottom: '22px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '20px',
            background: 'rgba(37, 99, 235, 0.08)',
            border: '1px solid rgba(37, 99, 235, 0.18)',
            color: 'var(--blue, #2563eb)',
            fontSize: '12px',
            fontWeight: 700,
            marginBottom: '12px',
          }}
        >
          <Sparkles size={14} /> Official Account Invitation
        </div>

        <h1
          style={{
            margin: '0 0 6px',
            fontSize: '24px',
            fontWeight: 850,
            color: 'var(--text)',
          }}
        >
          Set Up Your Password
        </h1>

        <p
          style={{
            margin: '0 auto',
            maxWidth: '430px',
            color: 'var(--muted)',
            fontSize: '13px',
            lineHeight: 1.5,
          }}
        >
          Welcome aboard! Set up your password to activate your account on BuildTrack AI.
        </p>
      </div>

      {/* Invitation Info Card */}
      <div
        className="panel"
        style={{
          padding: '18px 20px',
          marginBottom: '18px',
          borderRadius: '14px',
          border: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            fontSize: '11px',
            fontWeight: 800,
            color: 'var(--muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '12px',
          }}
        >
          Invitation Details
        </div>

        <InfoRow
          icon={<UserRound size={16} />}
          label="Full Name"
          value={invitation?.fullName || '—'}
        />

        <InfoRow
          icon={<Building2 size={16} />}
          label="Company"
          value={invitation?.companyName || invitation?.company?.name || '—'}
        />

        <InfoRow
          icon={<BriefcaseBusiness size={16} />}
          label="Assigned Role"
          value={getRoleLabel(invitation?.role)}
        />

        <InfoRow
          icon={<Mail size={16} />}
          label="Email Address"
          value={invitation?.email || '—'}
          last
        />
      </div>

      {/* Create Password Form */}
      <form
        onSubmit={handleActivateAccount}
        className="panel"
        style={{
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow)',
        }}
      >
        <div style={{ marginBottom: '18px' }}>
          <div
            style={{
              fontSize: '16px',
              fontWeight: 800,
              color: 'var(--text)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <KeyRound size={18} style={{ color: 'var(--blue, #2563eb)' }} /> Create Account Password
          </div>

          <div
            style={{
              marginTop: '4px',
              color: 'var(--muted)',
              fontSize: '12px',
            }}
          >
            Choose a strong password to secure your BuildTrack AI profile.
          </div>
        </div>

        {/* Password input */}
        <PasswordField
          label="New Password"
          value={password}
          onChange={setPassword}
          visible={showPassword}
          onToggle={() => setShowPassword((curr) => !curr)}
          autoComplete="new-password"
        />

        {/* Password Strength Meter */}
        {password.length > 0 && (
          <div style={{ marginTop: '10px', marginBottom: '14px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--muted)',
                marginBottom: '4px',
              }}
            >
              <span>Password Strength</span>
              <span style={{ color: strengthColor }}>{strengthLabel}</span>
            </div>
            <div
              style={{
                height: '5px',
                width: '100%',
                borderRadius: '3px',
                background: 'var(--panel-alt, #e2e8f0)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${passwordStrengthScore}%`,
                  background: strengthColor,
                  transition: 'width 0.3s ease, background 0.3s ease',
                }}
              />
            </div>
          </div>
        )}

        {/* Confirm password input */}
        <div style={{ marginTop: '14px' }}>
          <PasswordField
            label="Confirm Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            visible={showConfirmPassword}
            onToggle={() => setShowConfirmPassword((curr) => !curr)}
            autoComplete="new-password"
          />
        </div>

        {/* Requirements checklist */}
        <div
          style={{
            marginTop: '16px',
            padding: '12px 14px',
            borderRadius: '10px',
            background: 'var(--panel-alt)',
            border: '1px solid var(--border)',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              color: 'var(--muted)',
              fontWeight: 700,
              marginBottom: '6px',
            }}
          >
            Password requirements:
          </div>

          {passwordRequirements.map((req) => (
            <div
              key={req.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '5px',
                fontSize: '12px',
                color: req.valid ? 'var(--green, #22c55e)' : 'var(--muted)',
                fontWeight: req.valid ? 700 : 500,
              }}
            >
              <Check size={14} style={{ color: req.valid ? 'var(--green, #22c55e)' : 'var(--border)' }} />
              {req.label}
            </div>
          ))}
        </div>

        {/* Submission Error Banner */}
        {submitError && (
          <div
            role="alert"
            style={{
              marginTop: '16px',
              padding: '12px 14px',
              borderRadius: '9px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: 'var(--red, #ef4444)',
              fontSize: '13px',
              lineHeight: 1.5,
              fontWeight: 600,
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{submitError}</span>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          className="primary-button"
          disabled={submitting || !passwordValid}
          style={{
            width: '100%',
            marginTop: '20px',
            minHeight: '46px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontWeight: 700,
            fontSize: '14px',
            cursor: submitting || !passwordValid ? 'not-allowed' : 'pointer',
            opacity: submitting || !passwordValid ? 0.65 : 1,
          }}
        >
          {submitting ? (
            <>
              <Loader2 size={18} className="spin" />
              Activating Account...
            </>
          ) : (
            <>
              <ShieldCheck size={18} />
              Activate Account & Password
            </>
          )}
        </button>
      </form>

      <div
        style={{
          marginTop: '18px',
          textAlign: 'center',
          color: 'var(--muted)',
          fontSize: '11px',
          lineHeight: 1.5,
        }}
      >
        By activating your account, you agree to access BuildTrack AI in accordance with your company's security policies.
      </div>
    </AuthPageShell>
  );
}

// ============================================================
// AUTH PAGE SHELL WITH PLATFORM LOGO
// ============================================================

function AuthPageShell({ children }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        background: 'var(--bg, #f8fafc)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
        }}
      >
        {/* PLATFORM BRAND LOGO */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '24px',
          }}
        >
          <img
            src="/logo-brand.svg"
            onError={(e) => {
              // Fallback to /logo.svg if /logo-brand.svg isn't available
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/logo.svg';
            }}
            alt="BuildTrack AI"
            style={{
              height: '42px',
              maxWidth: '220px',
              objectFit: 'contain',
              display: 'inline-block',
            }}
          />
        </div>

        {children}
      </div>
    </div>
  );
}

// ============================================================
// INFO ROW
// ============================================================

function InfoRow({ icon, label, value, last = false }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: last ? '10px 0 0' : '10px 0',
        borderBottom: last ? 'none' : '1px solid var(--border)',
      }}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(59, 130, 246, 0.08)',
          color: 'var(--blue, #2563eb)',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontSize: '10px',
            color: 'var(--muted)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {label}
        </div>

        <div
          style={{
            marginTop: '2px',
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--text)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={value}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PASSWORD FIELD
// ============================================================

function PasswordField({ label, value, onChange, visible, onToggle, autoComplete }) {
  return (
    <div>
      <label
        style={{
          display: 'block',
          marginBottom: '6px',
          fontSize: '12px',
          color: 'var(--muted)',
          fontWeight: 700,
        }}
      >
        {label}
      </label>

      <div style={{ position: 'relative' }}>
        <LockKeyhole
          size={16}
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--muted)',
            pointerEvents: 'none',
          }}
        />

        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          placeholder="Enter password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          style={{
            width: '100%',
            padding: '11px 42px 11px 38px',
            borderRadius: '9px',
            border: '1px solid var(--border)',
            background: 'var(--panel)',
            color: 'var(--text)',
            outline: 'none',
            boxSizing: 'border-box',
            fontSize: '14px',
          }}
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? 'Hide password' : 'Show password'}
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '32px',
            height: '32px',
            border: 'none',
            background: 'transparent',
            color: 'var(--muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// STATUS CARD
// ============================================================

function StatusCard({ icon, title, message, children, success = false }) {
  return (
    <div
      className="panel"
      style={{
        padding: '32px 24px',
        textAlign: 'center',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
      }}
    >
      <div
        style={{
          width: '60px',
          height: '60px',
          margin: '0 auto 16px',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: success ? 'rgba(34, 197, 94, 0.10)' : 'rgba(239, 68, 68, 0.10)',
          color: success ? 'var(--green, #22c55e)' : 'var(--red, #ef4444)',
        }}
      >
        {icon}
      </div>

      <h1
        style={{
          margin: '0 0 6px',
          fontSize: '22px',
          fontWeight: 850,
          color: 'var(--text)',
        }}
      >
        {title}
      </h1>

      <p
        style={{
          margin: '0',
          color: 'var(--muted)',
          fontSize: '13px',
          lineHeight: 1.6,
        }}
      >
        {message}
      </p>

      {children}
    </div>
  );
}
