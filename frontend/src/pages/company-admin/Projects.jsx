import { useEffect, useMemo, useState } from 'react';
import { Calendar, Eye, FolderKanban, Plus, Search, Trash2, Users, X } from 'lucide-react';
import projectService from '../../services/projectService';
import { formatINR } from '../../utils/currency';

const ROLES = [
  ['PROJECT_MANAGER', 'Project Manager'],
  ['SITE_ENGINEER', 'Site Engineer'],
  ['CONTRACTOR', 'Contractor'],
  ['WORKER', 'Worker'],
];

const emptyForm = {
  name: '', code: '', location: '', description: '', budget: '', startDate: '', estEndDate: '',
};

export default function CompanyAdminProjects() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [selected, setSelected] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [eligible, setEligible] = useState([]);
  const [role, setRole] = useState('PROJECT_MANAGER');
  const [selectedUser, setSelectedUser] = useState('');

  const loadProjects = async () => {
    setLoading(true); setError('');
    try { setProjects(await projectService.list()); }
    catch (e) { setError(e.response?.data?.message || e.message || 'Unable to load projects'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadProjects(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(p => [p.name, p.code, p.location, p.status].some(v => String(v || '').toLowerCase().includes(q)));
  }, [projects, search]);

  const create = async (e) => {
    e.preventDefault(); setBusy(true); setError('');
    try {
      await projectService.create({ ...form, budget: Number(form.budget || 0) });
      setForm(emptyForm); setShowCreate(false); await loadProjects();
    } catch (e) { setError(e.response?.data?.message || e.message || 'Unable to create project'); }
    finally { setBusy(false); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this project? All project assignments will also be removed.')) return;
    try { await projectService.remove(id); setSelected(null); await loadProjects(); }
    catch (e) { setError(e.response?.data?.message || e.message || 'Unable to delete project'); }
  };

  const openAssignments = async (project) => {
    setSelected(project); setError(''); setRole('PROJECT_MANAGER'); setSelectedUser('');
    try { setAssignments(await projectService.assignments(project.id)); await loadEligible('PROJECT_MANAGER'); }
    catch (e) { setError(e.response?.data?.message || e.message || 'Unable to load assignments'); }
  };

  const loadEligible = async (nextRole) => {
    setRole(nextRole); setSelectedUser('');
    try { setEligible(await projectService.eligibleUsers(nextRole)); }
    catch (e) { setEligible([]); setError(e.response?.data?.message || e.message || 'Unable to load eligible users'); }
  };

  const assign = async () => {
    if (!selected || !selectedUser) return;
    setBusy(true); setError('');
    try {
      await projectService.assign(selected.id, Number(selectedUser), role);
      setAssignments(await projectService.assignments(selected.id));
      setSelectedUser('');
    } catch (e) { setError(e.response?.data?.message || e.message || 'Unable to assign personnel'); }
    finally { setBusy(false); }
  };

  const unassign = async (userId) => {
    if (!selected) return;
    try { await projectService.unassign(selected.id, userId); setAssignments(await projectService.assignments(selected.id)); }
    catch (e) { setError(e.response?.data?.message || e.message || 'Unable to remove assignment'); }
  };

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{display:'inline-flex',alignItems:'center',gap:6,color:'var(--blue)',fontWeight:700}}><FolderKanban size={14}/> Projects</p>
          <h1>Project Management</h1>
          <p>Create company projects and assign the right personnel to each site.</p>
        </div>
        <button className="primary-button" onClick={() => setShowCreate(true)}><Plus size={16}/> Create Project</button>
      </section>

      {error && <div className="panel" style={{marginTop:16,borderColor:'var(--orange)',color:'var(--orange)'}}>{error}</div>}

      <div className="panel" style={{marginTop:20,padding:16,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div className="search-box" style={{width:380}}><Search size={16}/><input placeholder="Search project, code, location..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
        <strong style={{fontSize:12,color:'var(--muted)'}}>{filtered.length} project{filtered.length === 1 ? '' : 's'}</strong>
      </div>

      <div className="panel" style={{marginTop:16,padding:0,overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
          <thead><tr style={{background:'var(--panel-soft)',color:'var(--muted)'}}>
            {['Project','Location','Budget','Progress','Status','Assignments','Actions'].map(h=><th key={h} style={{padding:'14px 16px',textAlign:'left'}}>{h}</th>)}
          </tr></thead>
          <tbody>
            {!loading && filtered.length === 0 && <tr><td colSpan="7" style={{padding:40,textAlign:'center',color:'var(--muted)'}}>No projects found.</td></tr>}
            {loading && <tr><td colSpan="7" style={{padding:40,textAlign:'center'}}>Loading projects…</td></tr>}
            {filtered.map(p => (
              <tr key={p.id} style={{borderTop:'1px solid var(--border)'}}>
                <td style={{padding:'14px 16px'}}><strong>{p.name}</strong><div style={{fontSize:11,color:'var(--blue)',marginTop:4}}>{p.code || `PRJ-${p.id}`}</div></td>
                <td style={{padding:14,color:'var(--muted)'}}>{p.location || '—'}</td>
                <td style={{padding:14,fontWeight:700}}>{formatINR(p.budget)}</td>
                <td style={{padding:14}}><div style={{display:'flex',gap:8,alignItems:'center'}}><div style={{width:100,height:6,background:'var(--panel-soft)',borderRadius:3}}><div style={{width:`${p.progressPercentage || 0}%`,height:'100%',background:'var(--blue)',borderRadius:3}}/></div><b>{p.progressPercentage || 0}%</b></div></td>
                <td style={{padding:14}}><span style={{padding:'4px 9px',borderRadius:10,background:'rgba(34,197,94,.12)',color:'var(--green)',fontSize:11,fontWeight:700}}>{p.status}</span></td>
                <td style={{padding:14}}><span style={{display:'inline-flex',alignItems:'center',gap:5}}><Users size={14}/>{p.assignments?.length || 0}</span></td>
                <td style={{padding:'14px 16px',display:'flex',gap:7}}>
                  <button className="secondary-button" onClick={()=>openAssignments(p)}><Users size={13}/> Assign</button>
                  <button className="secondary-button" onClick={()=>setSelected(p)}><Eye size={13}/> View</button>
                  <button className="secondary-button" style={{color:'#EF4444'}} onClick={()=>remove(p.id)}><Trash2 size={13}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && <div className="modal-backdrop" style={overlay}>
        <div className="panel" style={modal}>
          <div style={header}><div><h2>Create Project</h2><p>Project belongs to your company.</p></div><button className="secondary-button" onClick={()=>setShowCreate(false)}><X size={16}/></button></div>
          <form onSubmit={create} style={grid}>
            <label>Project name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
            <label>Project code<input value={form.code} placeholder="e.g. METRO-T1" onChange={e=>setForm({...form,code:e.target.value.toUpperCase()})}/></label>
            <label>Location<input value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/></label>
            <label>Budget (₹)<input required type="number" min="0" value={form.budget} onChange={e=>setForm({...form,budget:e.target.value})}/></label>
            <label>Start date<input type="date" value={form.startDate} onChange={e=>setForm({...form,startDate:e.target.value})}/></label>
            <label>Estimated end date<input type="date" value={form.estEndDate} onChange={e=>setForm({...form,estEndDate:e.target.value})}/></label>
            <label style={{gridColumn:'1/-1'}}>Description<textarea rows="3" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label>
            <div style={{gridColumn:'1/-1',display:'flex',justifyContent:'flex-end',gap:10}}><button type="button" className="secondary-button" onClick={()=>setShowCreate(false)}>Cancel</button><button className="primary-button" disabled={busy}>{busy?'Creating…':'Create Project'}</button></div>
          </form>
        </div>
      </div>}

      {selected && <div style={overlay}>
        <div className="panel" style={{...modal,maxWidth:820}}>
          <div style={header}><div><h2>{selected.name}</h2><p>{selected.code || `PRJ-${selected.id}`} · {selected.location || 'No location'}</p></div><button className="secondary-button" onClick={()=>setSelected(null)}><X size={16}/></button></div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:20}}>
            <div className="panel" style={{padding:14}}><small>Budget</small><div style={{fontWeight:800,fontSize:18}}>{formatINR(selected.budget)}</div></div>
            <div className="panel" style={{padding:14}}><small>Progress</small><div style={{fontWeight:800,fontSize:18}}>{selected.progressPercentage || 0}%</div></div>
            <div className="panel" style={{padding:14}}><small>Status</small><div style={{fontWeight:800,fontSize:18}}>{selected.status}</div></div>
          </div>
          <h3 style={{marginBottom:10}}>Project assignments</h3>
          <div style={{display:'flex',gap:8,marginBottom:16}}>
            <select value={role} onChange={e=>loadEligible(e.target.value)} style={{flex:1}}>{ROLES.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>
            <select value={selectedUser} onChange={e=>setSelectedUser(e.target.value)} style={{flex:2}}><option value="">Select {ROLES.find(r=>r[0]===role)?.[1]}</option>{eligible.map(u=><option key={u.id} value={u.id}>{u.fullName} — {u.email}</option>)}</select>
            <button className="primary-button" disabled={!selectedUser || busy} onClick={assign}>Assign</button>
          </div>
          <div style={{display:'grid',gap:8}}>{assignments.length===0 ? <p style={{color:'var(--muted)'}}>No personnel assigned yet.</p> : assignments.map(a=><div key={a.assignmentId} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 12px',border:'1px solid var(--border)',borderRadius:8}}><div><strong>{a.fullName}</strong><div style={{fontSize:12,color:'var(--muted)'}}>{a.email} · {a.role.replaceAll('_',' ')}</div></div><button className="secondary-button" style={{color:'#EF4444'}} onClick={()=>unassign(a.userId)}>Remove</button></div>)}</div>
        </div>
      </div>}
    </div>
  );
}

const overlay = {position:'fixed',inset:0,background:'rgba(0,0,0,.65)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:20};
const modal = {width:'100%',maxWidth:760,maxHeight:'90vh',overflowY:'auto',padding:26,borderRadius:16};
const header = {display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20};
const grid = {display:'grid',gridTemplateColumns:'1fr 1fr',gap:14};
