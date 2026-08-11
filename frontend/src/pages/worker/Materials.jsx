import { useEffect, useState } from 'react';
import { Package } from 'lucide-react';
import materialService from '../../services/materialService';

export default function WorkerMaterials() {
  const [materials,setMaterials]=useState([]);
  useEffect(()=>{materialService.list().then(setMaterials).catch(()=>setMaterials([]));},[]);
  return <div className="dashboard-page"><section className="hero-row"><div><p className="eyebrow"><Package size={14}/> Materials</p></div></section>
    <div className="panel" style={{marginTop:20,padding:0,overflow:'auto'}}><table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr><th>Material</th><th>Project</th><th>Available</th><th>Status</th></tr></thead><tbody>{materials.map(m=><tr key={m.id}><td>{m.name}</td><td>{m.project?.name}</td><td>{m.quantity} {m.unit}</td><td>{m.status}</td></tr>)}</tbody></table></div>
  </div>;
}
