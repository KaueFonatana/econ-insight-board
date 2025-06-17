
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 lg:pl-0">
        <main className="min-h-screen p-4 lg:p-8 lg:ml-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
