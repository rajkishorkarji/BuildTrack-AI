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

  const [invitation, setInvitation] =
    useState(null);

  const [loadingInvitation, setLoadingInvitation] =
    useState(true);

  const [invitationError, setInvitationError] =
    useState('');

  // ============================================================
  // PASSWORD STATE
  // ============================================================

  const [password, setPassword] =
    useState('');

  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // ============================================================
  // SUBMISSION STATE
  // ============================================================

  const [submitting, setSubmitting] =
    useState(false);

  const [submitError, setSubmitError] =
    useState('');

  const [activated, setActivated] =
    useState(false);

  // ============================================================
  // PASSWORD VALIDATION
  // ============================================================

  const passwordLongEnough =
    password.length >= MIN_PASSWORD_LENGTH;

  const passwordsMatch =
    password.length > 0 &&
    password === confirmPassword;

  const passwordValid =
    passwordLongEnough &&
    passwordsMatch;

  // ============================================================
  // LOAD INVITATION
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    async function loadInvitation() {
      if (!token) {
        setInvitationError(
          'This invitation link is missing a valid token.'
        );

        setLoadingInvitation(false);
        return;
      }

      try {
        setLoadingInvitation(true);
        setInvitationError('');

        /*
         * The invitation token comes from:
         *
         * /accept-invitation?token=...
         *
         * The backend validates the token and returns
         * the invitation information.
         */
        const response = await api.get(
  '/auth/invitations/' + token
);

        if (cancelled) {
          return;
        }

        const data =
          normalizeInvitationResponse(
            response
          );

        if (!data) {
          throw new Error(
            'Invitation information could not be loaded.'
          );
        }

        setInvitation(data);
      } catch (error) {
        if (cancelled) {
          return;
        }

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
        label: 'Passwords match',
        valid: passwordsMatch,
      },
    ],
    [
      passwordLongEnough,
      passwordsMatch,
    ]
  );

  // ============================================================
  // ACTIVATE ACCOUNT
  // ============================================================

  const handleActivateAccount = async (
    event
  ) => {
    event.preventDefault();

    setSubmitError('');

    if (!token) {
      setSubmitError(
        'Invalid invitation link.'
      );
      return;
    }

    if (!passwordLongEnough) {
      setSubmitError(
        'Password must contain at least 8 characters.'
      );
      return;
    }

    if (!passwordsMatch) {
      setSubmitError(
        'Passwords do not match.'
      );
      return;
    }

    try {
      setSubmitting(true);

      /*
       * Keep this request aligned with your existing
       * backend invitation acceptance endpoint.
       */
      await api.post(
        '/auth/invitations/accept',
        {
          token,
          password,
          confirmPassword,
        }
      );

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
  // LOADING
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
            gap: '12px',
          }}
        >
          <Loader2
            size={30}
            className="spin"
            style={{
              color: 'var(--blue)',
            }}
          />

          <div
            style={{
              fontWeight: 700,
              fontSize: '14px',
            }}
          >
            Validating your invitation...
          </div>

          <div
            style={{
              color: 'var(--muted)',
              fontSize: '12px',
            }}
          >
            Please wait while we verify your
            invitation.
          </div>
        </div>
      </AuthPageShell>
    );
  }

  // ============================================================
  // INVALID / EXPIRED INVITATION
  // ============================================================

  if (invitationError) {
    return (
      <AuthPageShell>
        <StatusCard
          icon={
            <AlertCircle
              size={30}
            />
          }
          title="Invitation unavailable"
          message={invitationError}
        >
          <div
            style={{
              marginTop: '20px',
              padding: '12px 14px',
              borderRadius: '10px',
              background:
                'rgba(245, 158, 11, 0.08)',
              border:
                '1px solid rgba(245, 158, 11, 0.18)',
              color: 'var(--muted)',
              fontSize: '12px',
              lineHeight: 1.6,
            }}
          >
            Ask your Company Admin to send
            you a new invitation.
          </div>

          <Link
            to="/login"
            className="primary-button"
            style={{
              marginTop: '20px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              width: '100%',
            }}
          >
            Go to Login
          </Link>
        </StatusCard>
      </AuthPageShell>
    );
  }

  // ============================================================
  // SUCCESS
  // ============================================================

  if (activated) {
    return (
      <AuthPageShell>
        <StatusCard
          success
          icon={
            <CheckCircle2
              size={34}
            />
          }
          title="Account activated"
          message="Your BuildTrack AI account is ready."
        >
          <div
            style={{
              marginTop: '20px',
              padding: '16px',
              borderRadius: '12px',
              background:
                'rgba(34, 197, 94, 0.08)',
              border:
                '1px solid rgba(34, 197, 94, 0.16)',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                color: 'var(--muted)',
              }}
            >
              Account
            </div>

            <div
              style={{
                marginTop: '4px',
                fontWeight: 800,
              }}
            >
              {invitation?.email}
            </div>

            <div
              style={{
                marginTop: '8px',
                fontSize: '12px',
                color: 'var(--muted)',
              }}
            >
              Role: {getRoleLabel(
                invitation?.role
              )}
            </div>
          </div>

          <Link
            to="/login"
            className="primary-button"
            style={{
              marginTop: '20px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              width: '100%',
            }}
          >
            Go to Login
          </Link>
        </StatusCard>
      </AuthPageShell>
    );
  }

  // ============================================================
  // INVITATION FORM
  // ============================================================

  return (
    <AuthPageShell>
      <div
        style={{
          marginBottom: '24px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '52px',
            height: '52px',
            margin: '0 auto 14px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background:
              'rgba(59, 130, 246, 0.10)',
            color: 'var(--blue)',
          }}
        >
          <ShieldCheck size={27} />
        </div>

        <div
          style={{
            fontSize: '13px',
            fontWeight: 800,
            color: 'var(--blue)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          BuildTrack AI
        </div>

        <h1
          style={{
            margin:
              '8px 0 0',
            fontSize: '25px',
            fontWeight: 850,
          }}
        >
          You're invited!
        </h1>

        <p
          style={{
            margin:
              '8px auto 0',
            maxWidth: '430px',
            color: 'var(--muted)',
            fontSize: '13px',
            lineHeight: 1.6,
          }}
        >
          Complete your account setup to
          join your company on BuildTrack AI.
        </p>
      </div>

      {/* ======================================================
          INVITATION INFORMATION
      ======================================================= */}

      <div
        className="panel"
        style={{
          padding: '18px',
          marginBottom: '18px',
        }}
      >
        <InfoRow
          icon={<UserRound size={16} />}
          label="Name"
          value={
            invitation?.fullName ||
            '—'
          }
        />

        <InfoRow
          icon={<Building2 size={16} />}
          label="Company"
          value={
            invitation?.companyName ||
            invitation?.company?.name ||
            '—'
          }
        />

        <InfoRow
          icon={
            <BriefcaseBusiness
              size={16}
            />
          }
          label="Role"
          value={getRoleLabel(
            invitation?.role
          )}
        />

        <InfoRow
          icon={<Mail size={16} />}
          label="Email"
          value={
            invitation?.email ||
            '—'
          }
          last
        />
      </div>

      {/* ======================================================
          PASSWORD FORM
      ======================================================= */}

      <form
        onSubmit={
          handleActivateAccount
        }
        className="panel"
        style={{
          padding: '20px',
        }}
      >
        <div
          style={{
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              fontSize: '16px',
              fontWeight: 800,
            }}
          >
            Create Password
          </div>

          <div
            style={{
              marginTop: '5px',
              color: 'var(--muted)',
              fontSize: '12px',
            }}
          >
            Create a secure password for
            your BuildTrack AI account.
          </div>
        </div>

        {/* Password */}

        <PasswordField
          label="Create Password"
          value={password}
          onChange={setPassword}
          visible={showPassword}
          onToggle={() =>
            setShowPassword(
              (current) => !current
            )
          }
          autoComplete="new-password"
        />

        {/* Confirm password */}

        <div
          style={{
            marginTop: '14px',
          }}
        >
          <PasswordField
            label="Confirm Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            visible={
              showConfirmPassword
            }
            onToggle={() =>
              setShowConfirmPassword(
                (current) => !current
              )
            }
            autoComplete="new-password"
          />
        </div>

        {/* Requirements */}

        <div
          style={{
            marginTop: '16px',
            padding: '13px 14px',
            borderRadius: '10px',
            background:
              'var(--panel-alt)',
            border:
              '1px solid var(--border)',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              color: 'var(--muted)',
              fontWeight: 700,
              marginBottom: '8px',
            }}
          >
            Password requirements
          </div>

          {passwordRequirements.map(
            (requirement) => (
              <div
                key={
                  requirement.label
                }
                style={{
                  display: 'flex',
                  alignItems:
                    'center',
                  gap: '7px',
                  marginTop: '6px',
                  fontSize: '12px',
                  color:
                    requirement.valid
                      ? 'var(--green)'
                      : 'var(--muted)',
                  fontWeight:
                    requirement.valid
                      ? 700
                      : 500,
                }}
              >
                <Check
                  size={14}
                />

                {requirement.label}
              </div>
            )
          )}
        </div>

        {/* Error */}

        {submitError && (
          <div
            role="alert"
            style={{
              marginTop: '14px',
              padding: '11px 13px',
              borderRadius: '9px',
              display: 'flex',
              alignItems:
                'flex-start',
              gap: '8px',
              background:
                'rgba(239, 68, 68, 0.08)',
              border:
                '1px solid rgba(239, 68, 68, 0.18)',
              color: 'var(--red)',
              fontSize: '12px',
              lineHeight: 1.5,
            }}
          >
            <AlertCircle
              size={15}
              style={{
                flexShrink: 0,
                marginTop: '1px',
              }}
            />

            <span>
              {submitError}
            </span>
          </div>
        )}

        {/* Activate */}

        <button
          type="submit"
          className="primary-button"
          disabled={
            submitting ||
            !passwordValid
          }
          style={{
            width: '100%',
            marginTop: '18px',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor:
              submitting ||
              !passwordValid
                ? 'not-allowed'
                : 'pointer',
            opacity:
              submitting ||
              !passwordValid
                ? 0.65
                : 1,
          }}
        >
          {submitting ? (
            <>
              <Loader2
                size={16}
                className="spin"
              />
              Activating Account...
            </>
          ) : (
            <>
              <ShieldCheck
                size={16}
              />
              Activate Account
            </>
          )}
        </button>
      </form>

      <div
        style={{
          marginTop: '16px',
          textAlign: 'center',
          color: 'var(--muted)',
          fontSize: '11px',
          lineHeight: 1.5,
        }}
      >
        By activating your account, you
        agree to use BuildTrack AI according
        to your organization's policies.
      </div>
    </AuthPageShell>
  );
}


