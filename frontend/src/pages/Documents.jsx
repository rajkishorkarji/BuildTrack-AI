import { useState } from 'react';
import { FileText, Upload, Download, Eye, Plus } from 'lucide-react';

const initialDocs = [
  { id: 1, title: 'Metro Tower Architectural Blueprints - Rev 4', type: 'PDF Blueprint', uploadedBy: 'Divya Krishnan', date: 'May 12, 2025' },
  { id: 2, title: 'Bhubaneswar Development Authority Site Permit', type: 'Official Permit', uploadedBy: 'Vikram Nair', date: 'Jan 10, 2024' },
  { id: 3, title: 'Soil Strata & Mass Excavation Test Report', type: 'Geotechnical Report', uploadedBy: 'Divya Krishnan', date: 'Mar 20, 2024' },
];

export default function Documents() {
  const [docs, setDocs] = useState(initialDocs);

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow">Document Repository</p>
          <h1>Site Blueprints & Official Permits</h1>
        </div>
        <button type="button" className="primary-button" onClick={() => alert("Upload dialog opened")}>
          <Upload size={16} /> Upload Document
        </button>
      </section>

      <div className="panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Project Documents & Permits</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: 'var(--panel-soft)', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '14px 20px' }}>Document Name</th>
              <th style={{ padding: '14px 20px' }}>Category</th>
              <th style={{ padding: '14px 20px' }}>Uploaded By</th>
              <th style={{ padding: '14px 20px' }}>Upload Date</th>
              <th style={{ padding: '14px 20px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((d) => (
              <tr key={d.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={18} style={{ color: 'var(--blue)' }} />
                    {d.title}
                  </div>
                </td>
                <td style={{ padding: '14px 20px', color: 'var(--muted)' }}>{d.type}</td>
                <td style={{ padding: '14px 20px' }}>{d.uploadedBy}</td>
                <td style={{ padding: '14px 20px', color: 'var(--muted)' }}>{d.date}</td>
                <td style={{ padding: '14px 20px' }}>
                  <button type="button" style={{ background: 'transparent', border: 'none', color: 'var(--blue)', cursor: 'pointer', fontWeight: 600 }}>
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
