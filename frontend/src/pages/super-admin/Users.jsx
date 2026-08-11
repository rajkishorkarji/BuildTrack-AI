
import { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Search,
  Shield,
  Building2,
  UserCheck,
  UserX,
  Filter,
} from 'lucide-react';

const ROLE_LABELS = {
  SUPER_ADMIN: 'Super Admin',
  COMPANY_ADMIN: 'Company Admin',
  PROJECT_MANAGER: 'Project Manager',
  SITE_ENGINEER: 'Site Engineer',
  CONTRACTOR: 'Contractor',
  WORKER: 'Worker',
};

const ROLE_OPTIONS = [
  'ALL',
  'SUPER_ADMIN',
  'COMPANY_ADMIN',
  'PROJECT_MANAGER',
  'SITE_ENGINEER',
  'CONTRACTOR',
  'WORKER',
];

const STATUS_OPTIONS = [
  'ALL',
  'ACTIVE',
  'INACTIVE',
  'SUSPENDED',
  'PENDING',
];

function formatRole(role) {
  return (
    ROLE_LABELS[role] ||
    String(role || 'Unknown')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())
  );
}

function normalizeStatus(user) {
  const rawStatus =
    user?.status ||
    (user?.enabled === false
      ? 'INACTIVE'
      : user?.blocked
        ? 'SUSPENDED'
        : 'ACTIVE');

  return String(rawStatus)
    .toUpperCase()
    .replace(/\s+/g, '_');
}

function getStatusLabel(status) {
  switch (status) {
    case 'ACTIVE':
      return 'Active';

    case 'INACTIVE':
      return 'Inactive';

    case 'SUSPENDED':
      return 'Suspended';

    case 'PENDING':
      return 'Pending';

    default:
      return 'Unknown';
  }
}

function getStatusClass(status) {
  switch (status) {
    case 'ACTIVE':
      return {
        background: 'rgba(34, 197, 94, 0.12)',
        color: 'var(--green)',
      };

    case 'SUSPENDED':
      return {
        background: 'rgba(239, 68, 68, 0.12)',
        color: 'var(--red)',
      };

    case 'PENDING':
      return {
        background: 'rgba(245, 158, 11, 0.12)',
        color: 'var(--orange)',
      };

    default:
      return {
        background: 'rgba(148, 163, 184, 0.12)',
        color: 'var(--muted)',
      };
  }
}

function getUserName(user) {
  return (
    user?.fullName ||
    user?.name ||
    user?.email ||
    'Unknown User'
  );
}

function getCompanyName(user) {
  return (
    user?.companyName ||
    user?.company?.name ||
    user?.companyCode ||
    'Platform'
  );
}

