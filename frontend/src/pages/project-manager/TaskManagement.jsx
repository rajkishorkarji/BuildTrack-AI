import { useEffect, useState } from 'react';
import { CheckSquare, Plus, Search } from 'lucide-react';
import taskService from '../../services/taskService';
import projectService from '../../services/projectService';

const INPUT={width:'100%',padding:'10px 12px',borderRadius:8,border:'1px solid var(--border)',background:'var(--panel)',color:'var(--text)',fontSize:13};

export default function PMTaskManagement(){
 const [tasks,setTasks]=useState([]),[projects,setProjects]=useState([]),[members,setMembers]=useState([]);
 const [search,setSearch]=useState(''),[show,setShow]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState('');
 const [form,setForm]=useState({projectId:'',title:'',description:'',priority:'MEDIUM',dueDate:'',assigneeUserId:''});
 const load=()=>Promise.all([taskService.list(),projectService.list()]).then(([t,p])=>{setTasks(t);setProjects(p);setForm(f=>({...f,projectId:f.projectId||p[0]?.id||''}));}).catch(e=>setError(e.response?.data?.message||'Unable to load tasks')).finally(()=>setLoading(false));
 useEffect(()=>{load();},[]);
 const filtered=tasks.filter(t=>(t.title||'').toLowerCase().includes(search.toLowerCase())||(t.projectName||'').toLowerCase().includes(search.toLowerCase()));
 const create=async e=>{e.preventDefault();setError('');try{const saved=await taskService.create({...form,projectId:Number(form.projectId),assigneeUserId:form.assigneeUserId?Number(form.assigneeUserId):null});setTasks(v=>[saved,...v]);setShow(false);setForm(f=>({...f,title:'',description:'',priority:'MEDIUM',dueDate:'',assigneeUserId:''}));}catch(err){setError(err.response?.data?.message||'Unable to create task');}};
 return <div className="dashboard-page">
  <section className="hero-row"><div><p className="eyebrow"><CheckSquare size={14}/> Tasks</p><h1>Project Tasks</h1></div><button className="primary-button" onClick={()=>setShow(true)}><Plus size={16}/> Create Task</button></section>
  {error&&<div className="panel" style={{marginTop:16,color:'var(--red)'}}>{error}</div>}
  <div className="panel" style={{marginTop:16,padding:14}}><div className="search-box" style={{width:320}}><Search size={14}/><input placeholder="Search tasks or projects..." value={search} onChange={e=>setSearch(e.target.value)}/></div></div>
  <div className="panel" style={{marginTop:16,padding:0,overflow:'auto'}}>{loading?'Loading…':<table className="data-table"><thead><tr><th>Task</th><th>Project</th><th>Assignee</th><th>Priority</th><th>Progress</th><th>Status</th><th>Due</th></tr></thead><tbody>{filtered.map(t=><tr key={t.id}><td>{t.title}</td><td>{t.projectName}</td><td>{t.assigneeName||'Unassigned'}</td><td>{t.priority}</td><td>{t.completionPercentage}%</td><td>{t.status}</td><td>{t.dueDate||'—'}</td></tr>)}</tbody></table>}</div>
  {show&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.65)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:20}}><form className="panel" onSubmit={create} style={{width:'100%',maxWidth:520,padding:24,display:'grid',gap:12}}><h2>Create Project Task</h2><select required style={INPUT} value={form.projectId} onChange={e=>setForm({...form,projectId:e.target.value})}><option value="">Select project</option>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select><input required style={INPUT} placeholder="Task title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/><textarea style={{...INPUT,minHeight:90}} placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}><select style={INPUT} value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option></select><input type="date" style={INPUT} value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})}/></div><div style={{display:'flex',justifyContent:'flex-end',gap:10}}><button type="button" className="secondary-button" onClick={()=>setShow(false)}>Cancel</button><button className="primary-button">Create Task</button></div></form></div>}
 </div>;
}
