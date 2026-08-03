import { useState } from 'react';
import {
  Zap,
  CheckCircle2,
  Sliders,
  Cloud,
  CreditCard,
  Mail,
  MapPin,
  Database,
  Container,
  Server,
  RefreshCw,
} from 'lucide-react';

const initialServices = [
  { id: 1, name: 'Google Maps API', category: 'GIS & Location Services', icon: MapPin, status: 'CONNECTED', apiKey: 'AIzaSyD9...X8a02', usage: '14,250 requests / month' },
  { id: 2, name: 'Cloudinary Media Asset Store', category: 'CDN & Photo Storage', icon: Cloud, status: 'CONNECTED', apiKey: 'cloud_name: buildtrack-cdn', usage: '124 GB / 500 GB' },
  { id: 3, name: 'Razorpay Payment Gateway', category: 'Billing & Invoicing', icon: CreditCard, status: 'CONNECTED', apiKey: 'rzp_live_...93a1', usage: '₹14,50,000 processed' },
  { id: 4, name: 'SMTP Mailer Service (SendGrid)', category: 'Email Broadcasts & Notifications', icon: Mail, status: 'CONNECTED', apiKey: 'SG.x89a...291a', usage: '8,400 emails sent' },
  { id: 5, name: 'Apache Kafka Engine', category: 'Event Streaming', icon: Server, status: 'CONNECTED', apiKey: 'kafka-broker.internal:9092', usage: '14 Active Topics' },
  { id: 6, name: 'Redis Cache Cluster', category: 'In-Memory Key-Value', icon: Database, status: 'CONNECTED', apiKey: 'redis-cluster.internal:6379', usage: '1.2 GB Memory' },
  { id: 7, name: 'AWS S3 Cloud Archives', category: 'Cold Storage Snapshots', icon: Cloud, status: 'CONNECTED', apiKey: 's3://buildtrack-backups-bucket', usage: '4.2 TB Stored' },
  { id: 8, name: 'Docker Container Runtime', category: 'Microservice Containerization', icon: Container, status: 'CONNECTED', apiKey: 'Docker Engine v24.0.5', usage: '12 Containers Running' },
];

export default function Integrations() {
  const [services, setServices] = useState(initialServices);
  const [notice, setNotice] = useState('');

  const notify = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3500);
  };

  const handleTestConnection = (name) => {
    notify(`Ping test successful for ${name}. Response latency: 14ms.`);
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <p className="eyebrow" style={{ color: 'var(--blue)', fontWeight: 600 }}>THIRD-PARTY ECOSYSTEM</p>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Integrations & External Services Hub</h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '4px' }}>
            System Admin hub to configure external APIs, cloud storage, payment gateways, and backend microservice connectors.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={() => notify('Re-verified all 8 active service connections')}
        >
          <Zap size={16} /> Re-Verify Connections
        </button>
      </div>

      {notice && (
        <div style={{ background: 'rgba(36, 196, 107, 0.15)', border: '1px solid var(--green)', color: 'var(--green)', padding: '12px 18px', borderRadius: '10px', fontWeight: 600, fontSize: '14px' }}>
          {notice}
        </div>
      )}

      {/* Grid of integration cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {services.map((s) => {
          const IconComp = s.icon;
          return (
            <div key={s.id} className="panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(78, 132, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blue)' }}>
                    <IconComp size={22} />
                  </div>
                  <span style={{ padding: '4px 10px', borderRadius: '12px', background: 'rgba(36, 196, 107, 0.15)', color: 'var(--green)', fontWeight: 700, fontSize: '12px' }}>
                    ✓ {s.status}
                  </span>
                </div>

                <h3 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 4px 0' }}>{s.name}</h3>
                <span style={{ color: 'var(--muted)', fontSize: '13px', display: 'block', marginBottom: '12px' }}>{s.category}</span>

                <div style={{ background: 'var(--panel-soft)', padding: '10px 12px', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace', color: 'var(--muted)', wordBreak: 'break-all' }}>
                  Endpoint / Key: {s.apiKey}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Usage: <strong>{s.usage}</strong></span>
                <button
                  type="button"
                  className="secondary-button"
                  style={{ padding: '4px 10px', fontSize: '12px' }}
                  onClick={() => handleTestConnection(s.name)}
                >
                  Test Connection
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
