import { useState, useRef } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  FileText, Download, Upload, Search, Filter, Trash2, Eye, Edit2, Lock, X,
} from 'lucide-react';

const INPUT = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: '13px' };

export default function Documents() {
  const { documents = [], addDocument, projects = [] } = useData();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [deletedIds, setDeletedIds] = useState([]);

  // Detail & Edit Modals
  const [viewingDoc, setViewingDoc] = useState(null);
  const [editingDoc, setEditingDoc] = useState(null);

  const fileInputRef = useRef(null);

  // Exact sample documents requested
  const defaultDocs = [
    { id: 'd-1', name: 'Site Plan.pdf', cat: 'Drawings', project: 'Metro Tower', uploadedBy: 'Company Admin', date: '05 Aug 2026', status: 'Active', permission: 'Company Only', size: '12.4 MB', description: 'Master site architectural layout plan.' },
    { id: 'd-2', name: 'Safety Permit.pdf', cat: 'Permits', project: 'Metro Tower', uploadedBy: 'Site Engineer', date: '06 Aug 2026', status: 'Valid', permission: 'Project Team', size: '2.8 MB', description: 'Municipal safety inspection & work clearance permit.' },
    { id: 'd-3', name: 'Metro Tower Architectural Blueprint v4.pdf', cat: 'Drawings', project: 'Metro Tower', uploadedBy: 'Chief Architect', date: '01 Aug 2026', status: 'Active', permission: 'Project Team', size: '14.2 MB', description: 'Floor 1-20 elevation blueprints.' },
    { id: 'd-4', name: 'Subcontractor Master Agreement.pdf', cat: 'Contracts', project: 'Highway Expansion', uploadedBy: 'Company Admin', date: '20 Jul 2026', status: 'Valid', permission: 'Contractor', size: '5.1 MB', description: 'Master subcontracting terms.' },
  ];

  const initialDocs = documents.length > 0 ? documents.map(d => ({
    id: d.id,
    name: d.name,
    cat: d.type || d.cat || 'Drawings',
    project: d.project || d.projectName || 'Metro Tower',
    date: d.uploadedAt || d.date || '05 Aug 2026',
    uploadedBy: d.uploadedBy || 'Company Admin',
    status: d.status || 'Active',
    permission: d.permission || 'Company Only',
    size: d.size || '2.5 MB',
    description: d.description || 'Uploaded vault document.',
  })) : defaultDocs;

  const [records, setRecords] = useState(initialDocs);

  const allDocs = records.filter(d => !deletedIds.includes(d.id));

  // Upload Form State
  const [newDoc, setNewDoc] = useState({
    name: '',
    cat: 'Drawings',
    project: 'Metro Tower',
    description: '',
    tags: '',
    permission: 'Company Only',
    size: '2.5 MB',
  });

  const handleDeleteDoc = (docId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      setDeletedIds(prev => [...prev, docId]);
    }
  };

  const handleEditSave = (e) => {
    e.preventDefault();
    if (!editingDoc) return;
    setRecords(prev => prev.map(r => r.id === editingDoc.id ? { ...editingDoc } : r));
    setEditingDoc(null);
  };

  const triggerBrowseFile = () => {
    setShowUploadModal(true);
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const formattedSize = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      setNewDoc(prev => ({
        ...prev,
        name: prev.name || file.name,
        size: formattedSize,
      }));
    }
  };

  const handleUpload = (e) => {
    e.preventDefault();
    if (!newDoc.name.trim()) return;
    const uploadedRecord = {
      id: Date.now().toString(),
      name: newDoc.name.trim(),
      cat: newDoc.cat,
      project: newDoc.project || 'Metro Tower',
      uploadedBy: user?.fullName || 'Platform User',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Active',
      permission: newDoc.permission,
      size: newDoc.size,
      description: newDoc.description,
    };
    setRecords([uploadedRecord, ...records]);
    if (addDocument) addDocument(uploadedRecord);
    setShowUploadModal(false);
    setSelectedFile(null);
    setNewDoc({
      name: '',
      cat: 'Drawings',
      project: 'Metro Tower',
      description: '',
      tags: '',
      permission: 'Company Only',
      size: '2.5 MB',
    });
  };

  const filteredDocs = allDocs.filter(d => {
    const matchesSearch = (d.name || '').toLowerCase().includes(search.toLowerCase()) ||
                          (d.uploadedBy || '').toLowerCase().includes(search.toLowerCase()) ||
                          (d.project || '').toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || d.cat === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const isWorker = user?.role === 'WORKER';

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow">Enterprise Document Vault</p>
          <h1>Project & Legal Documents ({filteredDocs.length})</h1>
        </div>
        {!isWorker && (
          <button type="button" className="primary-button" onClick={triggerBrowseFile}>
            <Upload size={16} /> Upload New Document
          </button>
        )}
      </section>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Filter Toolbar */}
      <div className="panel" style={{ marginTop: '20px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-box" style={{ width: '320px' }}>
            <Search size={16} style={{ color: 'var(--muted)' }} />
            <input placeholder="Search document, project, or uploader..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={15} style={{ color: 'var(--muted)' }} />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border)',
                background: 'var(--panel)', color: 'var(--text)', fontSize: '13px', fontWeight: 600,
              }}
            >
              <option value="ALL">All Categories</option>
              <option value="Drawings">Drawings</option>
              <option value="Permits">Permits</option>
              <option value="Contracts">Contracts</option>
              <option value="Project Files">Project Files</option>
              <option value="Invoice Storage">Invoice Storage</option>
            </select>
          </div>
        </div>

        <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 500 }}>
          Encrypted 256-bit SSL Vault
        </span>
      </div>

      {/* ── Document Table matching requested layout ── */}
      <div className="panel" style={{ marginTop: '16px', padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--panel-soft)', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Document</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Category</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Project</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Uploaded By</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Date</th>
              <th style={{ padding: '14px', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocs.map(doc => (
              <tr key={doc.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={18} style={{ color: 'var(--blue)', flexShrink: 0 }} />
                    {doc.name}
                  </div>
                </td>
                <td style={{ padding: '14px', color: 'var(--blue)', fontWeight: 600 }}>
                  {doc.cat}
                </td>
                <td style={{ padding: '14px', color: 'var(--text)', fontWeight: 500 }}>
                  {doc.project}
                </td>
                <td style={{ padding: '14px', fontWeight: 500 }}>
                  {doc.uploadedBy}
                </td>
                <td style={{ padding: '14px', color: 'var(--muted)' }}>
                  {doc.date}
                </td>
                <td style={{ padding: '14px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: doc.status === 'Active' || doc.status === 'Valid' ? 'rgba(34,197,94,0.12)' : 'rgba(37,99,235,0.12)',
                    color: doc.status === 'Active' || doc.status === 'Valid' ? 'var(--green)' : 'var(--blue)',
                  }}>
                    {doc.status}
                  </span>
                </td>
                <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                    <button
                      type="button"
                      className="secondary-button"
                      style={{ fontSize: '12px', padding: '5px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      onClick={() => setViewingDoc(doc)}
                      title="View Document Details"
                    >
                      <Eye size={13} /> View
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      style={{ fontSize: '12px', padding: '5px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      onClick={() => alert(`Downloading ${doc.name}...`)}
                      title="Download Document"
                    >
                      <Download size={13} /> Download
                    </button>
                    {!isWorker && (
                      <>
                        <button
                          type="button"
                          className="secondary-button"
                          style={{ fontSize: '12px', padding: '5px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => setEditingDoc(doc)}
                          title="Edit Document"
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button
                          type="button"
                          className="secondary-button"
                          style={{ fontSize: '12px', padding: '5px 8px', color: '#EF4444', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                          onClick={() => handleDeleteDoc(doc.id)}
                          title="Delete Document"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── View Document Details Modal ── */}
      {viewingDoc && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="panel" style={{ width: '100%', maxWidth: '480px', padding: '28px', borderRadius: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)' }}>{viewingDoc.name}</h2>
                <span style={{ fontSize: '12px', color: 'var(--blue)', fontWeight: 600 }}>{viewingDoc.cat} • {viewingDoc.project}</span>
              </div>
              <button type="button" className="secondary-button" style={{ padding: '4px 8px' }} onClick={() => setViewingDoc(null)}>
                <X size={16} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'var(--panel-soft)', padding: '14px', borderRadius: '12px', fontSize: '13px', marginBottom: '16px' }}>
              <div><span style={{ color: 'var(--muted)', display: 'block', fontSize: '12px' }}>Uploaded By</span><strong>{viewingDoc.uploadedBy}</strong></div>
              <div><span style={{ color: 'var(--muted)', display: 'block', fontSize: '12px' }}>Date</span><strong>{viewingDoc.date}</strong></div>
              <div><span style={{ color: 'var(--muted)', display: 'block', fontSize: '12px' }}>Status</span><strong style={{ color: 'var(--green)' }}>{viewingDoc.status}</strong></div>
              <div><span style={{ color: 'var(--muted)', display: 'block', fontSize: '12px' }}>File Size</span><strong>{viewingDoc.size}</strong></div>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '20px' }}>{viewingDoc.description || 'No additional description provided.'}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" className="primary-button" onClick={() => alert(`Downloading ${viewingDoc.name}...`)}>
                <Download size={15} /> Download File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Document Modal ── */}
      {editingDoc && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="panel" style={{ width: '100%', maxWidth: '480px', padding: '28px', borderRadius: '18px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '14px', color: 'var(--text)' }}>Edit Document Details</h2>
            <form onSubmit={handleEditSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--muted)', marginBottom: '4px', fontWeight: 600 }}>Document Name *</label>
                <input
                  type="text"
                  required
                  style={INPUT}
                  value={editingDoc.name}
                  onChange={e => setEditingDoc({ ...editingDoc, name: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--muted)', marginBottom: '4px', fontWeight: 600 }}>Category</label>
                <select
                  style={INPUT}
                  value={editingDoc.cat}
                  onChange={e => setEditingDoc({ ...editingDoc, cat: e.target.value })}
                >
                  <option value="Drawings">Drawings</option>
                  <option value="Permits">Permits</option>
                  <option value="Contracts">Contracts</option>
                  <option value="Project Files">Project Files</option>
                  <option value="Invoice Storage">Invoice Storage</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--muted)', marginBottom: '4px', fontWeight: 600 }}>Project</label>
                <input
                  type="text"
                  style={INPUT}
                  value={editingDoc.project}
                  onChange={e => setEditingDoc({ ...editingDoc, project: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--muted)', marginBottom: '4px', fontWeight: 600 }}>Status</label>
                <select
                  style={INPUT}
                  value={editingDoc.status}
                  onChange={e => setEditingDoc({ ...editingDoc, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Valid">Valid</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="secondary-button" onClick={() => setEditingDoc(null)}>Cancel</button>
                <button type="submit" className="primary-button">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Upload Document Form Modal ── */}
      {showUploadModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="panel" style={{ width: '100%', maxWidth: '540px', padding: '28px', borderRadius: '18px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '4px', color: 'var(--text)' }}>Upload Document Form</h2>
            <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '20px' }}>Company Document Vault Registration</p>

            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--muted)', marginBottom: '4px', fontWeight: 600 }}>Document Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Site Plan.pdf"
                  style={INPUT}
                  value={newDoc.name}
                  onChange={e => setNewDoc({ ...newDoc, name: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--muted)', marginBottom: '4px', fontWeight: 600 }}>Category ▼</label>
                <select
                  style={INPUT}
                  value={newDoc.cat}
                  onChange={e => setNewDoc({ ...newDoc, cat: e.target.value })}
                >
                  <option value="Drawings">Drawings</option>
                  <option value="Permits">Permits</option>
                  <option value="Contracts">Contracts</option>
                  <option value="Project Files">Project Files</option>
                  <option value="Invoice Storage">Invoice Storage</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--muted)', marginBottom: '4px', fontWeight: 600 }}>Project (Optional)</label>
                <select
                  style={INPUT}
                  value={newDoc.project}
                  onChange={e => setNewDoc({ ...newDoc, project: e.target.value })}
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                  <option value="Metro Tower">Metro Tower</option>
                  <option value="Highway Expansion Zone 4">Highway Expansion Zone 4</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--muted)', marginBottom: '4px', fontWeight: 600 }}>Description</label>
                <textarea
                  placeholder="Brief summary of document content..."
                  rows={3}
                  style={{ ...INPUT, resize: 'vertical' }}
                  value={newDoc.description}
                  onChange={e => setNewDoc({ ...newDoc, description: e.target.value })}
                />
              </div>

              {/* Upload File Dropzone */}
              <div>
                <label style={{ display: 'block', color: 'var(--muted)', marginBottom: '4px', fontWeight: 600 }}>Upload File</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed var(--blue)',
                    borderRadius: '12px',
                    padding: '22px',
                    textAlign: 'center',
                    background: 'var(--panel-soft)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Upload size={32} style={{ color: 'var(--blue)', marginBottom: '6px' }} />
                  <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text)' }}>
                    {selectedFile ? selectedFile.name : 'Click to Browse & Upload File'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                    {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : 'PDF, DWG, DOCX, ZIP, PNG, JPG (Max 50MB)'}
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--muted)', marginBottom: '4px', fontWeight: 600 }}>Tags</label>
                <input
                  type="text"
                  placeholder="e.g. blueprint, site plan"
                  style={INPUT}
                  value={newDoc.tags}
                  onChange={e => setNewDoc({ ...newDoc, tags: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="secondary-button" onClick={() => { setShowUploadModal(false); setSelectedFile(null); }}>Cancel</button>
                <button type="submit" className="primary-button">Upload</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
