import { useEffect, useState } from 'react';
import { FolderKanban, MapPin, Calendar, Users } from 'lucide-react';
import projectService from '../../services/projectService';
import { formatINR } from '../../utils/currency';

export default function ProjectManagerProjects() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => { projectService.list().then(setProjects).catch(e => setError(e.response?.data?.message || 'Unable to load assigned projects')); }, []);
  return <div className="dashboard-page">
    <section className="hero-row"><div><p className="eyebrow"><FolderKanban size={14}/> Projects</p><h1>My Assigned Projects</h1><p>Only projects assigned to your account are returned by the backend.</p></div></section>
    {error && <div className="panel" style={{color:'var(--orange)',marginBottom:16}}>{error}</div>}
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:16}}>{projects.map(p=><article className="panel" key={p.id} style={{padding:20}}><div style={{display:'flex',justifyContent:'space-between'}}><div><h3>{p.name}</h3><small style={{color:'var(--blue)'}}>{p.code}</small></div><span>{p.status}</span></div><p style={{color:'var(--muted)',display:'flex',gap:6}}><MapPin size={15}/>{p.location || 'No location'}</p><p style={{color:'var(--muted)',display:'flex',gap:6}}><Calendar size={15}/>{p.startDate || '—'} → {p.estEndDate || '—'}</p><div style={{display:'flex',justifyContent:'space-between',marginTop:16}}><strong>{formatINR(p.budget)}</strong><span><Users size={14}/> {p.assignments?.length || 0}</span></div><div style={{marginTop:12,height:7,background:'var(--panel-soft)',borderRadius:4}}><div style={{width:`${p.progressPercentage || 0}%`,height:'100%',background:'var(--blue)',borderRadius:4}}/></div></article>)}</div>
  </div>;
}
