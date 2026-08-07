import { Outlet } from 'react-router-dom';
import SiteEngineerSidebar from '../components/layout/sidebars/SiteEngineerSidebar';
import Topbar from '../components/layout/Topbar';

export default function SiteEngineerLayout() {
  return (
    <div className="app-shell site-engineer-shell">
      <SiteEngineerSidebar />
      <div className="content-shell">
        <Topbar />
        <main className="content-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
