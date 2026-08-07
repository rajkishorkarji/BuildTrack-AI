import { Outlet } from 'react-router-dom';
import WorkerSidebar from '../components/layout/sidebars/WorkerSidebar';
import Topbar from '../components/layout/Topbar';

export default function WorkerLayout() {
  return (
    <div className="app-shell worker-shell">
      <WorkerSidebar />
      <div className="content-shell">
        <Topbar />
        <main className="content-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
