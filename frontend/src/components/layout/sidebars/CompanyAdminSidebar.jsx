import { NavLink } from 'react-router-dom';
import { FolderKanban, Users, Clock3, CheckSquare, Wrench, Receipt, FileText, Bell, LayoutDashboard, Settings, Bot, ChevronRight } from 'lucide-react';

const menuItems = [
  ['/dashboard', 'Dashboard', LayoutDashboard],
  ['/projects', 'Projects', FolderKanban],
  ['/workforce', 'Workforce', Users],
  ['/attendance', 'Attendance', Clock3],
  ['/task-management', 'Task Management', CheckSquare],
  ['/equipment', 'Equipment', Wrench],
  ['/finance', 'Finance', Receipt],
  ['/reports', 'Reports', FileText],
  ['/documents', 'Documents', FileText],
  ['/notifications', 'Notifications', Bell],
  ['/ai-insights', 'AI Insights', Bot],
  ['/settings', 'Settings', Settings],
];

export default function CompanyAdminSidebar() {
  return <aside className="sidebar"><div className="sidebar-brand"><img src="/logo-brand.svg" alt="BuildTrack AI" className="brand-logo-full" /></div><nav className="sidebar-nav">{menuItems.map(([to,label,Icon]) => <NavLink key={to} to={to} className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}><Icon size={18} className="nav-icon"/><span className="nav-label">{label}</span><ChevronRight size={14} className="nav-arrow"/></NavLink>)}</nav></aside>;
}
