import { Outlet } from 'react-router-dom';
import SuperAdminSidebar from '../components/layout/sidebars/SuperAdminSidebar';
import Topbar from '../components/layout/Topbar';

export default function SuperAdminLayout() {
  return (
    <div className="app-shell super-admin-shell">
      <SuperAdminSidebar />
      <div className="content-shell">
        <Topbar />
        <main className="content-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
