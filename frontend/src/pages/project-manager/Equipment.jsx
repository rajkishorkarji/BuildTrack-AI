import { useEffect, useState } from 'react';
import { ShieldCheck, Wrench } from 'lucide-react';
import equipmentService from '../../services/equipmentService';

export default function PMEquipment() {
  const [equipment,setEquipment]=useState([]);
  useEffect(()=>{equipmentService.list().then(setEquipment).catch(()=>setEquipment([]));},[]);
  return <div className="dashboard-page">
    <section className="hero-row"><div><p className="eyebrow"><ShieldCheck size={14}/> Equipment</p></div></section>
    <div className="panel" style={{marginTop:20,padding:0,overflow:'auto'}}><table style={{width:'100%',borderCollapse:'collapse'}}>
      <thead><tr><th>Equipment</th><th>Category</th><th>Project</th><th>Status</th><th>Next Service</th></tr></thead>
      <tbody>{equipment.map(e=><tr key={e.id}><td><Wrench size={14}/> {e.name}</td><td>{e.category}</td><td>{e.project?.name||'—'}</td><td>{e.status}</td><td>{e.nextServiceDue||'—'}</td></tr>)}</tbody>
    </table></div>
  </div>;
}
