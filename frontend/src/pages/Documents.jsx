import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { FileText, Plus, Search, Upload, Download, Eye } from 'lucide-react';

export default function Documents() {
  const { documents, addDocument } = useData();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDoc, setNewDoc] = useState({
    name: '',
    type: 'Blueprint',
    size: '1.8 MB',
  });

  const handleUploadDocument = (e) => {
    e.preventDefault();
    if (!newDoc.name.trim()) return;

    addDocument({
      name: newDoc.name.trim(),
      type: newDoc.type,
      size: newDoc.size,
      uploadedBy: user?.fullName || 'Site Engineer',
    });

    setShowAddModal(false);
    setNewDoc({ name: '', type: 'Blueprint', size: '1.8 MB' });
  };

  const filtered = documents.filter((d) => (d.name || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow">Project Blueprints & Compliance Documents</p>
          <h1>Document Vault ({documents.length})</h1>
        </div>

        <button type="button" className="primary-button" onClick={() => setShowAddModal(true)}>
          <Upload size={16} /> Upload Blueprint / Agreement
        </button>
      </section>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
        <div className="search-box" style={{ width: '320px' }}>
          <Search size={16} style={{ color: 'var(--muted)' }} />
          <input placeholder="Search document name..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="panel" style={{ marginTop: '20px', padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
            <FileText size={36} style={{ marginBottom: '12px', color: 'var(--muted)' }} />
            <h3 style={{ fontSize: '16px', color: 'var(--text)', margin: '0 0 6px 0' }}>No Project Documents Uploaded</h3>
            <p style={{ fontSize: '13px', margin: 0 }}>Click &quot;Upload Blueprint / Agreement&quot; above to store files.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--panel-soft)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                <th style={{ padding: '14px 20px' }}>Document File</th>
                <th style={{ padding: '14px' }}>Category</th>
                <th style={{ padding: '14px' }}>Size</th>
                <th style={{ padding: '14px' }}>Uploaded By</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc) => (
                <tr key={doc.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={16} style={{ color: 'var(--blue)' }} />
                      {doc.name}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}><span className="schedule-pill">{doc.type}</span></td>
                  <td style={{ padding: '16px' }}>{doc.size}</td>
                  <td style={{ padding: '16px' }}>{doc.uploadedBy}</td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <button type="button" className="secondary-button" style={{ fontSize: '12px', padding: '6px 12px' }}>
                      <Download size={14} /> Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="panel" style={{ width: '100%', maxWidth: '480px', padding: '28px', borderRadius: '16px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--text)' }}>Upload Document File</h2>
            <form onSubmit={handleUploadDocument} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div>
                <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Document Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Structural_Blueprint_v2.pdf"
                  value={newDoc.name}
                  onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
                />
              </div>

              <div>
                <label style={{ color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Category</label>
                <select
                  value={newDoc.type}
                  onChange={(e) => setNewDoc({ ...newDoc, type: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}
                >
                  <option value="Blueprint">Blueprint</option>
                  <option value="Contract Agreement">Contract Agreement</option>
                  <option value="Safety Protocol">Safety Protocol</option>
                  <option value="Invoice Record">Invoice Record</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="secondary-button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Upload Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
