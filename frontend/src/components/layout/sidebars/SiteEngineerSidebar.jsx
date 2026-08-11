import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Clock3, Wrench, Package, AlertTriangle, Bell, Settings, CheckSquare, ChevronRight } from 'lucide-react';
const menuItems = [
  ['/dashboard','Dashboard',LayoutDashboard], ['/daily-report','Daily Logs',FileText], ['/task-management','Tasks',CheckSquare], ['/attendance','Attendance',Clock3], ['/equipment','Equipment',Wrench],
  ['/materials','Materials',Package], ['/safety','Issues',AlertTriangle], ['/documents','Documents',FileText], ['/notifications','Notifications',Bell], ['/settings','Settings',Settings],
];
export default function SiteEngineerSidebar(){return <aside className="sidebar"><div className="sidebar-brand"><img src="/logo-brand.svg" alt="BuildTrack AI" className="brand-logo-full"/></div><nav className="sidebar-nav">{menuItems.map(([to,label,Icon])=><NavLink key={to} to={to} className={({isActive})=>`nav-item ${isActive?'active':''}`}><Icon size={18} className="nav-icon"/><span className="nav-label">{label}</span><ChevronRight size={14} className="nav-arrow"/></NavLink>)}</nav></aside>}
