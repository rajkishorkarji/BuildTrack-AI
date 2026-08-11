import { useEffect, useState } from 'react';
import { Plus, Search, Wrench } from 'lucide-react';
import equipmentService from '../../services/equipmentService';
import projectService from '../../services/projectService';
import workforceService from '../../services/workforceService';

const INPUT = { width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid var(--border)', background:'var(--panel-soft)', color:'var(--text)', fontSize:13 };

export default function CompanyAdminEquipment() {
  const [equipment,setEquipment]=useState([]);
  const [projects,setProjects]=useState([]);
  const [workforce,setWorkforce]=useState([]);
  const [search,setSearch]=useState('');
  const [open,setOpen]=useState(false);
  const [form,setForm]=useState({name:'',category:'Heavy Machinery',serialNumber:'',dailyCost:'0',projectId:''});
  const [error,setError]=useState('');

  const load=async()=>{ setEquipment(await equipmentService.list()); setProjects(await projectService.list()); setWorkforce(await workforceService.list()); };
  useEffect(()=>{load().catch(e=>setError(e?.response?.data?.message||'Unable to load equipment'));},[]);

  const create=async e=>{
    e.preventDefault(); setError('');
    try{
      await equipmentService.create({
        name:form.name, category:form.category, serialNumber:form.serialNumber||null,
        dailyCost:Number(form.dailyCost||0), project:{id:Number(form.projectId)}, status:'OPERATIONAL'
      });
      setOpen(false); setForm({name:'',category:'Heavy Machinery',serialNumber:'',dailyCost:'0',projectId:''}); await load();
    }catch(err){setError(err?.response?.data?.message||'Unable to register equipment');}
  };
  const filtered=equipment.filter(x=>[x.name,x.serialNumber,x.category].join(' ').toLowerCase().includes(search.toLowerCase()));
  const assignedCount=equipment.filter(x=>x.assignedUser).length;

  return <div className="dashboard-page">
    <section className="hero-row"><div><p className="eyebrow"><Wrench size={14}/> Equipment</p></div><button className="primary-button" onClick={()=>setOpen(true)}><Plus size={16}/> Register Equipment</button></section>
    {error&&<div className="panel" style={{marginTop:16,color:'var(--red)'}}>{error}</div>}
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginTop:20}}>
      <div className="panel"><span>Total Fleet</span><h3>{equipment.length}</h3></div>
      <div className="panel"><span>Assigned</span><h3>{assignedCount}</h3></div>
      <div className="panel"><span>Maintenance</span><h3>{equipment.filter(x=>x.status==='IN_MAINTENANCE').length}</h3></div>
    </div>
    <div style={{marginTop:20}} className="search-box"><Search size={15}/><input placeholder="Search equipment..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
    <div className="panel" style={{marginTop:16,padding:0,overflow:'auto'}}>
      <table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr><th>Equipment</th><th>Project</th><th>Assigned User</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>{filtered.map(x=><tr key={x.id}>
        <td>{x.name}<br/><small>{x.serialNumber||`EQ-${x.id}`}</small></td>
        <td>{x.project?.name||'—'}</td>
        <td>{x.assignedUser ? `${x.assignedUser.firstName||''} ${x.assignedUser.lastName||''}` : 'Unassigned'}</td>
        <td>{x.status}</td>
        <td><button className="secondary-button" onClick={()=>equipmentService.updateStatus(x.id,x.status==='OPERATIONAL'?'IN_MAINTENANCE':'OPERATIONAL').then(load)}>Toggle</button></td>
      </tr>)}</tbody></table>
    </div>
    {open&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.65)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
      <form className="panel" onSubmit={create} style={{width:520,padding:28}}>
        <h2>Register Equipment</h2>
        <input required style={INPUT} placeholder="Equipment name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
        <input style={INPUT} placeholder="Serial number" value={form.serialNumber} onChange={e=>setForm({...form,serialNumber:e.target.value})}/>
        <select style={INPUT} value={form.category} onChange={e=>setForm({...form,category:e.target.value})}><option>Heavy Machinery</option><option>Vehicle</option><option>Power Tool</option><option>Safety Gear</option></select>
        <input type="number" min="0" step="0.01" style={INPUT} placeholder="Daily cost ₹" value={form.dailyCost} onChange={e=>setForm({...form,dailyCost:e.target.value})}/>
        <select required style={INPUT} value={form.projectId} onChange={e=>setForm({...form,projectId:e.target.value})}><option value="">Select project</option>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
        <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:16}}><button type="button" className="secondary-button" onClick={()=>setOpen(false)}>Cancel</button><button className="primary-button">Register</button></div>
      </form>
    </div>}
  </div>;
}