// ============================================================
// AUTH PAGE SHELL
// ============================================================

function AuthPageShell({ children }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        background:
          'var(--background, #f8fafc)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '500px',
        }}
      >
        {children}
      </div>
    </div>
  );
}


// ============================================================
// INFO ROW
// ============================================================

function InfoRow({
  icon,
  label,
  value,
  last = false,
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding:
          last
            ? '12px 0 0'
            : '12px 0',
        borderBottom:
          last
            ? 'none'
            : '1px solid var(--border)',
      }}
    >
      <div
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '9px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'rgba(59, 130, 246, 0.08)',
          color: 'var(--blue)',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <div
        style={{
          minWidth: 0,
          flex: 1,
        }}
      >
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
            marginTop: '3px',
            fontSize: '13px',
            fontWeight: 700,
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

function PasswordField({
  label,
  value,
  onChange,
  visible,
  onToggle,
  autoComplete,
}) {
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

      <div
        style={{
          position: 'relative',
        }}
      >
        <LockKeyhole
          size={16}
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform:
              'translateY(-50%)',
            color: 'var(--muted)',
            pointerEvents: 'none',
          }}
        />

        <input
          type={
            visible
              ? 'text'
              : 'password'
          }
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          autoComplete={
            autoComplete
          }
          placeholder="Enter password"
          required
          minLength={
            MIN_PASSWORD_LENGTH
          }
          style={{
            width: '100%',
            padding:
              '11px 42px 11px 38px',
            borderRadius: '9px',
            border:
              '1px solid var(--border)',
            background:
              'var(--panel)',
            color: 'var(--text)',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={
            visible
              ? 'Hide password'
              : 'Show password'
          }
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform:
              'translateY(-50%)',
            width: '32px',
            height: '32px',
            border: 'none',
            background:
              'transparent',
            color: 'var(--muted)',
            display: 'flex',
            alignItems:
              'center',
            justifyContent:
              'center',
            cursor: 'pointer',
          }}
        >
          {visible ? (
            <EyeOff size={16} />
          ) : (
            <Eye size={16} />
          )}
        </button>
      </div>
    </div>
  );
}


// ============================================================
// STATUS CARD
// ============================================================

function StatusCard({
  icon,
  title,
  message,
  children,
  success = false,
}) {
  return (
    <div
      className="panel"
      style={{
        padding: '30px 24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '58px',
          height: '58px',
          margin: '0 auto 16px',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: success
            ? 'rgba(34, 197, 94, 0.10)'
            : 'rgba(239, 68, 68, 0.10)',
          color: success
            ? 'var(--green)'
            : 'var(--red)',
        }}
      >
        {icon}
      </div>

      <div
        style={{
          color: 'var(--blue)',
          fontSize: '12px',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        BuildTrack AI
      </div>

      <h1
        style={{
          margin:
            '8px 0 0',
          fontSize: '23px',
          fontWeight: 850,
        }}
      >
        {title}
      </h1>

      <p
        style={{
          margin:
            '8px 0 0',
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
