import { useEffect, useMemo, useRef, useState } from 'react';
import { FileText, Upload, Download, Trash2, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import documentService from '../services/documentService';

export default function Step7Documents() {
  const { user } = useAuth();
  const { projects = [] } = useData();
  const [documents, setDocuments] = useState([]);
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const input = useRef(null);

  const load = async () => { try { setDocuments(await documentService.list()); } catch (e) { console.error(e); } };
  useEffect(() => { load(); }, []);
  useEffect(() => { if (!projectId && projects[0]?.id) setProjectId(projects[0].id); }, [projects, projectId]);

  const filtered = useMemo(() => documents.filter(d => (d.title || '').toLowerCase().includes(search.toLowerCase())), [documents, search]);
  const canUpload = ['SUPER_ADMIN','COMPANY_ADMIN','PROJECT_MANAGER','SITE_ENGINEER','CONTRACTOR'].includes(user?.role);

  const upload = async (e) => {
    const file = e.target.files?.[0]; e.target.value = '';
    if (!file || !projectId) return;
    setBusy(true);
    try { const saved = await documentService.upload(projectId, file); setDocuments(prev => [saved, ...prev]); } catch (err) { alert(err?.response?.data?.message || 'Upload failed'); } finally { setBusy(false); }
  };
  const remove = async (id) => {
    if (!window.confirm('Delete this document?')) return;
    try { await documentService.remove(id); setDocuments(prev => prev.filter(d => d.id !== id)); } catch (err) { alert(err?.response?.data?.message || 'Delete failed'); }
  };

  return <div className="dashboard-page">
    <section className="hero-row"><div><p className="eyebrow"><FileText size={14} /> Documents</p><h1>Project Document Vault</h1></div>
      {canUpload && <><input ref={input} type="file" hidden onChange={upload} /><button className="primary-button" disabled={busy || !projectId} onClick={() => input.current?.click()}><Upload size={16}/> {busy ? 'Uploading…' : 'Upload Document'}</button></>}
    </section>
    <div className="panel" style={{marginTop:20,padding:16,display:'flex',gap:12,flexWrap:'wrap'}}>
      <div className="search-box" style={{width:300}}><Search size={14}/><input placeholder="Search documents…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
      <select value={projectId} onChange={e=>setProjectId(e.target.value)} style={{padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',background:'var(--panel)',color:'var(--text)'}}><option value="">All / select project</option>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
    </div>
    <div className="panel" style={{marginTop:16,padding:0,overflow:'hidden'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}><thead><tr style={{background:'var(--panel-soft)'}}><th style={{padding:14,textAlign:'left'}}>Document</th><th style={{padding:14,textAlign:'left'}}>Project</th><th style={{padding:14,textAlign:'left'}}>Uploaded By</th><th style={{padding:14,textAlign:'left'}}>Date</th><th style={{padding:14,textAlign:'right'}}>Actions</th></tr></thead><tbody>{filtered.map(d=><tr key={d.id} style={{borderTop:'1px solid var(--border)'}}><td style={{padding:14,fontWeight:700}}><FileText size={15}/> {d.title}</td><td style={{padding:14}}>{d.projectName || '—'}</td><td style={{padding:14}}>{d.uploadedBy || '—'}</td><td style={{padding:14,color:'var(--muted)'}}>{d.createdAt ? new Date(d.createdAt).toLocaleString() : '—'}</td><td style={{padding:14,textAlign:'right'}}><div style={{display:'inline-flex',gap:6}}><a className="secondary-button" href={d.fileUrl} target="_blank" rel="noreferrer"><Download size={13}/> Download</a>{canUpload && <button className="secondary-button" onClick={()=>remove(d.id)}><Trash2 size={13}/></button>}</div></td></tr>)}{filtered.length===0&&<tr><td colSpan="5" style={{padding:40,textAlign:'center',color:'var(--muted)'}}>No documents found.</td></tr>}</tbody></table></div>
  </div>;
}
