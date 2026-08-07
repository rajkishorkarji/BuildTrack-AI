import { Outlet } from 'react-router-dom';
import ProjectManagerSidebar from '../components/layout/sidebars/ProjectManagerSidebar';
import Topbar from '../components/layout/Topbar';

export default function ProjectManagerLayout() {
  return (
    <div className="app-shell project-manager-shell">
      <ProjectManagerSidebar />
      <div className="content-shell">
        <Topbar />
        <main className="content-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
