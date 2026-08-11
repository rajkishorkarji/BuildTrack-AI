import { NavLink } from 'react-router-dom';
import { FolderKanban, Users, CheckSquare, FileText, Wrench, Bell, LayoutDashboard, Settings, ChevronRight, ClipboardList } from 'lucide-react';
const menuItems = [
  ['/dashboard','Dashboard',LayoutDashboard], ['/projects','Projects',FolderKanban], ['/task-management','Task Management',CheckSquare],
  ['/site-workforce','Team',Users], ['/daily-report','Daily Logs',ClipboardList], ['/equipment','Equipment',Wrench], ['/reports','Reports',FileText],
  ['/documents','Documents',FileText], ['/notifications','Notifications',Bell], ['/settings','Settings',Settings],
];
export default function ProjectManagerSidebar(){return <aside className="sidebar"><div className="sidebar-brand"><img src="/logo-brand.svg" alt="BuildTrack AI" className="brand-logo-full"/></div><nav className="sidebar-nav">{menuItems.map(([to,label,Icon])=><NavLink key={to} to={to} className={({isActive})=>`nav-item ${isActive?'active':''}`}><Icon size={18} className="nav-icon"/><span className="nav-label">{label}</span><ChevronRight size={14} className="nav-arrow"/></NavLink>)}</nav></aside>}
