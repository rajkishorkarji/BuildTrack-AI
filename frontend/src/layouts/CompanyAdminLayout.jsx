import { Outlet } from 'react-router-dom';
import CompanyAdminSidebar from '../components/layout/sidebars/CompanyAdminSidebar';
import Topbar from '../components/layout/Topbar';

export default function CompanyAdminLayout() {
  return (
    <div className="app-shell company-admin-shell">
      <CompanyAdminSidebar />
      <div className="content-shell">
        <Topbar />
        <main className="content-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
