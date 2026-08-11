import { useEffect, useState } from 'react';
import { Package, Plus } from 'lucide-react';
import materialService from '../../services/materialService';
import projectService from '../../services/projectService';

export default function CompanyAdminMaterials() {
  const [materials,setMaterials]=useState([]); const [projects,setProjects]=useState([]); const [open,setOpen]=useState(false);
  const [form,setForm]=useState({name:'',unit:'Tons',quantity:'0',reorderLevel:'0',unitCost:'0',projectId:''});
  const load=async()=>{setMaterials(await materialService.list());setProjects(await projectService.list());}; useEffect(()=>{load();},[]);
  const create=async e=>{e.preventDefault();await materialService.create({name:form.name,unit:form.unit,quantity:Number(form.quantity),reorderLevel:Number(form.reorderLevel),unitCost:Number(form.unitCost),project:{id:Number(form.projectId)}});setOpen(false);await load();};
  return <div className="dashboard-page"><section className="hero-row"><div><p className="eyebrow"><Package size={14}/> Materials</p></div><button className="primary-button" onClick={()=>setOpen(true)}><Plus size={16}/> Add Material</button></section>
    <div className="panel" style={{marginTop:20,padding:0,overflow:'auto'}}><table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr><th>Material</th><th>Project</th><th>Stock</th><th>Reorder</th><th>Status</th><th></th></tr></thead><tbody>
    {materials.map(m=><tr key={m.id}><td>{m.name}</td><td>{m.project?.name}</td><td>{m.quantity} {m.unit}</td><td>{m.reorderLevel}</td><td>{m.status}</td><td><button className="secondary-button" onClick={()=>materialService.receive(m.id,{quantity:1,unitCost:m.unitCost,notes:'Manual receipt'}).then(load)}>+1</button></td></tr>)}
    </tbody></table></div>
    {open&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.65)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}><form className="panel" onSubmit={create} style={{width:520,padding:28}}>
      <h2>Add Material</h2><input required placeholder="Material name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
      <input placeholder="Unit (Tons, m³, Rolls)" value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})}/><input type="number" min="0" value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})}/>
      <input type="number" min="0" value={form.reorderLevel} onChange={e=>setForm({...form,reorderLevel:e.target.value})}/><input type="number" min="0" step=".01" value={form.unitCost} onChange={e=>setForm({...form,unitCost:e.target.value})}/>
      <select required value={form.projectId} onChange={e=>setForm({...form,projectId:e.target.value})}><option value="">Select project</option>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
      <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:16}}><button type="button" className="secondary-button" onClick={()=>setOpen(false)}>Cancel</button><button className="primary-button">Save</button></div>
    </form></div>}
  </div>;
}