export default function SuperAdminUsers() {
  const { usersList = [] } = useData();
  const { registeredUsers = [] } = useAuth();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  /*
   * ============================================================
   * MERGE USERS
   * ============================================================
   *
   * The backend/server data is preferred.
   * registeredUsers is kept as a secondary source because your
   * existing AuthContext may still contain authenticated users.
   *
   * Duplicate users are removed by email.
   */

  const allUsers = useMemo(() => {
    const merged = [
      ...usersList,
      ...registeredUsers,
    ];

    const usersByEmail = new Map();

    merged.forEach((user) => {
      const email = String(
        user?.email || ''
      )
        .trim()
        .toLowerCase();

      if (!email) {
        return;
      }

      /*
       * Prefer the later/server representation when the same
       * email exists in both sources.
       */
      usersByEmail.set(email, user);
    });

    return Array.from(usersByEmail.values());
  }, [usersList, registeredUsers]);

  /*
   * ============================================================
   * NORMALIZED USERS
   * ============================================================
   */

  const normalizedUsers = useMemo(() => {
    return allUsers.map((user) => ({
      ...user,

      displayName: getUserName(user),

      displayRole: formatRole(
        user?.role
      ),

      displayCompany:
        getCompanyName(user),

      normalizedRole:
        String(user?.role || '')
          .toUpperCase(),

      normalizedStatus:
        normalizeStatus(user),
    }));
  }, [allUsers]);

  /*
   * ============================================================
   * FILTERED USERS
   * ============================================================
   */

  const filteredUsers = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return normalizedUsers.filter(
      (user) => {
        const matchesSearch =
          !query ||
          user.displayName
            .toLowerCase()
            .includes(query) ||
          String(user.email || '')
            .toLowerCase()
            .includes(query) ||
          user.displayCompany
            .toLowerCase()
            .includes(query);

        const matchesRole =
          roleFilter === 'ALL' ||
          user.normalizedRole === roleFilter;

        const matchesStatus =
          statusFilter === 'ALL' ||
          user.normalizedStatus === statusFilter;

        return (
          matchesSearch &&
          matchesRole &&
          matchesStatus
        );
      }
    );
  }, [
    normalizedUsers,
    search,
    roleFilter,
    statusFilter,
  ]);

  /*
   * ============================================================
   * STATISTICS
   * ============================================================
   */

  const statistics = useMemo(() => {
    return {
      total: normalizedUsers.length,

      active: normalizedUsers.filter(
        (user) =>
          user.normalizedStatus === 'ACTIVE'
      ).length,

      suspended: normalizedUsers.filter(
        (user) =>
          user.normalizedStatus === 'SUSPENDED'
      ).length,

      pending: normalizedUsers.filter(
        (user) =>
          user.normalizedStatus === 'PENDING'
      ).length,
    };
  }, [normalizedUsers]);

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <div
      style={{
        paddingBottom: '32px',
      }}
    >
      {/* ======================================================
          HEADER
      ======================================================= */}

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <p
            className="eyebrow"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--blue)',
              fontWeight: 700,
              marginBottom: '6px',
            }}
          >
            <Users size={15} />
            PLATFORM USERS
          </p>

        </div>
      </div>

      {/* ======================================================
          STATISTICS
      ======================================================= */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          marginTop: '16px',
        }}
      >
        <div
          className="panel"
          style={{
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
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
                'rgba(59, 130, 246, 0.12)',
              color: 'var(--blue)',
            }}
          >
            <Users size={19} />
          </div>

          <div>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--muted)',
                fontWeight: 600,
              }}
            >
              Total Users
            </div>

            <div
              style={{
                marginTop: '3px',
                fontSize: '22px',
                fontWeight: 800,
              }}
            >
              {statistics.total}
            </div>
          </div>
        </div>

        <div
          className="panel"
          style={{
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
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
                'rgba(34, 197, 94, 0.12)',
              color: 'var(--green)',
            }}
          >
            <UserCheck size={19} />
          </div>

          <div>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--muted)',
                fontWeight: 600,
              }}
            >
              Active
            </div>

            <div
              style={{
                marginTop: '3px',
                fontSize: '22px',
                fontWeight: 800,
              }}
            >
              {statistics.active}
            </div>
          </div>
        </div>

        <div
          className="panel"
          style={{
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
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
                'rgba(239, 68, 68, 0.12)',
              color: 'var(--red)',
            }}
          >
            <UserX size={19} />
          </div>

          <div>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--muted)',
                fontWeight: 600,
              }}
            >
              Suspended
            </div>

            <div
              style={{
                marginTop: '3px',
                fontSize: '22px',
                fontWeight: 800,
              }}
            >
              {statistics.suspended}
            </div>
          </div>
        </div>

        <div
          className="panel"
          style={{
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
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
                'rgba(245, 158, 11, 0.12)',
              color: 'var(--orange)',
            }}
          >
            <Shield size={19} />
          </div>

          <div>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--muted)',
                fontWeight: 600,
              }}
            >
              Pending
            </div>

            <div
              style={{
                marginTop: '3px',
                fontSize: '22px',
                fontWeight: 800,
              }}
            >
              {statistics.pending}
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          FILTER BAR
      ======================================================= */}

      <div
        className="panel"
        style={{
          marginTop: '20px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--muted)',
            fontSize: '12px',
            fontWeight: 700,
          }}
        >
          <Filter size={15} />
          Filters
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
            flex: 1,
            justifyContent: 'flex-end',
          }}
        >
          {/* Search */}

          <div
            className="search-box"
            style={{
              width: '300px',
              maxWidth: '100%',
            }}
          >
            <Search
              size={14}
              style={{
                color: 'var(--muted)',
              }}
            />

            <input
              type="search"
              placeholder="Search name, email or company..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          {/* Role */}

          <select
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(event.target.value)
            }
            aria-label="Filter users by role"
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border:
                '1px solid var(--border)',
              background:
                'var(--panel)',
              color: 'var(--text)',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            {ROLE_OPTIONS.map((role) => (
              <option
                key={role}
                value={role}
              >
                {role === 'ALL'
                  ? 'All Roles'
                  : formatRole(role)}
              </option>
            ))}
          </select>

          {/* Status */}

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            aria-label="Filter users by status"
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border:
                '1px solid var(--border)',
              background:
                'var(--panel)',
              color: 'var(--text)',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            {STATUS_OPTIONS.map((status) => (
              <option
                key={status}
                value={status}
              >
                {status === 'ALL'
                  ? 'All Statuses'
                  : getStatusLabel(status)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ======================================================
          RESULTS SUMMARY
      ======================================================= */}

      <div
        style={{
          marginTop: '14px',
          marginBottom: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            color: 'var(--muted)',
            fontSize: '12px',
          }}
        >
          Showing{' '}
          <strong
            style={{
              color: 'var(--text)',
            }}
          >
            {filteredUsers.length}
          </strong>{' '}
          of{' '}
          <strong
            style={{
              color: 'var(--text)',
            }}
          >
            {normalizedUsers.length}
          </strong>{' '}
          users
        </span>

        {(search ||
          roleFilter !== 'ALL' ||
          statusFilter !== 'ALL') && (
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              setSearch('');
              setRoleFilter('ALL');
              setStatusFilter('ALL');
            }}
            style={{
              padding: '6px 10px',
              fontSize: '11px',
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* ======================================================
          USER TABLE
      ======================================================= */}

      <div
        className="panel"
        style={{
          marginTop: '8px',
          padding: 0,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            overflowX: 'auto',
          }}
        >
          <table
            style={{
              width: '100%',
              minWidth: '850px',
              borderCollapse: 'collapse',
              fontSize: '13px',
              textAlign: 'left',
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom:
                    '1px solid var(--border)',
                  background:
                    'var(--panel-alt)',
                }}
              >
                <th
                  style={{
                    padding: '14px 20px',
                    fontWeight: 700,
                  }}
                >
                  User
                </th>

                <th
                  style={{
                    padding: '14px',
                    fontWeight: 700,
                  }}
                >
                  Assigned Role
                </th>

                <th
                  style={{
                    padding: '14px',
                    fontWeight: 700,
                  }}
                >
                  Company Tenant
                </th>

                <th
                  style={{
                    padding: '14px',
                    fontWeight: 700,
                  }}
                >
                  Status
                </th>

                <th
                  style={{
                    padding: '14px 20px',
                    fontWeight: 700,
                    textAlign: 'right',
                  }}
                >
                  Account
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: '50px 20px',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      <Users
                        size={32}
                        style={{
                          color: 'var(--muted)',
                        }}
                      />

                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '14px',
                        }}
                      >
                        No users found
                      </div>

                      <div
                        style={{
                          color: 'var(--muted)',
                          fontSize: '12px',
                        }}
                      >
                        Try changing your search or
                        filter criteria.
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map(
                  (user, index) => {
                    const status =
                      user.normalizedStatus;

                    const statusStyle =
                      getStatusClass(status);

                    return (
                      <tr
                        key={
                          user.id ||
                          user.email ||
                          index
                        }
                        style={{
                          borderBottom:
                            '1px solid var(--border)',
                        }}
                      >
                        {/* User */}

                        <td
                          style={{
                            padding:
                              '14px 20px',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems:
                                'center',
                              gap: '11px',
                            }}
                          >
                            <div
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius:
                                  '10px',
                                display: 'flex',
                                alignItems:
                                  'center',
                                justifyContent:
                                  'center',
                                background:
                                  'rgba(59, 130, 246, 0.10)',
                                color:
                                  'var(--blue)',
                                fontWeight: 800,
                                fontSize:
                                  '13px',
                                flexShrink: 0,
                              }}
                            >
                              {user.displayName
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div
                              style={{
                                minWidth: 0,
                              }}
                            >
                              <div
                                style={{
                                  fontWeight: 700,
                                  whiteSpace:
                                    'nowrap',
                                  overflow:
                                    'hidden',
                                  textOverflow:
                                    'ellipsis',
                                  maxWidth:
                                    '240px',
                                }}
                              >
                                {
                                  user.displayName
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
                                  whiteSpace:
                                    'nowrap',
                                }}
                              >
                                {user.email ||
                                  'No email'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role */}

                        <td
                          style={{
                            padding: '14px',
                          }}
                        >
                          <span
                            style={{
                              display:
                                'inline-flex',
                              alignItems:
                                'center',
                              gap: '6px',
                              padding:
                                '5px 9px',
                              borderRadius:
                                '7px',
                              background:
                                'rgba(59, 130, 246, 0.08)',
                              color:
                                'var(--blue)',
                              fontSize:
                                '11px',
                              fontWeight: 700,
                              whiteSpace:
                                'nowrap',
                            }}
                          >
                            <Shield
                              size={12}
                            />
                            {
                              user.displayRole
                            }
                          </span>
                        </td>

                        {/* Company */}

                        <td
                          style={{
                            padding: '14px',
                          }}
                        >
                          <div
                            style={{
                              display:
                                'flex',
                              alignItems:
                                'center',
                              gap: '7px',
                              color:
                                'var(--text)',
                              fontWeight: 600,
                            }}
                          >
                            <Building2
                              size={14}
                              style={{
                                color:
                                  'var(--muted)',
                              }}
                            />

                            <span
                              style={{
                                maxWidth:
                                  '190px',
                                overflow:
                                  'hidden',
                                textOverflow:
                                  'ellipsis',
                                whiteSpace:
                                  'nowrap',
                              }}
                            >
                              {
                                user.displayCompany
                              }
                            </span>
                          </div>
                        </td>

                        {/* Status */}

                        <td
                          style={{
                            padding: '14px',
                          }}
                        >
                          <span
                            style={{
                              display:
                                'inline-flex',
                              alignItems:
                                'center',
                              padding:
                                '5px 9px',
                              borderRadius:
                                '7px',
                              background:
                                statusStyle.background,
                              color:
                                statusStyle.color,
                              fontSize:
                                '11px',
                              fontWeight: 700,
                            }}
                          >
                            {getStatusLabel(
                              status
                            )}
                          </span>
                        </td>

                        {/* Account */}

                        <td
                          style={{
                            padding:
                              '14px 20px',
                            textAlign:
                              'right',
                          }}
                        >
                          <span
                            style={{
                              color:
                                'var(--muted)',
                              fontSize:
                                '11px',
                            }}
                          >
                            {user.id
                              ? `ID: ${user.id}`
                              : 'Platform account'}
                          </span>
                        </td>
                      </tr>
                    );
                  }
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================
          FOOTER NOTE
      ======================================================= */}

      <div
        style={{
          marginTop: '14px',
          color: 'var(--muted)',
          fontSize: '11px',
          lineHeight: 1.5,
        }}
      >
        <strong
          style={{
            color: 'var(--text)',
          }}
        >
          Account creation:
        </strong>{' '}
        New company personnel must be invited by
        their Company Admin. The invitation email
        contains a secure token that the user uses
        to activate the account and create a password.
      </div>
    </div>
  );
}

