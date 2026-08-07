import { useAuth } from '../context/AuthContext';
import SuperAdminLayout from './SuperAdminLayout';
import CompanyAdminLayout from './CompanyAdminLayout';
import ProjectManagerLayout from './ProjectManagerLayout';
import SiteEngineerLayout from './SiteEngineerLayout';
import ContractorLayout from './ContractorLayout';
import WorkerLayout from './WorkerLayout';

export default function DashboardLayout() {
  const { user } = useAuth();
  const rawRole = (user?.role || 'SUPER_ADMIN').toUpperCase().replace(/[\s-]/g, '_');

  switch (rawRole) {
    case 'SUPER_ADMIN':
      return <SuperAdminLayout />;
    case 'COMPANY_ADMIN':
    case 'COMPANY_MANAGER':
      return <CompanyAdminLayout />;
    case 'PROJECT_MANAGER':
      return <ProjectManagerLayout />;
    case 'SITE_ENGINEER':
    case 'SITE_SUPERVISOR':
      return <SiteEngineerLayout />;
    case 'CONTRACTOR':
      return <ContractorLayout />;
    case 'WORKER':
      return <WorkerLayout />;
    default:
      return <SuperAdminLayout />;
  }
}