import { useEffect, useState } from 'react';
import api from '../../services/api';
export default function CompanyAdminTaskManagement(){
 const [tasks,setTasks]=useState([]); const [loading,setLoading]=useState(true);
 useEffect(()=>{api.get('/tasks').then(r=>setTasks(r.data?.data||[])).finally(()=>setLoading(false));},[]);
 return <div className="page-content"><div className="page-header"><div><h1>Task Management</h1><p>Monitor company project tasks and progress.</p></div></div><div className="panel">{loading?'Loading…':<table className="data-table"><thead><tr><th>Task</th><th>Project</th><th>Status</th><th>Progress</th><th>Due</th></tr></thead><tbody>{tasks.map(t=><tr key={t.id}><td>{t.title||'—'}</td><td>{t.project?.name||t.project||'—'}</td><td>{t.status||'—'}</td><td>{t.completionPercentage??t.progress??0}%</td><td>{t.dueDate||'—'}</td></tr>)}</tbody></table>}</div></div>;
}
