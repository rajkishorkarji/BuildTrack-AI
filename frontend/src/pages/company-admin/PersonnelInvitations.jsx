
import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock3,
  Mail,
  RefreshCw,
  Send,
  UserPlus,
  XCircle,
} from 'lucide-react';

import companyAdminService from '../../services/companyAdminService';

const ROLES = [
  {
    value: 'PROJECT_MANAGER',
    label: 'Project Manager',
  },
  {
    value: 'SITE_ENGINEER',
    label: 'Site Engineer',
  },
  {
    value: 'CONTRACTOR',
    label: 'Contractor',
  },
  {
    value: 'WORKER',
    label: 'Worker',
  },
];

const INITIAL_FORM = {
  fullName: '',
  email: '',
  role: 'PROJECT_MANAGER',
};


// ============================================================
// HELPERS
// ============================================================

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

function getRoleLabel(role) {
  const found = ROLES.find(
    (item) => item.value === role
  );

  return (
    found?.label ||
    String(role || '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      )
  );
}

function isExpired(invitation) {
  if (!invitation?.expiresAt) {
    return false;
  }

  return (
    new Date(invitation.expiresAt).getTime() <
    Date.now()
  );
}

function formatDate(date) {
  if (!date) {
    return '—';
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return '—';
  }

  return parsed.toLocaleString();
}


// ============================================================
// COMPONENT
// ============================================================

export default function PersonnelInvitations() {
  const [form, setForm] =
    useState(INITIAL_FORM);

  const [invitations, setInvitations] =
    useState([]);

  const [message, setMessage] =
    useState('');

  const [error, setError] =
    useState('');

  const [busy, setBusy] =
    useState(false);

  const [loadingInvitations, setLoadingInvitations] =
    useState(true);

  const [resendingId, setResendingId] =
    useState(null);


  // ============================================================
  // LOAD INVITATIONS
  // ============================================================

  const loadInvitations = async () => {
    try {
      setLoadingInvitations(true);
      setError('');

      const response =
        await companyAdminService
          .getPersonnelInvitations();

      const data =
        response?.data?.data ??
        response?.data ??
        response;

      setInvitations(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        'Failed to load personnel invitations:',
        err
      );

      setError(
        getErrorMessage(
          err,
          'Unable to load personnel invitations.'
        )
      );
    } finally {
      setLoadingInvitations(false);
    }
  };


  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadInvitations();
  }, []);


  // ============================================================
  // FORM CHANGE
  // ============================================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage('');
    setError('');
  };


  // ============================================================
  // SEND INVITATION
  // ============================================================

  const submit = async (event) => {
    event.preventDefault();

    setMessage('');
    setError('');

    const fullName =
      form.fullName.trim();

    const email =
      form.email.trim().toLowerCase();

    if (!fullName) {
      setError(
        'Please enter the personnel name.'
      );
      return;
    }

    if (!email) {
      setError(
        'Please enter an email address.'
      );
      return;
    }

    if (!form.role) {
      setError(
        'Please select a role.'
      );
      return;
    }

    try {
      setBusy(true);

      const response =
        await companyAdminService
          .invitePersonnel({
            fullName,
            email,
            role: form.role,
          });

      const result =
        response?.data?.data ??
        response?.data ??
        response;

      const wasResent =
        result?.resent === true;

      setMessage(
        wasResent
          ? `Invitation resent to ${email}.`
          : `Invitation sent to ${email}.`
      );

      setForm(INITIAL_FORM);

      await loadInvitations();
    } catch (err) {
      console.error(
        'Failed to send personnel invitation:',
        err
      );

      setError(
        getErrorMessage(
          err,
          'Unable to send invitation.'
        )
      );
    } finally {
      setBusy(false);
    }
  };


  // ============================================================
  // RESEND INVITATION
  // ============================================================

  const handleResend = async (
    invitation
  ) => {
    if (!invitation?.email) {
      return;
    }

    try {
      setResendingId(
        invitation.id
      );

      setMessage('');
      setError('');

      await companyAdminService
        .invitePersonnel({
          fullName:
            invitation.fullName,
          email:
            invitation.email,
          role:
            invitation.role,
        });

      setMessage(
        `Invitation resent to ${invitation.email}.`
      );

      await loadInvitations();
    } catch (err) {
      console.error(
        'Failed to resend invitation:',
        err
      );

      setError(
        getErrorMessage(
          err,
          'Unable to resend invitation.'
        )
      );
    } finally {
      setResendingId(null);
    }
  };


  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      style={{
        paddingBottom: '32px',
      }}
    >

      {/* ======================================================
          PAGE HEADER
      ======================================================= */}

      <div
        style={{
          marginBottom: '20px',
        }}
      >
        <div
          className="eyebrow"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--blue)',
            fontWeight: 700,
          }}
        >
          <UserPlus size={15} />
          PERSONNEL
        </div>

        <h1
          style={{
            margin:
              '6px 0 0',
            fontSize: '26px',
            fontWeight: 800,
          }}
        >
          Invite Personnel
        </h1>

        <p
          style={{
            margin:
              '7px 0 0',
            color: 'var(--muted)',
            fontSize: '13px',
            lineHeight: 1.6,
          }}
        >
          Invite project managers, site engineers,
          contractors, and workers to your company.
          They will receive an email invitation and
          create their password after accepting it.
        </p>
      </div>


      {/* ======================================================
          INVITATION FORM
      ======================================================= */}

      <div
        className="panel"
        style={{
          padding: '22px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '18px',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background:
                'rgba(59, 130, 246, 0.10)',
              color: 'var(--blue)',
            }}
          >
            <Mail size={18} />
          </div>

          <div>
            <h2
              style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: 800,
              }}
            >
              Send Invitation
            </h2>

            <p
              style={{
                margin:
                  '4px 0 0',
                color: 'var(--muted)',
                fontSize: '11px',
              }}
            >
              The invitation is valid for 24 hours.
            </p>
          </div>
        </div>


        <form
          onSubmit={submit}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '14px',
            }}
          >

            {/* Full Name */}

            <div>
              <label
                htmlFor="personnel-full-name"
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--muted)',
                }}
              >
                Full Name
              </label>

              <input
                id="personnel-full-name"
                name="fullName"
                type="text"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Enter full name"
                autoComplete="name"
                required
                disabled={busy}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border:
                    '1px solid var(--border)',
                  background:
                    'var(--panel)',
                  color: 'var(--text)',
                }}
              />
            </div>


            {/* Email */}

            <div>
              <label
                htmlFor="personnel-email"
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--muted)',
                }}
              >
                Email Address
              </label>

              <input
                id="personnel-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="person@example.com"
                autoComplete="email"
                required
                disabled={busy}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border:
                    '1px solid var(--border)',
                  background:
                    'var(--panel)',
                  color: 'var(--text)',
                }}
              />
            </div>


            {/* Role */}

            <div>
              <label
                htmlFor="personnel-role"
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--muted)',
                }}
              >
                Role
              </label>

              <select
                id="personnel-role"
                name="role"
                value={form.role}
                onChange={handleChange}
                disabled={busy}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border:
                    '1px solid var(--border)',
                  background:
                    'var(--panel)',
                  color: 'var(--text)',
                }}
              >
                {ROLES.map(
                  (role) => (
                    <option
                      key={role.value}
                      value={role.value}
                    >
                      {role.label}
                    </option>
                  )
                )}
              </select>
            </div>

          </div>


          {/* Messages */}

          {message && (
            <div
              role="status"
              style={{
                marginTop: '14px',
                padding:
                  '10px 12px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background:
                  'rgba(34, 197, 94, 0.08)',
                border:
                  '1px solid rgba(34, 197, 94, 0.16)',
                color: 'var(--green)',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              <CheckCircle2 size={15} />
              {message}
            </div>
          )}

          {error && (
            <div
              role="alert"
              style={{
                marginTop: '14px',
                padding:
                  '10px 12px',
                borderRadius: '8px',
                background:
                  'rgba(239, 68, 68, 0.08)',
                border:
                  '1px solid rgba(239, 68, 68, 0.16)',
                color: 'var(--red)',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              {error}
            </div>
          )}


          {/* Submit */}

          <div
            style={{
              marginTop: '18px',
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <button
              type="submit"
              className="primary-button"
              disabled={busy}
              style={{
                minWidth: '160px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '7px',
                opacity:
                  busy ? 0.65 : 1,
              }}
            >
              {busy ? (
                <>
                  <RefreshCw
                    size={15}
                    className="spin"
                  />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={15} />
                  Send Invitation
                </>
              )}
            </button>
          </div>
        </form>
      </div>


      {/* ======================================================
          INVITATION HISTORY
      ======================================================= */}

      <div
        className="panel"
        style={{
          marginTop: '20px',
          padding: 0,
          overflow: 'hidden',
        }}
      >

        {/* Header */}

        <div
          style={{
            padding:
              '18px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent:
              'space-between',
            gap: '12px',
            borderBottom:
              '1px solid var(--border)',
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: 800,
              }}
            >
              Invitation History
            </h2>

            <p
              style={{
                margin:
                  '4px 0 0',
                color: 'var(--muted)',
                fontSize: '11px',
              }}
            >
              Track invitations sent to your
              company personnel.
            </p>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={
              loadInvitations
            }
            disabled={
              loadingInvitations
            }
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding:
                '7px 10px',
              fontSize: '11px',
            }}
          >
            <RefreshCw
              size={13}
              className={
                loadingInvitations
                  ? 'spin'
                  : ''
              }
            />
            Refresh
          </button>
        </div>


        {/* Loading */}

        {loadingInvitations && (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: 'var(--muted)',
              fontSize: '12px',
            }}
          >
            Loading invitations...
          </div>
        )}


        {/* Empty */}

        {!loadingInvitations &&
          invitations.length === 0 && (
            <div
              style={{
                padding:
                  '45px 20px',
                textAlign:
                  'center',
              }}
            >
              <Mail
                size={30}
                style={{
                  color:
                    'var(--muted)',
                }}
              />

              <div
                style={{
                  marginTop:
                    '10px',
                  fontSize:
                    '13px',
                  fontWeight:
                    700,
                }}
              >
                No invitations yet
              </div>

              <div
                style={{
                  marginTop:
                    '5px',
                  color:
                    'var(--muted)',
                  fontSize:
                    '11px',
                }}
              >
                Send your first personnel
                invitation using the form above.
              </div>
            </div>
          )}


        {/* Invitation Table */}

        {!loadingInvitations &&
          invitations.length > 0 && (
            <div
              style={{
                overflowX:
                  'auto',
              }}
            >
              <table
                style={{
                  width: '100%',
                  minWidth:
                    '760px',
                  borderCollapse:
                    'collapse',
                  fontSize:
                    '12px',
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom:
                        '1px solid var(--border)',
                    }}
                  >
                    <th
                      style={{
                        padding:
                          '13px 20px',
                        textAlign:
                          'left',
                        fontWeight:
                          700,
                      }}
                    >
                      Personnel
                    </th>

                    <th
                      style={{
                        padding:
                          '13px',
                        textAlign:
                          'left',
                        fontWeight:
                          700,
                      }}
                    >
                      Role
                    </th>

                    <th
                      style={{
                        padding:
                          '13px',
                        textAlign:
                          'left',
                        fontWeight:
                          700,
                      }}
                    >
                      Status
                    </th>

                    <th
                      style={{
                        padding:
                          '13px',
                        textAlign:
                          'left',
                        fontWeight:
                          700,
                      }}
                    >
                      Expires
                    </th>

                    <th
                      style={{
                        padding:
                          '13px 20px',
                        textAlign:
                          'right',
                        fontWeight:
                          700,
                      }}
                    >
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {invitations.map(
                    (invitation) => {
                      const expired =
                        isExpired(
                          invitation
                        );

                      const claimed =
                        invitation.claimed ===
                        true;

                      const canResend =
                        !claimed;

                      return (
                        <tr
                          key={
                            invitation.id
                          }
                          style={{
                            borderBottom:
                              '1px solid var(--border)',
                          }}
                        >

                          {/* Personnel */}

                          <td
                            style={{
                              padding:
                                '14px 20px',
                            }}
                          >
                            <div
                              style={{
                                fontWeight:
                                  700,
                              }}
                            >
                              {
                                invitation.fullName
                              }
                            </div>

                            <div
                              style={{
                                marginTop:
                                  '3px',
                                color:
                                  'var(--muted)',
                                fontSize:
                                  '11px',
                              }}
                            >
                              {
                                invitation.email
                              }
                            </div>
                          </td>


                          {/* Role */}

                          <td
                            style={{
                              padding:
                                '14px',
                              whiteSpace:
                                'nowrap',
                            }}
                          >
                            {getRoleLabel(
                              invitation.role
                            )}
                          </td>


                          {/* Status */}

                          <td
                            style={{
                              padding:
                                '14px',
                            }}
                          >
                            {claimed ? (
                              <span
                                style={{
                                  display:
                                    'inline-flex',
                                  alignItems:
                                    'center',
                                  gap:
                                    '5px',
                                  color:
                                    'var(--green)',
                                  fontWeight:
                                    700,
                                }}
                              >
                                <CheckCircle2
                                  size={14}
                                />
                                Accepted
                              </span>
                            ) : expired ? (
                              <span
                                style={{
                                  display:
                                    'inline-flex',
                                  alignItems:
                                    'center',
                                  gap:
                                    '5px',
                                  color:
                                    'var(--red)',
                                  fontWeight:
                                    700,
                                }}
                              >
                                <XCircle
                                  size={14}
                                />
                                Expired
                              </span>
                            ) : (
                              <span
                                style={{
                                  display:
                                    'inline-flex',
                                  alignItems:
                                    'center',
                                  gap:
                                    '5px',
                                  color:
                                    'var(--orange)',
                                  fontWeight:
                                    700,
                                }}
                              >
                                <Clock3
                                  size={14}
                                />
                                Pending
                              </span>
                            )}
                          </td>


                          {/* Expiry */}

                          <td
                            style={{
                              padding:
                                '14px',
                              color:
                                'var(--muted)',
                              fontSize:
                                '11px',
                              whiteSpace:
                                'nowrap',
                            }}
                          >
                            {formatDate(
                              invitation.expiresAt
                            )}
                          </td>


                          {/* Action */}

                          <td
                            style={{
                              padding:
                                '14px 20px',
                              textAlign:
                                'right',
                            }}
                          >
                            {canResend && (
                              <button
                                type="button"
                                className="secondary-button"
                                onClick={() =>
                                  handleResend(
                                    invitation
                                  )
                                }
                                disabled={
                                  resendingId ===
                                  invitation.id
                                }
                                style={{
                                  display:
                                    'inline-flex',
                                  alignItems:
                                    'center',
                                  justifyContent:
                                    'center',
                                  gap:
                                    '6px',
                                  padding:
                                    '6px 10px',
                                  fontSize:
                                    '11px',
                                }}
                              >
                                <RefreshCw
                                  size={13}
                                  className={
                                    resendingId ===
                                    invitation.id
                                      ? 'spin'
                                      : ''
                                  }
                                />

                                {resendingId ===
                                invitation.id
                                  ? 'Sending...'
                                  : 'Resend Invitation'}
                              </button>
                            )}

                            {claimed && (
                              <span
                                style={{
                                  color:
                                    'var(--muted)',
                                  fontSize:
                                    '11px',
                                }}
                              >
                                Account activated
                              </span>
                            )}
                          </td>

                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}

      </div>

    </div>
  );
}

