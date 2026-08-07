import { Outlet } from 'react-router-dom';
import ContractorSidebar from '../components/layout/sidebars/ContractorSidebar';
import Topbar from '../components/layout/Topbar';

export default function ContractorLayout() {
  return (
    <div className="app-shell contractor-shell">
      <ContractorSidebar />
      <div className="content-shell">
        <Topbar />
        <main className="content-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
