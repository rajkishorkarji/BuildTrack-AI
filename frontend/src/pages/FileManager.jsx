import { useState } from 'react';
import {
  Folder,
  FileText,
  Download,
  Trash2,
  HardDrive,
  UploadCloud,
  Search,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';

const initialFiles = [
  { id: 1, name: 'buildtrack_platform_schema_v4.pdf', company: 'BuildTrack AI Platform', category: 'Database Spec', size: '14.2 MB', uploadedBy: 'System Master Admin', date: '2026-08-01' },
  { id: 2, name: 'metro_tower_blueprints_final.dwg', company: 'Solviontech Infrastructure Ltd', category: 'CAD Drawings', size: '128.5 MB', uploadedBy: 'Divya Krishnan', date: '2026-07-28' },
  { id: 3, name: 'bda_government_environment_clearance.pdf', company: 'Solviontech Infrastructure Ltd', category: 'Legal Clearance', size: '4.8 MB', uploadedBy: 'Vikram Nair', date: '2026-07-15' },
  { id: 4, name: 'apex_structural_steel_certificate.pdf', company: 'Apex Construction Group', category: 'Material Cert', size: '2.1 MB', uploadedBy: 'Sarah Jenkins', date: '2026-07-10' },
  { id: 5, name: 'soil_mass_excavation_lab_report.xlsx', company: 'Solviontech Infrastructure Ltd', category: 'Geotech Data', size: '8.4 MB', uploadedBy: 'Rajkishor Karji', date: '2026-06-30' },
];

export default function FileManager() {
  const [files, setFiles] = useState(initialFiles);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');

  const notify = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3500);
  };

  const handleDeleteFile = (id, name) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    notify(`Permanently deleted file asset: ${name}`);
  };

  const filteredFiles = files.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.company.toLowerCase().includes(search.toLowerCase()) ||
      f.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <p className="eyebrow" style={{ color: 'var(--blue)', fontWeight: 600 }}>PLATFORM ASSET STORAGE</p>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Global File Manager & Storage Analytics</h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '4px' }}>
            System Admin global storage vault: inspect blueprints, legal permits, lab reports, and manage S3 storage quotas.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={() => notify('Simulated platform document upload modal')}
        >
          <UploadCloud size={16} /> Upload Platform Asset
        </button>
      </div>

      {notice && (
        <div style={{ background: 'rgba(36, 196, 107, 0.15)', border: '1px solid var(--green)', color: 'var(--green)', padding: '12px 18px', borderRadius: '10px', fontWeight: 600, fontSize: '14px' }}>
          {notice}
        </div>
      )}

      {/* Storage Analytics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Total Storage Used</span>
          <h2 style={{ fontSize: '26px', color: 'var(--blue)', marginTop: '4px' }}>1.4 TB / 10 TB</h2>
          <small style={{ color: 'var(--green)' }}>14% Storage Occupied</small>
        </div>
        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Indexed Documents</span>
          <h2 style={{ fontSize: '26px', color: 'var(--purple)', marginTop: '4px' }}>42,850 Files</h2>
          <small style={{ color: 'var(--muted)' }}>Across 24 Companies</small>
        </div>
        <div className="panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>CAD & Blueprints</span>
          <h2 style={{ fontSize: '26px', color: 'var(--green)', marginTop: '4px' }}>840 GB</h2>
          <small style={{ color: 'var(--green)' }}>High-res Vector Media</small>
        </div>
      </div>

      {/* File Explorer Table */}
      <div className="panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Folder size={20} style={{ color: 'var(--blue)' }} /> Platform Media & Document Vault
          </h3>

          <div className="search-box" style={{ width: '280px' }}>
            <Search size={16} />
            <input
              placeholder="Search file name or tenant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px' }}>File Asset</th>
                <th style={{ padding: '12px' }}>Tenant Company</th>
                <th style={{ padding: '12px' }}>Category</th>
                <th style={{ padding: '12px' }}>Size</th>
                <th style={{ padding: '12px' }}>Uploaded By</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map((f) => (
                <tr key={f.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '14px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FileText size={18} style={{ color: 'var(--purple)' }} />
                      <div>
                        <strong style={{ fontSize: '14px', display: 'block' }}>{f.name}</strong>
                        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Uploaded {f.date}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 12px', color: 'var(--blue)', fontWeight: 600 }}>{f.company}</td>
                  <td style={{ padding: '14px 12px' }}>{f.category}</td>
                  <td style={{ padding: '14px 12px', fontWeight: 600 }}>{f.size}</td>
                  <td style={{ padding: '14px 12px', color: 'var(--muted)' }}>{f.uploadedBy}</td>
                  <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        type="button"
                        className="secondary-button"
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                        onClick={() => notify(`Downloading ${f.name}...`)}
                      >
                        <Download size={14} /> Download
                      </button>
                      <button
                        type="button"
                        className="secondary-button"
                        style={{ padding: '4px 8px', fontSize: '12px', color: 'var(--red)' }}
                        onClick={() => handleDeleteFile(f.id, f.name)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
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
