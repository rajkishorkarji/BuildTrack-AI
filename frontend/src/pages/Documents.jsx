import { useEffect, useRef, useState } from 'react';
import { Download, Upload, Trash2, FileText, Search } from 'lucide-react';
import documentService from '../services/documentService';
import projectService from '../services/projectService';
import { useAuth } from '../context/AuthContext';

export default function Documents() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [projectId, setProjectId] = useState('');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  const load = async () => {
    const [docs, projectRows] = await Promise.all([documentService.list(), projectService.list()]);
    setDocuments(docs);
    setProjects(projectRows);
    if (!projectId && projectRows[0]?.id) setProjectId(projectRows[0].id);
  };

  useEffect(() => { load().catch(() => {}); }, []);

  const filtered = documents.filter((doc) =>
    `${doc.title || doc.name || ''} ${doc.projectName || ''} ${doc.uploadedBy || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const upload = async (e) => {
    e.preventDefault();
    if (!file || !projectId) return;
    setBusy(true);
    try {
      const created = await documentService.upload(projectId, file);
      setDocuments((current) => [created, ...current]);
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this document?')) return;
    await documentService.remove(id);
    setDocuments((current) => current.filter((doc) => doc.id !== id));
  };

  const canManage = ['SUPER_ADMIN', 'COMPANY_ADMIN', 'PROJECT_MANAGER', 'SITE_ENGINEER', 'CONTRACTOR'].includes(user?.role);

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div><p className="eyebrow">Document Vault</p></div>
      </section>

      <div className="panel" style={{ marginTop: 20 }}>
        <div style={{ display: 'grid', gap: 12 }}>
          <div className="search-box"><Search size={14} /><input placeholder="Search documents..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          {canManage && <form onSubmit={upload} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)} required><option value="">Select project</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
            <input ref={inputRef} type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
            <button className="primary-button" disabled={busy} type="submit"><Upload size={15} /> {busy ? 'Uploading…' : 'Upload'}</button>
          </form>}
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16, padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? <div style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}><FileText size={32} /><p>No documents found.</p></div> : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr style={{ background: 'var(--panel-soft)', color: 'var(--muted)', textAlign: 'left' }}><th style={{ padding: 14 }}>Document</th><th style={{ padding: 14 }}>Project</th><th style={{ padding: 14 }}>Uploaded By</th><th style={{ padding: 14 }}>Actions</th></tr></thead>
            <tbody>{filtered.map((doc) => { const name = doc.title || doc.name; const url = doc.fileUrl || doc.storedUrl; return <tr key={doc.id} style={{ borderBottom: '1px solid var(--border)' }}><td style={{ padding: 14 }}>{name}</td><td style={{ padding: 14 }}>{doc.projectName || '—'}</td><td style={{ padding: 14 }}>{doc.uploadedBy || '—'}</td><td style={{ padding: 14, display: 'flex', gap: 8 }}>{url && <a className="secondary-button" href={url} target="_blank" rel="noreferrer"><Download size={14} /> Download</a>}{canManage && <button className="secondary-button" onClick={() => remove(doc.id)}><Trash2 size={14} /> Delete</button>}</td></tr>; })}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
