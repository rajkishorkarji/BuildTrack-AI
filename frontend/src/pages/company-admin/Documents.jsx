import { useEffect, useRef, useState } from 'react';
import { FileText, Upload, Search, Trash2, Download, FolderOpen, AlertTriangle, CheckCircle2, RefreshCw, Plus } from 'lucide-react';
import documentService from '../../services/documentService';
import projectService from '../../services/projectService';

const FILE_ICONS = {
  pdf: '📄', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊',
  png: '🖼️', jpg: '🖼️', jpeg: '🖼️', mp4: '🎬', zip: '📦',
};

function getIcon(filename) {
  const ext = String(filename || '').split('.').pop().toLowerCase();
  return FILE_ICONS[ext] || '📎';
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '—';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function CompanyAdminDocuments() {
  const [documents, setDocuments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [docs, proj] = await Promise.all([
        documentService.list(),
        projectService.list(),
      ]);
      setDocuments(docs);
      setProjects(proj);
    } catch (e) {
      setError(e?.response?.data?.message || 'Unable to load documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return;
    if (!selectedProject) {
      setError('Please select a project before uploading.');
      return;
    }
    setUploading(true);
    setError('');
    let successCount = 0;
    const errors = [];
    for (const file of Array.from(files)) {
      try {
        await documentService.upload(Number(selectedProject), file);
        successCount++;
      } catch (e) {
        errors.push(e?.response?.data?.message || `Failed to upload ${file.name}`);
      }
    }
    setUploading(false);
    if (successCount > 0) {
      setSuccess(`${successCount} document${successCount > 1 ? 's' : ''} uploaded successfully!`);
      setTimeout(() => setSuccess(''), 4000);
      await loadAll();
    }
    if (errors.length > 0) {
      setError(errors.join(' | '));
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (doc) => {
    if (!window.confirm(`Delete "${doc.fileName || doc.name}"? This cannot be undone.`)) return;
    try {
      await documentService.remove(doc.id);
      setSuccess('Document deleted.');
      setTimeout(() => setSuccess(''), 3000);
      await loadAll();
    } catch (e) {
      setError(e?.response?.data?.message || 'Unable to delete document.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  };

  const filtered = documents.filter(d => {
    const matchSearch = String(d.fileName || d.name || '').toLowerCase().includes(search.toLowerCase());
    const matchProject = !selectedProject || String(d.projectId || d.project?.id || '') === String(selectedProject);
    return matchSearch && matchProject;
  });

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--blue)', fontWeight: 700 }}>
            <FileText size={14} /> Documents
          </p>
          
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="secondary-button" onClick={loadAll} disabled={loading}>
            <RefreshCw size={15} style={loading ? { animation: 'spin 1s linear infinite' } : {}} /> Refresh
          </button>
          <button
            type="button"
            className="primary-button"
            disabled={!selectedProject || uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={15} /> {uploading ? 'Uploading...' : 'Upload Documents'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            style={{ display: 'none' }}
            onChange={e => handleUpload(e.target.files)}
          />
        </div>
      </section>

      {error && (
        <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, color: 'var(--red)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={15} /> {error}
        </div>
      )}
      {success && (
        <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, color: 'var(--green)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={15} /> {success}
        </div>
      )}

      {/* Project selector + search */}
      <div className="panel" style={{ marginTop: 20, padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <select
          value={selectedProject}
          onChange={e => setSelectedProject(e.target.value)}
          style={{ padding: '9px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--text)', fontSize: 13, fontWeight: 600, minWidth: 220 }}
        >
          <option value="">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <div className="search-box" style={{ flex: 1, minWidth: 200 }}>
          <Search size={15} />
          <input placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
          {filtered.length} document{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Drag-and-Drop Upload Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => selectedProject && fileInputRef.current?.click()}
        style={{
          marginTop: 16,
          padding: 28,
          border: `2px dashed ${dragOver ? 'var(--blue)' : 'var(--border)'}`,
          borderRadius: 14,
          textAlign: 'center',
          background: dragOver ? 'rgba(37,99,235,0.06)' : 'var(--panel-soft)',
          cursor: selectedProject ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s ease',
          opacity: selectedProject ? 1 : 0.6,
        }}
      >
        <Upload size={28} style={{ color: 'var(--blue)', marginBottom: 10 }} />
        <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 15 }}>Drop files here or click to upload</div>
        <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4 }}>
          {selectedProject ? 'Supports PDF, Word, Excel, Images and more' : 'Select a project above to enable uploading'}
        </div>
      </div>

      {/* Documents Table */}
      <div className="panel" style={{ marginTop: 16, padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 600, borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--panel-soft)', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                {['File', 'Project', 'Uploaded By', 'Size', 'Date', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Loading documents...</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 40, textAlign: 'center' }}>
                    <FolderOpen size={36} style={{ color: 'var(--muted)', display: 'block', margin: '0 auto 12px' }} />
                    <div style={{ fontWeight: 700, color: 'var(--text)' }}>No documents found</div>
                    <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4 }}>
                      {selectedProject ? 'Upload your first document for this project.' : 'Select a project and upload your first document.'}
                    </div>
                  </td>
                </tr>
              )}
              {!loading && filtered.map(doc => {
                const name = doc.fileName || doc.name || 'Unknown';
                const project = doc.project?.name || projects.find(p => String(p.id) === String(doc.projectId))?.name || '—';
                const uploadedBy = doc.uploadedBy?.fullName || doc.uploadedByName || '—';
                const size = formatBytes(doc.fileSize || doc.size);
                const date = doc.uploadedAt || doc.createdAt
                  ? new Date(doc.uploadedAt || doc.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                  : '—';
                return (
                  <tr key={doc.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 20 }}>{getIcon(name)}</span>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text)' }}>{name}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{String(name).split('.').pop().toUpperCase()}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: 14, color: 'var(--blue)', fontWeight: 600 }}>{project}</td>
                    <td style={{ padding: 14, color: 'var(--muted)' }}>{uploadedBy}</td>
                    <td style={{ padding: 14, color: 'var(--muted)' }}>{size}</td>
                    <td style={{ padding: 14, color: 'var(--muted)' }}>{date}</td>
                    <td style={{ padding: 14 }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {doc.fileUrl || doc.url ? (
                          <a
                            href={documentService.downloadUrl(doc.fileUrl || doc.url)}
                            target="_blank"
                            rel="noreferrer"
                            className="secondary-button"
                            style={{ fontSize: 11, padding: '4px 10px', textDecoration: 'none' }}
                          >
                            <Download size={12} /> Download
                          </a>
                        ) : null}
                        <button
                          className="secondary-button"
                          style={{ fontSize: 11, padding: '4px 10px', color: 'var(--red)', borderColor: 'rgba(239,68,68,0.3)' }}
                          onClick={() => handleDelete(doc)}
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
