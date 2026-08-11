import { useEffect, useState } from 'react';
import dashboardService from '../../services/dashboardService';

export default function ProjectProgress() {
  const [projects,setProjects]=useState([]);
  useEffect(()=>{dashboardService.getProjectProgress().then(setProjects).catch(()=>setProjects([]));},[]);
  return <article className="panel progress-panel"><div className="panel-header"><div><h3>Project Progress</h3><p>Budget vs actual cost</p></div><div className="legend"><span>Budget</span><span>Actual</span><span>Done %</span></div></div><div className="progress-list">{projects.map((project,i)=>{const value=Number(project.progressPercentage ?? project.progress ?? project.value ?? 0);return <div key={project.id||project.name||i} className="progress-row"><div className="progress-meta"><strong>{project.name}</strong><span>{value}%</span></div><div className="progress-bars"><div className="bar bar-budget" style={{width:`${Math.min(100,value+16)}%`}}/><div className="bar bar-actual" style={{width:`${Math.min(100,value)}%`}}/><div className="bar bar-done" style={{width:`${Math.min(100,value)}%`}}/></div></div>})}</div></article>;
}
