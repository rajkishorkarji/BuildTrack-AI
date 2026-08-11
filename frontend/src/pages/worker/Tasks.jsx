import { useEffect, useState } from 'react';
import { CheckSquare, Search, Play } from 'lucide-react';
import taskService from '../../services/taskService';

export default function WorkerTasks(){
 const [tasks,setTasks]=useState([]),[search,setSearch]=useState(''),[loading,setLoading]=useState(true),[error,setError]=useState('');
 useEffect(()=>{taskService.list().then(setTasks).catch(e=>setError(e.response?.data?.message||'Unable to load tasks')).finally(()=>setLoading(false));},[]);
 const start=async id=>{try{const updated=await taskService.updateProgress(id,{progress:1,status:'IN_PROGRESS'});setTasks(v=>v.map(t=>t.id===id?updated:t));}catch(e){setError(e.response?.data?.message||'Unable to update task');}};
 const filtered=tasks.filter(t=>(t.title||'').toLowerCase().includes(search.toLowerCase())||(t.projectName||'').toLowerCase().includes(search.toLowerCase()));
 return <div className="dashboard-page"><section className="hero-row"><div><p className="eyebrow"><CheckSquare size={14}/> My Tasks</p><h1>Assigned Tasks</h1></div></section>{error&&<div className="panel" style={{marginTop:16,color:'var(--red)'}}>{error}</div>}<div className="panel" style={{marginTop:16,padding:14}}><div className="search-box" style={{width:320}}><Search size={14}/><input placeholder="Search task or project..." value={search} onChange={e=>setSearch(e.target.value)}/></div></div><div className="panel" style={{marginTop:16,padding:0,overflow:'auto'}}>{loading?'Loading…':<table className="data-table"><thead><tr><th>Task</th><th>Project</th><th>Priority</th><th>Progress</th><th>Status</th><th>Action</th></tr></thead><tbody>{filtered.map(t=><tr key={t.id}><td>{t.title}</td><td>{t.projectName}</td><td>{t.priority}</td><td>{t.completionPercentage}%</td><td>{t.status}</td><td>{t.status==='TODO'&&<button className="primary-button" style={{padding:'6px 10px',fontSize:12}} onClick={()=>start(t.id)}><Play size={13}/> Start</button>}</td></tr>)}</tbody></table>}</div></div>;
}
