import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Building2, Plus, Search, X, Mail, Phone, MapPin, UserRound } from 'lucide-react';

export default function SuperAdminCompanies() {
  const {
    companies = [],
    addCompany,
    deleteCompany,
    updateCompanyStatus,
    refreshFromServer,
  } = useData();

  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  const [newCo, setNewCo] = useState({
    name: '',
    code: '',
    email: '',
    phone: '',
    address: '',
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    plan: 'Professional',
  });

  const filtered = companies.filter((company) => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) return true;

    return (
      (company.name || '').toLowerCase().includes(searchText) ||
      (company.code || '').toLowerCase().includes(searchText) ||
      (company.adminName || '').toLowerCase().includes(searchText) ||
      (company.adminEmail || '').toLowerCase().includes(searchText)
    );
  });

  // ============================================================
  // FORM HANDLERS
  // ============================================================

  const updateForm = (field, value) => {
    setNewCo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setNewCo({
      name: '',
      code: '',
      email: '',
      phone: '',
      address: '',
      adminFirstName: '',
      adminLastName: '',
      adminEmail: '',
      plan: 'Professional',
    });
  };

  // ============================================================
  // CREATE COMPANY
  // ============================================================

  const handleCreate = async (e) => {
    e.preventDefault();

    if (creating) return;

    const companyName = newCo.name.trim();
    const companyCode = newCo.code.trim().toUpperCase();
    const companyEmail = newCo.email.trim().toLowerCase();
    const phone = newCo.phone.trim();
    const address = newCo.address.trim();

    const adminFirstName = newCo.adminFirstName.trim();
    const adminLastName = newCo.adminLastName.trim();
    const adminEmail = newCo.adminEmail.trim().toLowerCase();

    // ----------------------------------------------------------
    // VALIDATION
    // ----------------------------------------------------------

    if (!companyName) {
      window.alert('Company name is required.');
      return;
    }

    if (!companyCode) {
      window.alert('Company code is required.');
      return;
    }

    if (!companyEmail) {
      window.alert('Company email is required.');
      return;
    }

    if (!phone) {
      window.alert('Company phone number is required.');
      return;
    }

    if (!address) {
      window.alert('Company address is required.');
      return;
    }

    if (!adminFirstName) {
      window.alert('Company Admin first name is required.');
      return;
    }

    if (!adminLastName) {
      window.alert('Company Admin last name is required.');
      return;
    }

    if (!adminEmail) {
      window.alert('Company Admin email is required.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(companyEmail)) {
      window.alert('Please enter a valid company email address.');
      return;
    }

    if (!emailRegex.test(adminEmail)) {
      window.alert('Please enter a valid Company Admin email address.');
      return;
    }

    // ----------------------------------------------------------
    // CHECK DUPLICATE COMPANY CODE
    // ----------------------------------------------------------

    const duplicateCode = companies.some(
      (company) =>
        String(company.code || '').trim().toUpperCase() === companyCode
    );

    if (duplicateCode) {
      window.alert(
        `Company code "${companyCode}" already exists. Please use another code.`
      );
      return;
    }

    // ----------------------------------------------------------
    // CHECK DUPLICATE COMPANY EMAIL
    // ----------------------------------------------------------

    const duplicateCompanyEmail = companies.some(
      (company) =>
        String(company.email || '').trim().toLowerCase() === companyEmail
    );

    if (duplicateCompanyEmail) {
      window.alert(
        'A company with this email address already exists.'
      );
      return;
    }

    // ----------------------------------------------------------
    // CREATE COMPANY
    // ----------------------------------------------------------

    try {
      setCreating(true);

      /*
       * IMPORTANT:
       *
       * No password is created here.
       *
       * The Super Admin only provides the Company Admin's
       * identity/email.
       *
       * Backend should create the invitation and send the
       * invitation email.
       */

      const payload = {
        companyName,
        companyCode,
        companyEmail,
        phone,
        address,

        plan: newCo.plan,

        adminFirstName,
        adminLastName,
        adminEmail,
      };

      console.log('Creating company:', payload);

      const result = await addCompany(payload);
      const inviteUrl = result?.invitationUrl;

      let msg = `Company "${companyName}" created successfully.`;
      if (inviteUrl) {
        msg += `\n\nCompany Admin Invitation Link:\n${inviteUrl}\n\n(You can copy this link and send it directly to ${adminEmail})`;
      } else {
        msg += `\n\nAn invitation email has been queued for ${adminEmail}.`;
      }

      window.alert(msg);

      setShowCreate(false);
      resetForm();

      await refreshFromServer?.();
    } catch (error) {
      console.error('Company creation failed:', error);

      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message;

      window.alert(
        backendMessage ||
          'Failed to create company. Please check the backend logs.'
      );
    } finally {
      setCreating(false);
    }
  };

  // ============================================================
  // DELETE COMPANY
  // ============================================================

  const handleDelete = async (company) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${company.name}"?\n\n` +
        'This action may also remove company-related data.'
    );

    if (!confirmed) return;

    try {
      await deleteCompany(company.id || company.name);

      await refreshFromServer?.();

      window.alert('Company deleted successfully.');
    } catch (error) {
      console.error('Failed to delete company:', error);

      window.alert(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to delete company.'
      );
    }
  };

  // ============================================================
  // STATUS
  // ============================================================

  const handleStatusChange = async (company) => {
    const currentStatus = (
      company.status || 'ACTIVE'
    ).toUpperCase();

    const nextStatus =
      currentStatus === 'ACTIVE'
        ? 'SUSPENDED'
        : 'ACTIVE';

    try {
      await updateCompanyStatus(
        company.id || company.name,
        nextStatus
      );

      await refreshFromServer?.();
    } catch (error) {
      console.error(
        'Failed to update company status:',
        error
      );

      window.alert(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to update company status.'
      );
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="dashboard-page">

      {/* ========================================================
          HEADER
      ======================================================== */}

      <section
        className="hero-row"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
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
            }}
          >
            <Building2 size={14} />
            Companies
          </p>

        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() => {
            resetForm();
            setShowCreate(true);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap',
          }}
        >
          <Plus size={16} />
          Register New Tenant
        </button>
      </section>

      {/* ========================================================
          SEARCH
      ======================================================== */}

      <div
        className="panel"
        style={{
          marginTop: '20px',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div
          className="search-box"
          style={{
            width: '360px',
            maxWidth: '100%',
          }}
        >
          <Search
            size={15}
            style={{ color: 'var(--muted)' }}
          />

          <input
            placeholder="Search company, code or administrator..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <span
          style={{
            fontSize: '12px',
            color: 'var(--muted)',
            fontWeight: 600,
          }}
        >
          {filtered.length} {filtered.length === 1 ? 'company' : 'companies'}
        </span>
      </div>

      {/* ========================================================
          COMPANY TABLE
      ======================================================== */}

      <div
        className="panel"
        style={{
          marginTop: '16px',
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
              minWidth: '900px',
              borderCollapse: 'collapse',
              fontSize: '13px',
              textAlign: 'left',
            }}
          >
            <thead>
              <tr
                style={{
                  background: 'var(--panel-soft)',
                  color: 'var(--muted)',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>
                  Company Tenant
                </th>

                <th style={{ padding: '14px', fontWeight: 600 }}>
                  Company Code
                </th>

                <th style={{ padding: '14px', fontWeight: 600 }}>
                  Company Admin
                </th>

                <th style={{ padding: '14px', fontWeight: 600 }}>
                  Subscription
                </th>

                <th style={{ padding: '14px', fontWeight: 600 }}>
                  Plan
                </th>

                <th
                  style={{
                    padding: '14px 20px',
                    fontWeight: 600,
                    textAlign: 'right',
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: '50px 20px',
                      textAlign: 'center',
                      color: 'var(--muted)',
                    }}
                  >
                    <Building2
                      size={32}
                      style={{
                        marginBottom: '10px',
                        opacity: 0.5,
                      }}
                    />

                    <div
                      style={{
                        fontWeight: 700,
                        color: 'var(--text)',
                      }}
                    >
                      No companies found
                    </div>

                    <div
                      style={{
                        marginTop: '4px',
                        fontSize: '12px',
                      }}
                    >
                      Try another search or register a new company.
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((company) => {
                  const status = (
                    company.status || 'ACTIVE'
                  ).toUpperCase();

                  const subscriptionStatus = (
                    company.subscriptionStatus || 'PENDING'
                  ).toUpperCase();

                  const isActive = status === 'ACTIVE';

                  return (
                    <tr
                      key={company.id || company.code || company.name}
                      style={{
                        borderBottom:
                          '1px solid var(--border)',
                      }}
                    >
                      {/* COMPANY */}
                      <td
                        style={{
                          padding: '16px 20px',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                          }}
                        >
                          <div
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '9px',
                              background:
                                'rgba(37,99,235,0.10)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <Building2
                              size={17}
                              style={{
                                color: 'var(--blue)',
                              }}
                            />
                          </div>

                          <div>
                            <div
                              style={{
                                fontWeight: 750,
                                color: 'var(--text)',
                              }}
                            >
                              {company.name || 'Unnamed Company'}
                            </div>

                            {company.email && (
                              <div
                                style={{
                                  marginTop: '3px',
                                  fontSize: '11px',
                                  color: 'var(--muted)',
                                }}
                              >
                                {company.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* CODE */}
                      <td style={{ padding: '14px' }}>
                        <code
                          style={{
                            background:
                              'var(--panel-soft)',
                            padding: '5px 9px',
                            borderRadius: '6px',
                            color: 'var(--blue)',
                            fontWeight: 700,
                            fontSize: '12px',
                          }}
                        >
                          {company.code || '—'}
                        </code>
                      </td>

                      {/* ADMIN */}
                      <td style={{ padding: '14px' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                        >
                          <UserRound
                            size={15}
                            style={{
                              color: 'var(--muted)',
                            }}
                          />

                          <div>
                            <div
                              style={{
                                fontWeight: 650,
                                color: 'var(--text)',
                              }}
                            >
                              {company.adminName || 'Pending'}
                            </div>

                            {company.adminEmail && (
                              <div
                                style={{
                                  fontSize: '11px',
                                  color: 'var(--muted)',
                                  marginTop: '2px',
                                }}
                              >
                                {company.adminEmail}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* SUBSCRIPTION */}
                      <td style={{ padding: '14px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            padding: '5px 10px',
                            borderRadius: '999px',
                            background:
                              subscriptionStatus === 'ACTIVE'
                                ? 'rgba(34,197,94,0.12)'
                                : 'rgba(245,158,11,0.12)',
                            color:
                              subscriptionStatus === 'ACTIVE'
                                ? 'var(--green)'
                                : 'var(--orange)',
                            fontWeight: 700,
                            fontSize: '11px',
                          }}
                        >
                          {subscriptionStatus === 'ACTIVE'
                            ? 'Active'
                            : 'Pending'}
                        </span>
                      </td>

                      {/* PLAN */}
                      <td style={{ padding: '14px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            padding: '5px 11px',
                            borderRadius: '8px',
                            background:
                              'rgba(37,99,235,0.10)',
                            color: 'var(--blue)',
                            fontWeight: 700,
                            fontSize: '11px',
                          }}
                        >
                          {company.plan || '—'}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td
                        style={{
                          padding: '14px 20px',
                          textAlign: 'right',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            gap: '7px',
                            justifyContent: 'flex-end',
                          }}
                        >
                          <button
                            type="button"
                            className="secondary-button"
                            style={{
                              padding: '5px 10px',
                              fontSize: '11px',
                              fontWeight: 650,
                              color: isActive
                                ? 'var(--orange)'
                                : 'var(--green)',
                              borderColor: isActive
                                ? 'rgba(245,154,22,0.3)'
                                : 'rgba(34,197,94,0.3)',
                            }}
                            onClick={() =>
                              handleStatusChange(company)
                            }
                          >
                            {isActive
                              ? 'Suspend'
                              : 'Activate'}
                          </button>

                          <button
                            type="button"
                            className="secondary-button"
                            style={{
                              padding: '5px 10px',
                              fontSize: '11px',
                              color: 'var(--red)',
                              borderColor:
                                'rgba(239,68,68,0.3)',
                            }}
                            onClick={() =>
                              handleDelete(company)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================
          CREATE COMPANY MODAL
      ======================================================== */}

      {showCreate && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.62)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            className="panel"
            style={{
              width: '100%',
              maxWidth: '760px',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '30px',
              borderRadius: '18px',
              position: 'relative',
            }}
          >
            {/* MODAL HEADER */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '20px',
                marginBottom: '24px',
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: '25px',
                    fontWeight: 800,
                    margin: 0,
                    color: 'var(--text)',
                  }}
                >
                  Register New Company Tenant
                </h2>

                <p
                  style={{
                    margin: '7px 0 0',
                    color: 'var(--muted)',
                    fontSize: '13px',
                    lineHeight: 1.5,
                  }}
                >
                  Create the company tenant and invite its Company
                  Administrator.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!creating) {
                    setShowCreate(false);
                    resetForm();
                  }
                }}
                disabled={creating}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--panel-soft)',
                  color: 'var(--muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: creating
                    ? 'not-allowed'
                    : 'pointer',
                  flexShrink: 0,
                }}
              >
                <X size={17} />
              </button>
            </div>

            <form
              onSubmit={handleCreate}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
              }}
            >
              {/* ==================================================
                  COMPANY INFORMATION
              ================================================== */}

              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '15px',
                  }}
                >
                  <Building2
                    size={17}
                    style={{
                      color: 'var(--blue)',
                    }}
                  />

                  <h3
                    style={{
                      margin: 0,
                      fontSize: '15px',
                      fontWeight: 800,
                      color: 'var(--text)',
                    }}
                  >
                    Company Information
                  </h3>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(2, minmax(0, 1fr))',
                    gap: '15px',
                  }}
                >
                  {/* COMPANY NAME */}
                  <div>
                    <label style={labelStyle}>
                      Company Name *
                    </label>

                    <input
                      type="text"
                      required
                      value={newCo.name}
                      onChange={(e) =>
                        updateForm(
                          'name',
                          e.target.value
                        )
                      }
                      placeholder="BuildX Infrastructure Pvt Ltd"
                      style={inputStyle}
                    />
                  </div>

                  {/* COMPANY CODE */}
                  <div>
                    <label style={labelStyle}>
                      Company Code *
                    </label>

                    <input
                      type="text"
                      required
                      value={newCo.code}
                      onChange={(e) =>
                        updateForm(
                          'code',
                          e.target.value
                            .toUpperCase()
                        )
                      }
                      placeholder="BUILDX"
                      style={inputStyle}
                    />

                    <small
                      style={{
                        display: 'block',
                        marginTop: '5px',
                        color: 'var(--muted)',
                        fontSize: '10px',
                      }}
                    >
                      Unique tenant identifier.
                    </small>
                  </div>

                  {/* COMPANY EMAIL */}
                  <div>
                    <label style={labelStyle}>
                      <Mail size={13} />
                      Company Email *
                    </label>

                    <input
                      type="email"
                      required
                      value={newCo.email}
                      onChange={(e) =>
                        updateForm(
                          'email',
                          e.target.value
                        )
                      }
                      placeholder="contact@buildx.com"
                      style={inputStyle}
                    />
                  </div>

                  {/* PHONE */}
                  <div>
                    <label style={labelStyle}>
                      <Phone size={13} />
                      Phone *
                    </label>

                    <input
                      type="tel"
                      required
                      value={newCo.phone}
                      onChange={(e) =>
                        updateForm(
                          'phone',
                          e.target.value
                        )
                      }
                      placeholder="+91 9876543210"
                      style={inputStyle}
                    />
                  </div>

                  {/* ADDRESS */}
                  <div
                    style={{
                      gridColumn: '1 / -1',
                    }}
                  >
                    <label style={labelStyle}>
                      <MapPin size={13} />
                      Address *
                    </label>

                    <textarea
                      required
                      value={newCo.address}
                      onChange={(e) =>
                        updateForm(
                          'address',
                          e.target.value
                        )
                      }
                      placeholder="Enter complete company address"
                      rows={3}
                      style={{
                        ...inputStyle,
                        resize: 'vertical',
                        minHeight: '80px',
                      }}
                    />
                  </div>

                  {/* PLAN */}
                  <div
                    style={{
                      gridColumn: '1 / -1',
                    }}
                  >
                    <label style={labelStyle}>
                      Subscription Plan *
                    </label>

                    <select
                      required
                      value={newCo.plan}
                      onChange={(e) =>
                        updateForm(
                          'plan',
                          e.target.value
                        )
                      }
                      style={{
                        ...inputStyle,
                        cursor: 'pointer',
                      }}
                    >
                      <option value="Starter">
                        Starter (₹9,999 / month)
                      </option>

                      <option value="Professional">
                        Professional (₹29,999 / month)
                      </option>

                      <option value="Enterprise">
                        Enterprise (₹50,000 / month)
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ==================================================
                  COMPANY ADMINISTRATOR
              ================================================== */}

              <div
                style={{
                  borderTop:
                    '1px solid var(--border)',
                  paddingTop: '22px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                  }}
                >
                  <UserRound
                    size={17}
                    style={{
                      color: 'var(--blue)',
                    }}
                  />

                  <h3
                    style={{
                      margin: 0,
                      fontSize: '15px',
                      fontWeight: 800,
                      color: 'var(--text)',
                    }}
                  >
                    Company Administrator
                  </h3>
                </div>

                <p
                  style={{
                    margin: '0 0 15px',
                    color: 'var(--muted)',
                    fontSize: '11px',
                    lineHeight: 1.5,
                  }}
                >
                  An invitation will be sent to this email.
                  The Company Admin will create their own
                  password after accepting the invitation.
                </p>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(2, minmax(0, 1fr))',
                    gap: '15px',
                  }}
                >
                  {/* FIRST NAME */}
                  <div>
                    <label style={labelStyle}>
                      First Name *
                    </label>

                    <input
                      type="text"
                      required
                      value={
                        newCo.adminFirstName
                      }
                      onChange={(e) =>
                        updateForm(
                          'adminFirstName',
                          e.target.value
                        )
                      }
                      placeholder="Raj"
                      style={inputStyle}
                    />
                  </div>

                  {/* LAST NAME */}
                  <div>
                    <label style={labelStyle}>
                      Last Name *
                    </label>

                    <input
                      type="text"
                      required
                      value={
                        newCo.adminLastName
                      }
                      onChange={(e) =>
                        updateForm(
                          'adminLastName',
                          e.target.value
                        )
                      }
                      placeholder="Kishor"
                      style={inputStyle}
                    />
                  </div>

                  {/* ADMIN EMAIL */}
                  <div
                    style={{
                      gridColumn: '1 / -1',
                    }}
                  >
                    <label style={labelStyle}>
                      <Mail size={13} />
                      Administrator Email Address *
                    </label>

                    <input
                      type="email"
                      required
                      value={
                        newCo.adminEmail
                      }
                      onChange={(e) =>
                        updateForm(
                          'adminEmail',
                          e.target.value
                        )
                      }
                      placeholder="admin@buildx.com"
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>

              {/* ==================================================
                  INVITATION INFO
              ================================================== */}

              <div
                style={{
                  padding: '13px 15px',
                  borderRadius: '10px',
                  background:
                    'rgba(37,99,235,0.07)',
                  border:
                    '1px solid rgba(37,99,235,0.15)',
                  fontSize: '11px',
                  color: 'var(--muted)',
                  lineHeight: 1.6,
                }}
              >
                <strong
                  style={{
                    color: 'var(--blue)',
                  }}
                >
                  Administrator invitation:
                </strong>{' '}
                The Company Admin will receive an email
                containing an invitation link. They will
                use that link to set their password and
                activate their account.
              </div>

              {/* ==================================================
                  BUTTONS
              ================================================== */}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  paddingTop: '4px',
                }}
              >
                <button
                  type="button"
                  className="secondary-button"
                  disabled={creating}
                  onClick={() => {
                    setShowCreate(false);
                    resetForm();
                  }}
                  style={{
                    minWidth: '90px',
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={creating}
                  style={{
                    minWidth: '170px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    opacity: creating ? 0.7 : 1,
                    cursor: creating
                      ? 'not-allowed'
                      : 'pointer',
                  }}
                >
                  {creating
                    ? 'Creating...'
                    : 'Create Company & Invite Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// SHARED FORM STYLES
// ============================================================

const labelStyle = {
  color: 'var(--muted)',
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  marginBottom: '6px',
  fontSize: '12px',
  fontWeight: 650,
};

const inputStyle = {
  width: '100%',
  padding: '11px 12px',
  borderRadius: '9px',
  border: '1px solid var(--border)',
  background: 'var(--panel)',
  color: 'var(--text)',
  fontSize: '13px',
  outline: 'none',
  boxSizing: 'border-box',
};