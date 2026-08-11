import { useEffect, useState } from 'react';
import { Wrench, ShieldCheck } from 'lucide-react';
import equipmentService from '../../services/equipmentService';

export default function SEEquipment() {
  const [equipment,setEquipment]=useState([]);
  const [notice,setNotice]=useState('');
  useEffect(()=>{equipmentService.list().then(setEquipment).catch(()=>setEquipment([]));},[]);
  const service=async item=>{
    try{await equipmentService.scheduleMaintenance(item.id,{serviceDate:new Date().toISOString().slice(0,10),nextDueDate:item.nextServiceDue,serviceType:'SITE_INSPECTION',cost:0,notes:'Maintenance requested from site'});setNotice(`Maintenance recorded for ${item.name}`);setEquipment(await equipmentService.list());}
    catch(e){setNotice(e?.response?.data?.message||'Unable to request maintenance');}
  };
  return <div className="dashboard-page"><section className="hero-row"><div><p className="eyebrow"><ShieldCheck size={14}/> Equipment</p></div></section>
    {notice&&<div className="panel" style={{marginTop:16}}>{notice}</div>}
    <div className="panel" style={{marginTop:20,padding:0,overflow:'auto'}}><table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr><th>Equipment</th><th>Project</th><th>Status</th><th>Next Service</th><th></th></tr></thead><tbody>
    {equipment.map(e=><tr key={e.id}><td><Wrench size={14}/> {e.name}</td><td>{e.project?.name||'—'}</td><td>{e.status}</td><td>{e.nextServiceDue||'—'}</td><td><button className="secondary-button" onClick={()=>service(e)}>Request Service</button></td></tr>)}
    </tbody></table></div></div>;
}
