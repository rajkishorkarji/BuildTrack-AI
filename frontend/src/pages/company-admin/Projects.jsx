import { useEffect, useMemo, useState } from 'react';
import { Calendar, Eye, FolderKanban, Plus, Search, Trash2, Users, X, MapPin, Edit3, ShieldCheck } from 'lucide-react';
import projectService from '../../services/projectService';
import { formatINR } from '../../utils/currency';
import LocationMapPicker from '../../components/common/LocationMapPicker';

const ROLES = [
  ['PROJECT_MANAGER', 'Project Manager'],
  ['SITE_ENGINEER', 'Site Engineer'],
  ['CONTRACTOR', 'Contractor'],
  ['WORKER', 'Worker'],
];

const emptyForm = {
  name: '', code: '', location: '', description: '', budget: '', startDate: '', estEndDate: '',
  latitude: '', longitude: '', geofenceRadiusMeters: 100,
};

const getProjectStatusBadge = (p) => {
  if (!p) return null;
  const pct = Math.round(p.progressPercentage || p.progress || 0);
  let label = 'PLANNED';
  let color = 'var(--muted)';
  let bg = 'rgba(148,163,184,0.14)';

  if (pct >= 100 || p.status === 'COMPLETED') {
    label = 'COMPLETED';
    color = 'var(--green)';
    bg = 'rgba(34,197,94,0.14)';
  } else if (pct >= 75) {
    label = 'FINISHING';
    color = '#8b5cf6';
    bg = 'rgba(139,92,246,0.14)';
  } else if (pct >= 25) {
    label = 'IN PROGRESS';
    color = 'var(--blue)';
    bg = 'rgba(37,99,235,0.14)';
  } else if (pct > 0) {
    label = 'EARLY STAGE';
    color = 'var(--orange)';
    bg = 'rgba(245,158,11,0.14)';
  }
  return (
    <span style={{ padding: '3px 10px', borderRadius: 8, background: bg, color, fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center' }}>
      {label}
    </span>
  );
};

export default function CompanyAdminProjects() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [selected, setSelected] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [eligible, setEligible] = useState([]);
  const [role, setRole] = useState('PROJECT_MANAGER');
  const [selectedUser, setSelectedUser] = useState('');

  const loadProjects = async () => {
    setLoading(true); setError('');
    try { 
      const list = await projectService.list();
      setProjects(list);
      if (selected) {
        const fresh = list.find(p => p.id === selected.id);
        if (fresh) setSelected(fresh);
      }
    }
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
      await projectService.create({
        ...form,
        budget: Number(form.budget || 0),
        latitude: form.latitude !== '' && form.latitude != null ? Number(form.latitude) : null,
        longitude: form.longitude !== '' && form.longitude != null ? Number(form.longitude) : null,
        geofenceRadiusMeters: form.geofenceRadiusMeters ? Number(form.geofenceRadiusMeters) : 100,
      });
      setForm(emptyForm); setShowCreate(false); await loadProjects();
    } catch (e) { setError(e.response?.data?.message || e.message || 'Unable to create project'); }
    finally { setBusy(false); }
  };

  const openEdit = (project) => {
    setEditingProject(project);
    setForm({
      name: project.name || '',
      code: project.code || '',
      location: project.location || '',
      description: project.description || '',
      budget: project.budget != null ? String(project.budget) : '',
      startDate: project.startDate || '',
      estEndDate: project.estEndDate || '',
      latitude: project.latitude != null ? String(project.latitude) : '',
      longitude: project.longitude != null ? String(project.longitude) : '',
      geofenceRadiusMeters: project.geofenceRadiusMeters || 100,
    });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editingProject) return;
    setBusy(true); setError('');
    try {
      await projectService.update(editingProject.id, {
        ...form,
        budget: Number(form.budget || 0),
        latitude: form.latitude !== '' && form.latitude != null ? Number(form.latitude) : null,
        longitude: form.longitude !== '' && form.longitude != null ? Number(form.longitude) : null,
        geofenceRadiusMeters: form.geofenceRadiusMeters ? Number(form.geofenceRadiusMeters) : 100,
      });
      setEditingProject(null);
      setForm(emptyForm);
      await loadProjects();
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Unable to update project');
    } finally {
      setBusy(false);
    }
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

  const changeStatus = async (projectId, status) => {
    try {
      await projectService.updateStatus(projectId, status);
      await loadProjects();
    } catch (e) { setError(e.response?.data?.message || e.message || 'Unable to update status'); }
  };

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow" style={{display:'inline-flex',alignItems:'center',gap:6,color:'var(--blue)',fontWeight:700}}><FolderKanban size={14}/> Projects</p>
        </div>
        <button className="primary-button" onClick={() => { setForm(emptyForm); setShowCreate(true); }}><Plus size={16}/> Create Project</button>
      </section>

      {error && <div className="panel" style={{marginTop:16,borderColor:'var(--orange)',color:'var(--orange)'}}>{error}</div>}

      <div className="panel" style={{marginTop:20,padding:16,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div className="search-box" style={{width:380}}><Search size={16}/><input placeholder="Search project, code, location..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
        <strong style={{fontSize:12,color:'var(--muted)'}}>{filtered.length} project{filtered.length === 1 ? '' : 's'}</strong>
      </div>

      <div className="panel" style={{marginTop:16,padding:0,overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
          <thead><tr style={{background:'var(--panel-soft)',color:'var(--muted)'}}>
            {['Project','Location & Geofence','Budget','Progress','Status','Assignments','Actions'].map(h=><th key={h} style={{padding:'14px 16px',textAlign:'left'}}>{h}</th>)}
          </tr></thead>
          <tbody>
            {!loading && filtered.length === 0 && <tr><td colSpan="7" style={{padding:40,textAlign:'center',color:'var(--muted)'}}>No projects found.</td></tr>}
            {loading && <tr><td colSpan="7" style={{padding:40,textAlign:'center'}}>Loading projects…</td></tr>}
            {filtered.map(p => (
              <tr key={p.id} style={{borderTop:'1px solid var(--border)'}}>
                <td style={{padding:'14px 16px'}}><strong>{p.name}</strong><div style={{fontSize:11,color:'var(--blue)',marginTop:4}}>{p.code || `PRJ-${p.id}`}</div></td>
                <td style={{padding:14,color:'var(--muted)'}}>
                  <div>{p.location || '—'}</div>
                  {p.latitude != null && p.longitude != null ? (
                    <div style={{fontSize:11,color:'var(--green)',marginTop:4,display:'inline-flex',alignItems:'center',gap:4}}>
                      <ShieldCheck size={12}/> Geofenced ({p.geofenceRadiusMeters || 100}m)
                    </div>
                  ) : (
                    <div style={{display:'flex',alignItems:'center',gap:6,marginTop:4}}>
                      <span style={{fontSize:11,color:'var(--muted)'}}>No GPS Geofence</span>
                      <button
                        type="button"
                        onClick={()=>openEdit(p)}
                        style={{fontSize:10,padding:'2px 6px',borderRadius:4,background:'var(--panel-soft)',border:'1px solid var(--border)',color:'var(--blue)',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:3}}
                      >
                        <MapPin size={10}/> Set Pin
                      </button>
                    </div>
                  )}
                </td>
                <td style={{padding:14,fontWeight:700}}>{formatINR(p.budget)}</td>
                <td style={{padding:14}}><div style={{display:'flex',gap:8,alignItems:'center'}}><div style={{width:100,height:6,background:'var(--panel-soft)',borderRadius:3}}><div style={{width:`${p.progressPercentage || 0}%`,height:'100%',background:'var(--blue)',borderRadius:3}}/></div><b>{p.progressPercentage || 0}%</b></div></td>
                <td style={{padding:14}}>{getProjectStatusBadge(p)}</td>
                <td style={{padding:14}}><span style={{display:'inline-flex',alignItems:'center',gap:5}}><Users size={14}/>{p.assignments?.length || 0}</span></td>
                <td style={{padding:'14px 16px',display:'flex',gap:7}}>
                  <button className="secondary-button" title="Assign personnel" onClick={()=>openAssignments(p)}><Users size={13}/> Assign</button>
                  <button className="secondary-button" title="Edit project & geofence" onClick={()=>openEdit(p)}><Edit3 size={13}/> Edit</button>
                  <button className="secondary-button" title="View details" onClick={()=>setSelected(p)}><Eye size={13}/> View</button>
                  <button className="secondary-button" style={{color:'#EF4444'}} onClick={()=>remove(p.id)}><Trash2 size={13}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CREATE PROJECT MODAL */}
      {showCreate && <div className="modal-backdrop" style={overlay}>
        <div className="panel" style={modal}>
          <div style={header}><div><h2>Create Project</h2></div><button className="secondary-button" onClick={()=>setShowCreate(false)}><X size={16}/></button></div>
          <form onSubmit={create} style={grid}>
            <label>Project name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
            <label>Project code<input value={form.code} placeholder="e.g. METRO-T1" onChange={e=>setForm({...form,code:e.target.value.toUpperCase()})}/></label>
            <label>City / Region<input value={form.location} placeholder="e.g. Berhampur, Odisha" onChange={e=>setForm({...form,location:e.target.value})}/></label>
            <label>Budget (₹)<input required type="number" min="0" value={form.budget} onChange={e=>setForm({...form,budget:e.target.value})}/></label>
            <label>Start date<input type="date" value={form.startDate} onChange={e=>setForm({...form,startDate:e.target.value})}/></label>
            <label>Estimated end date<input type="date" value={form.estEndDate} onChange={e=>setForm({...form,estEndDate:e.target.value})}/></label>
            <label style={{gridColumn:'1/-1'}}>Description<textarea rows="2" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label>

            {/* Interactive Visual Map & Geofence Picker */}
            <div style={{gridColumn:'1/-1',borderTop:'1px solid var(--border)',paddingTop:14,marginTop:4}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                <div style={{display:'flex',alignItems:'center',gap:6,fontWeight:700,fontSize:13,color:'var(--blue)'}}>
                  <ShieldCheck size={16}/> Site Map & Physical Geofence Boundary
                </div>
              </div>
              <p style={{fontSize:11,color:'var(--muted)',marginBottom:10,lineHeight:1.4}}>
                Type the site location/city in the map search bar or tap directly on the map to position the construction site pin. Workers can only clock in within the boundary circle.
              </p>
              <LocationMapPicker
                initialLat={form.latitude}
                initialLng={form.longitude}
                initialRadius={Number(form.geofenceRadiusMeters) || 100}
                initialLocationText={form.location}
                onChange={({ latitude, longitude, geofenceRadiusMeters, address }) => {
                  setForm(prev => ({
                    ...prev,
                    latitude: String(latitude),
                    longitude: String(longitude),
                    geofenceRadiusMeters: geofenceRadiusMeters,
                    location: prev.location || address || '',
                  }));
                }}
              />
            </div>

            <div style={{gridColumn:'1/-1',display:'flex',justifyContent:'flex-end',gap:10,marginTop:10}}>
              <button type="button" className="secondary-button" onClick={()=>setShowCreate(false)}>Cancel</button>
              <button className="primary-button" disabled={busy}>{busy?'Creating…':'Create Project'}</button>
            </div>
          </form>
        </div>
      </div>}

      {/* EDIT PROJECT & GEOFENCE MODAL */}
      {editingProject && <div className="modal-backdrop" style={overlay}>
        <div className="panel" style={modal}>
          <div style={header}><div><h2>Edit Project & Geofence</h2><p style={{fontSize:12,color:'var(--muted)',marginTop:2}}>{editingProject.name} ({editingProject.code || `PRJ-${editingProject.id}`})</p></div><button className="secondary-button" onClick={()=>setEditingProject(null)}><X size={16}/></button></div>
          <form onSubmit={saveEdit} style={grid}>
            <label>Project name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
            <label>Project code<input value={form.code} placeholder="e.g. METRO-T1" onChange={e=>setForm({...form,code:e.target.value.toUpperCase()})}/></label>
            <label>City / Region<input value={form.location} placeholder="e.g. Berhampur, Odisha" onChange={e=>setForm({...form,location:e.target.value})}/></label>
            <label>Budget (₹)<input required type="number" min="0" value={form.budget} onChange={e=>setForm({...form,budget:e.target.value})}/></label>
            <label>Start date<input type="date" value={form.startDate} onChange={e=>setForm({...form,startDate:e.target.value})}/></label>
            <label>Estimated end date<input type="date" value={form.estEndDate} onChange={e=>setForm({...form,estEndDate:e.target.value})}/></label>
            <label style={{gridColumn:'1/-1'}}>Description<textarea rows="2" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label>

            {/* Interactive Visual Map & Geofence Picker */}
            <div style={{gridColumn:'1/-1',borderTop:'1px solid var(--border)',paddingTop:14,marginTop:4}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                <div style={{display:'flex',alignItems:'center',gap:6,fontWeight:700,fontSize:13,color:'var(--blue)'}}>
                  <ShieldCheck size={16}/> Site Map & Physical Geofence Boundary
                </div>
              </div>
              <p style={{fontSize:11,color:'var(--muted)',marginBottom:10,lineHeight:1.4}}>
                Search city/address or click/drag the pin on the map to adjust the construction site and geofence perimeter.
              </p>
              <LocationMapPicker
                initialLat={form.latitude}
                initialLng={form.longitude}
                initialRadius={Number(form.geofenceRadiusMeters) || 100}
                initialLocationText={form.location}
                onChange={({ latitude, longitude, geofenceRadiusMeters, address }) => {
                  setForm(prev => ({
                    ...prev,
                    latitude: String(latitude),
                    longitude: String(longitude),
                    geofenceRadiusMeters: geofenceRadiusMeters,
                    location: prev.location || address || '',
                  }));
                }}
              />
            </div>

            <div style={{gridColumn:'1/-1',display:'flex',justifyContent:'flex-end',gap:10,marginTop:10}}>
              <button type="button" className="secondary-button" onClick={()=>setEditingProject(null)}>Cancel</button>
              <button className="primary-button" disabled={busy}>{busy?'Saving Changes…':'Save Changes'}</button>
            </div>
          </form>
        </div>
      </div>}

      {/* VIEW DETAILS MODAL */}
      {selected && <div style={overlay}>
        <div className="panel" style={{...modal,maxWidth:820}}>
          <div style={header}>
            <div>
              <h2>{selected.name}</h2>
              <p>{selected.code || `PRJ-${selected.id}`} · {selected.location || 'No location'}</p>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button className="secondary-button" onClick={()=>{ const cur = selected; setSelected(null); openEdit(cur); }}><Edit3 size={14}/> Edit Geofence</button>
              <button className="secondary-button" onClick={()=>setSelected(null)}><X size={16}/></button>
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
            <div className="panel" style={{padding:14}}><small>Budget</small><div style={{fontWeight:800,fontSize:18}}>{formatINR(selected.budget)}</div></div>
            <div className="panel" style={{padding:14}}><small>Progress</small><div style={{fontWeight:800,fontSize:18}}>{selected.progressPercentage || 0}%</div></div>
            <div className="panel" style={{padding:14}}><small>Status</small><div style={{marginTop:4}}>{getProjectStatusBadge(selected)}</div></div>
            <div className="panel" style={{padding:14}}><small>GPS Geofence</small><div style={{fontWeight:800,fontSize:14,color:selected.latitude!=null?'var(--green)':'var(--muted)',marginTop:3}}>{selected.latitude!=null?`Active (${selected.geofenceRadiusMeters||100}m)`:'Unconstrained'}</div></div>
          </div>
          {selected.latitude != null ? (
            <div className="panel" style={{padding:'10px 14px',marginBottom:16,fontSize:12,display:'flex',alignItems:'center',gap:10,background:'var(--panel-soft)'}}>
              <MapPin size={15} style={{color:'var(--blue)'}}/>
              <span><strong>Site Coordinates:</strong> {Number(selected.latitude).toFixed(5)}, {Number(selected.longitude).toFixed(5)} · <strong>Radius:</strong> {selected.geofenceRadiusMeters || 100} meters</span>
            </div>
          ) : (
            <div className="panel" style={{padding:'10px 14px',marginBottom:16,fontSize:12,display:'flex',justifyContent:'space-between',alignItems:'center',background:'var(--panel-soft)'}}>
              <span style={{color:'var(--muted)'}}>No physical GPS geofence configured for this project.</span>
              <button className="secondary-button" style={{fontSize:11,padding:'4px 8px'}} onClick={()=>{ const cur = selected; setSelected(null); openEdit(cur); }}><MapPin size={12}/> Configure Geofence</button>
            </div>
          )}
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

