import { Outlet } from 'react-router-dom';
import UnifiedNavbar from './UnifiedNavbar';

const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <UnifiedNavbar />
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;
