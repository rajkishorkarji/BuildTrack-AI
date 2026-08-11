import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function CompanyRegistration() {

  const [form, setForm] = useState({
    companyName: '',
    companyEmail: '',
    phone: '',
    address: '',
    plan: 'Professional',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const update = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const submit = async (event) => {

    event.preventDefault();

    setLoading(true);
    setMessage('');

    try {

      const response =
        await api.post(
          '/public/company-registration',
          form
        );

      setMessage(
        response.data?.message ||
        'Registration submitted successfully.'
      );

      setForm({
        companyName: '',
        companyEmail: '',
        phone: '',
        address: '',
        plan: 'Professional',
      });

    } catch (error) {

      setMessage(
        error.response?.data?.message ||
        'Unable to submit company registration.'
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="login-page">

      <div
        className="panel"
        style={{
          width: '100%',
          maxWidth: '560px',
          padding: '32px',
          margin: '30px auto',
        }}
      >

        <h1 style={{ marginBottom: '8px' }}>
          Register Your Company
        </h1>

        <p
          style={{
            color: 'var(--muted)',
            marginBottom: '24px',
          }}
        >
          Submit your company details for
          BuildTrack AI approval.
        </p>

        <form
          onSubmit={submit}
          style={{
            display: 'grid',
            gap: '16px',
          }}
        >

          <input
            required
            placeholder="Company Name"
            value={form.companyName}
            onChange={(e) =>
              update(
                'companyName',
                e.target.value
              )
            }
          />

          <input
            required
            type="email"
            placeholder="Company Email"
            value={form.companyEmail}
            onChange={(e) =>
              update(
                'companyEmail',
                e.target.value
              )
            }
          />

          <input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) =>
              update(
                'phone',
                e.target.value
              )
            }
          />

          <textarea
            placeholder="Company Address"
            value={form.address}
            onChange={(e) =>
              update(
                'address',
                e.target.value
              )
            }
            rows={4}
          />

          <select
            value={form.plan}
            onChange={(e) =>
              update(
                'plan',
                e.target.value
              )
            }
          >
            <option value="Starter">
              Starter
            </option>

            <option value="Professional">
              Professional
            </option>

            <option value="Enterprise">
              Enterprise
            </option>
          </select>

          {message && (
            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                background:
                  'var(--panel-soft)',
              }}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading
              ? 'Submitting...'
              : 'Submit Company Registration'}
          </button>

        </form>

        <div style={{ marginTop: '20px' }}>
          <Link to="/login">
            Already have an account? Sign in
          </Link>
        </div>

      </div>

    </div>
  );
}