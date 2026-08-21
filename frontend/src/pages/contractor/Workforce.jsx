import { useEffect, useState } from 'react';
import { Users, Search, Mail, Phone, FolderKanban } from 'lucide-react';
import workforceService from '../../services/workforceService';

const label=r=>(r||'').replaceAll('_',' ').toLowerCase().replace(/\b\w/g,c=>c.toUpperCase());
export default function ContractorWorkforce(){
 const [members,setMembers]=useState([]),[search,setSearch]=useState(''),[loading,setLoading]=useState(true),[error,setError]=useState('');
 useEffect(()=>{workforceService.list().then(setMembers).catch(e=>setError(e.response?.data?.message||'Unable to load contractor team')).finally(()=>setLoading(false));},[]);
 const filtered=members.filter(m=>(m.fullName||'').toLowerCase().includes(search.toLowerCase())||(m.role||'').toLowerCase().includes(search.toLowerCase()));
 return <div className="dashboard-page"><section className="hero-row"><div><p className="eyebrow"><Users size={14}/> Workforce</p></div></section>{error&&<div className="panel" style={{marginTop:16,color:'var(--red)'}}>{error}</div>}<div className="panel" style={{marginTop:16,padding:14}}><div className="search-box" style={{width:320}}><Search size={14}/><input placeholder="Search assigned team..." value={search} onChange={e=>setSearch(e.target.value)}/></div></div><div className="panel" style={{marginTop:16,padding:0,overflow:'auto'}}>{loading?'Loading…':<table className="data-table"><thead><tr><th>Name</th><th>Role</th><th>Contact</th><th>Projects</th><th>Status</th></tr></thead><tbody>{filtered.map(m=><tr key={m.userId}><td>{m.fullName}</td><td>{label(m.role)}</td><td><div><Mail size={12}/> {m.email}</div>{m.phone&&<div><Phone size={12}/> {m.phone}</div>}</td><td><FolderKanban size={12}/> {m.projects?.length||0}</td><td>{m.enabled?'Active':'Disabled'}</td></tr>)}</tbody></table>}</div></div>;
}
