import { useState } from 'react';
import {
  Activity,
  Server,
  Database,
  Cpu,
  HardDrive,
  Radio,
  Zap,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

const servicesStatus = [
  { name: 'PostgreSQL Database Cluster (Primary)', type: 'Database', status: 'HEALTHY', latency: '4ms', uptime: '99.99%', connections: '42 / 200' },
  { name: 'MongoDB NoSQL Document Store', type: 'Database', status: 'HEALTHY', latency: '6ms', uptime: '99.98%', connections: '18 / 100' },
  { name: 'Redis Cache & Session Broker', type: 'In-Memory Cache', status: 'HEALTHY', latency: '1ms', uptime: '100%', memory: '1.2 GB / 8 GB' },
  { name: 'Apache Kafka Event Streaming Engine', type: 'Message Bus', status: 'HEALTHY', latency: '12ms', uptime: '99.95%', topics: '14 Active Topics' },
  { name: 'WebSocket Real-Time Gateway', type: 'Sockets Server', status: 'HEALTHY', latency: '8ms', uptime: '99.99%', activeSockets: '1,420 Connections' },
  { name: 'API Gateway & Reverse Proxy (Nginx)', type: 'API Router', status: 'HEALTHY', latency: '2ms', uptime: '100%', reqPerSec: '850 req/s' },
];

export default function SystemMonitoring() {
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState('');

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setNotice('Refreshed real-time system metrics from telemetry agent.');
      setTimeout(() => setNotice(''), 3000);
    }, 800);
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <p className="eyebrow" style={{ color: 'var(--blue)', fontWeight: 600 }}>INFRASTRUCTURE TELEMETRY</p>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>System Health & Server Telemetry</h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '4px' }}>
            System Admin real-time monitoring: CPU load, RAM allocation, storage, and infrastructure microservice status.
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw size={16} className={refreshing ? 'spin' : ''} /> {refreshing ? 'Polling Telemetry...' : 'Refresh Telemetry'}
        </button>
      </div>

      {notice && (
        <div style={{ background: 'rgba(36, 196, 107, 0.15)', border: '1px solid var(--green)', color: 'var(--green)', padding: '12px 18px', borderRadius: '10px', fontWeight: 600, fontSize: '14px' }}>
          {notice}
        </div>
      )}

      {/* Hardware Telemetry Gauges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--muted)', fontSize: '13px' }}>CPU Core Load</span>
            <Cpu size={18} style={{ color: 'var(--blue)' }} />
          </div>
          <h2 style={{ fontSize: '28px', color: 'var(--blue)', marginTop: '8px' }}>24.6%</h2>
          <div style={{ background: 'var(--panel-soft)', height: '6px', borderRadius: '4px', overflow: 'hidden', marginTop: '8px' }}>
            <div style={{ background: 'var(--blue)', width: '24.6%', height: '100%' }} />
          </div>
          <small style={{ color: 'var(--muted)', marginTop: '6px', display: 'block' }}>16 vCPU Cores Active</small>
        </div>

        <div className="panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--muted)', fontSize: '13px' }}>RAM Allocation</span>
            <Server size={18} style={{ color: 'var(--purple)' }} />
          </div>
          <h2 style={{ fontSize: '28px', color: 'var(--purple)', marginTop: '8px' }}>38.2 GB / 64 GB</h2>
          <div style={{ background: 'var(--panel-soft)', height: '6px', borderRadius: '4px', overflow: 'hidden', marginTop: '8px' }}>
            <div style={{ background: 'var(--purple)', width: '59.6%', height: '100%' }} />
          </div>
          <small style={{ color: 'var(--muted)', marginTop: '6px', display: 'block' }}>59.6% Usage Target</small>
        </div>

        <div className="panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Storage Volume (NVMe)</span>
            <HardDrive size={18} style={{ color: 'var(--green)' }} />
          </div>
          <h2 style={{ fontSize: '28px', color: 'var(--green)', marginTop: '8px' }}>1.4 TB / 10 TB</h2>
          <div style={{ background: 'var(--panel-soft)', height: '6px', borderRadius: '4px', overflow: 'hidden', marginTop: '8px' }}>
            <div style={{ background: 'var(--green)', width: '14%', height: '100%' }} />
          </div>
          <small style={{ color: 'var(--green)', marginTop: '6px', display: 'block' }}>8.6 TB Available</small>
        </div>

        <div className="panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Network Bandwidth</span>
            <Radio size={18} style={{ color: 'var(--orange)' }} />
          </div>
          <h2 style={{ fontSize: '28px', color: 'var(--orange)', marginTop: '8px' }}>1.2 Gbps</h2>
          <div style={{ background: 'var(--panel-soft)', height: '6px', borderRadius: '4px', overflow: 'hidden', marginTop: '8px' }}>
            <div style={{ background: 'var(--orange)', width: '12%', height: '100%' }} />
          </div>
          <small style={{ color: 'var(--muted)', marginTop: '6px', display: 'block' }}>10 Gbps Pipeline</small>
        </div>
      </div>

      {/* Core Infrastructure Services Table */}
      <div className="panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={20} style={{ color: 'var(--blue)' }} /> Platform Subsystem Telemetry Status
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px' }}>Service Subsystem</th>
                <th style={{ padding: '12px' }}>Category</th>
                <th style={{ padding: '12px' }}>Latency</th>
                <th style={{ padding: '12px' }}>Uptime</th>
                <th style={{ padding: '12px' }}>Active Metric</th>
                <th style={{ padding: '12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {servicesStatus.map((s, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '14px 12px', fontWeight: 600 }}>{s.name}</td>
                  <td style={{ padding: '14px 12px', color: 'var(--muted)' }}>{s.type}</td>
                  <td style={{ padding: '14px 12px', color: 'var(--green)', fontWeight: 600 }}>{s.latency}</td>
                  <td style={{ padding: '14px 12px', fontWeight: 600 }}>{s.uptime}</td>
                  <td style={{ padding: '14px 12px', color: 'var(--blue)' }}>{s.connections || s.memory || s.topics || s.activeSockets || s.reqPerSec}</td>
                  <td style={{ padding: '14px 12px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 700,
                        background: 'rgba(36, 196, 107, 0.15)',
                        color: 'var(--green)',
                      }}
                    >
                      ✓ {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
