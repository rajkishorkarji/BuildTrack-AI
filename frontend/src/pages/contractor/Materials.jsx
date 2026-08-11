import { useEffect, useState } from 'react';
import { Package } from 'lucide-react';
import materialService from '../../services/materialService';

export default function ContractorMaterials() {
  const [materials,setMaterials]=useState([]);
  const [notice,setNotice]=useState('');
  const load=()=>materialService.list().then(setMaterials).catch(()=>setMaterials([]));
  useEffect(load,[]);
  const receive=async m=>{
    try { await materialService.receive(m.id,{quantity:1,unitCost:m.unitCost,notes:'Contractor receipt'}); setNotice(`Received 1 ${m.unit} of ${m.name}`); load(); }
    catch(e){ setNotice(e?.response?.data?.message||'Unable to receive material'); }
  };
  const issue=async m=>{
    try { await materialService.issue(m.id,{quantity:1,unitCost:m.unitCost,notes:'Contractor consumption'}); setNotice(`Issued 1 ${m.unit} of ${m.name}`); load(); }
    catch(e){ setNotice(e?.response?.data?.message||'Unable to issue material'); }
  };
  return <div className="dashboard-page">
    <section className="hero-row"><div><p className="eyebrow"><Package size={14}/> Materials</p></div></section>
    {notice&&<div className="panel" style={{marginTop:16}}>{notice}</div>}
    <div className="panel" style={{marginTop:20,padding:0,overflow:'auto'}}>
      <table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr><th>Material</th><th>Project</th><th>Available</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>{materials.map(m=><tr key={m.id}><td>{m.name}</td><td>{m.project?.name||'—'}</td><td>{m.quantity} {m.unit}</td><td>{m.status}</td><td><button className="secondary-button" onClick={()=>receive(m)}>Receive 1</button> <button className="secondary-button" onClick={()=>issue(m)}>Issue 1</button></td></tr>)}</tbody>
      </table>
    </div>
  </div>;
}
