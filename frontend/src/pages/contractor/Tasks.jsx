import { useEffect, useState } from 'react';
import { CheckSquare, Search } from 'lucide-react';
import taskService from '../../services/taskService';

export default function ContractorTasks(){
 const [tasks,setTasks]=useState([]),[search,setSearch]=useState(''),[loading,setLoading]=useState(true);
 useEffect(()=>{taskService.list().then(setTasks).finally(()=>setLoading(false));},[]);
 const filtered=tasks.filter(t=>(t.title||'').toLowerCase().includes(search.toLowerCase())||(t.projectName||'').toLowerCase().includes(search.toLowerCase()));
 return <div className="dashboard-page"><section className="hero-row"><div><p className="eyebrow"><CheckSquare size={14}/> Tasks</p><h1>Assigned Work Orders</h1></div></section><div className="panel" style={{marginTop:16,padding:14}}><div className="search-box" style={{width:320}}><Search size={14}/><input placeholder="Search assigned work..." value={search} onChange={e=>setSearch(e.target.value)}/></div></div><div className="panel" style={{marginTop:16,padding:0,overflow:'auto'}}>{loading?'Loading…':<table className="data-table"><thead><tr><th>Task</th><th>Project</th><th>Priority</th><th>Progress</th><th>Status</th></tr></thead><tbody>{filtered.map(t=><tr key={t.id}><td>{t.title}</td><td>{t.projectName}</td><td>{t.priority}</td><td>{t.completionPercentage}%</td><td>{t.status}</td></tr>)}</tbody></table>}</div></div>;
}
