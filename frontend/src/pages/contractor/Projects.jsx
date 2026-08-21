import { useEffect, useState } from 'react';
import { FolderKanban, MapPin, Calendar } from 'lucide-react';
import projectService from '../../services/projectService';
import { formatINR } from '../../utils/currency';

export default function ContractorProjects() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => { projectService.list().then(setProjects).catch(e => setError(e.response?.data?.message || 'Unable to load assigned projects')); }, []);
  return <div className="dashboard-page"><section className="hero-row"><div><p className="eyebrow"><FolderKanban size={14}/> Assigned Projects</p></div></section>{error&&<div className="panel" style={{color:'var(--orange)',marginBottom:16}}>{error}</div>}<div className="panel" style={{padding:0,overflow:'hidden'}}><table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr style={{background:'var(--panel-soft)'}}><th style={{padding:14,textAlign:'left'}}>Project</th><th style={{padding:14,textAlign:'left'}}>Location</th><th style={{padding:14,textAlign:'left'}}>Dates</th><th style={{padding:14,textAlign:'left'}}>Budget</th><th style={{padding:14,textAlign:'left'}}>Progress</th></tr></thead><tbody>{projects.map(p=><tr key={p.id} style={{borderTop:'1px solid var(--border)'}}><td style={{padding:14}}><strong>{p.name}</strong><div style={{fontSize:11,color:'var(--blue)'}}>{p.code}</div></td><td style={{padding:14}}><span style={{display:'flex',gap:5}}><MapPin size={14}/>{p.location||'—'}</span></td><td style={{padding:14}}><span style={{display:'flex',gap:5}}><Calendar size={14}/>{p.startDate||'—'} → {p.estEndDate||'—'}</span></td><td style={{padding:14,fontWeight:700}}>{formatINR(p.budget)}</td><td style={{padding:14}}>{p.progressPercentage||0}%</td></tr>)}{projects.length===0&&<tr><td colSpan="5" style={{padding:35,textAlign:'center',color:'var(--muted)'}}>No assigned projects.</td></tr>}</tbody></table></div></div>;
}
